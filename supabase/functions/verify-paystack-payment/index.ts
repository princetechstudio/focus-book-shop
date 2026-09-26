import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405);

  const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
  if (!secretKey) return jsonResponse({ error: 'Paystack server secret is not configured.' }, 503);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Supabase server credentials are not configured.' }, 503);
  }

  try {
    const body = await request.json();
    if (body.action === 'ready') return jsonResponse({ ready: true });

    const reference = typeof body.reference === 'string' ? body.reference : '';
    if (!reference) {
      return jsonResponse({ error: 'A transaction reference is required.' }, 400);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: pendingOrder, error: lookupError } = await adminClient
      .from('orders')
      .select('order_number, total, payment_status, payment_method')
      .eq('order_number', reference)
      .maybeSingle();

    if (lookupError || !pendingOrder) {
      return jsonResponse({ error: lookupError?.message || 'No order matches this payment reference.' }, 404);
    }
    if (pendingOrder.payment_status !== 'pending' || pendingOrder.payment_method !== 'paystack') {
      return jsonResponse({ error: 'This order is not awaiting Paystack payment.' }, 409);
    }
    const expectedAmount = Math.round(Number(pendingOrder.total) * 100);

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const result = await response.json();
    if (!response.ok || !result.status || !result.data) {
      return jsonResponse({ error: result.message || 'Paystack could not verify this transaction.' }, 502);
    }

    const transaction = result.data;
    const verified = transaction.status === 'success'
      && transaction.reference === reference
      && transaction.amount === expectedAmount
      && transaction.currency === 'GHS';

    let verifiedOrderNumber: string | null = null;
    if (verified) {
      const { data: savedOrder, error: orderError } = await adminClient
        .from('orders')
        .update({
          payment_status: 'paid',
          order_status: 'processing',
          payment_reference: reference,
          updated_at: new Date().toISOString(),
        })
        .eq('order_number', reference)
        .eq('payment_status', 'pending')
        .select('order_number')
        .maybeSingle();

      if (orderError || !savedOrder) {
        return jsonResponse({ error: orderError?.message || 'No pending order matched this payment reference.' }, 409);
      }
      verifiedOrderNumber = savedOrder.order_number;
    }

    return jsonResponse({
      verified,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      orderNumber: verifiedOrderNumber,
    });
  } catch {
    return jsonResponse({ error: 'Unable to verify the Paystack transaction.' }, 500);
  }
});