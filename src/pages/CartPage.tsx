import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck, Tag, ShieldCheck, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getProductById, formatPrice, deliveryZones } from '../data/store';
import { ProductArtwork } from '../components/Products';
import PaystackPop from '@paystack/inline-js';
import { saveSupabaseOrder, supabase } from '../lib/supabase';

const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;

export function CartPage() {
  const { state, updateCartQuantity, removeFromCart, clearCart } = useApp();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [selectedZone, setSelectedZone] = useState(deliveryZones[0]?.id || '');

  const cartItems = state.cart.map(item => {
    const product = getProductById(item.productId);
    return { ...item, product };
  }).filter(item => item.product);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.unitPrice ?? item.product!.salePrice ?? item.product!.price;
    return sum + price * item.quantity;
  }, 0);

  const discount = couponApplied ? subtotal * 0.05 : 0;
  const deliveryFee = deliveryMethod === 'delivery' ? (deliveryZones.find(z => z.id === selectedZone)?.fee || 0) : 0;
  const total = subtotal - discount + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/shop" className="bg-[#f5a623] hover:bg-[#e09500] text-[#1e3a5f] font-bold px-8 py-3 rounded-full inline-flex items-center gap-2 transition-colors">
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-8">Shopping Cart ({cartItems.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => {
            const price = item.unitPrice ?? item.product!.salePrice ?? item.product!.price;
            return (
              <div key={item.cartItemId || item.productId} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                <Link to={`/product/${item.product!.slug}`} className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ProductArtwork source={item.product!.images[0]} alt={item.product!.name} className="w-20 h-20 p-2 text-3xl" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product!.slug}`} className="font-semibold text-gray-800 hover:text-[#1e3a5f] text-sm line-clamp-2">
                    {item.product!.name}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{item.product!.sku}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateCartQuantity(item.productId, item.quantity - 1, item.cartItemId)} className="px-2.5 py-1.5 hover:bg-gray-50">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.productId, item.quantity + 1, item.cartItemId)} className="px-2.5 py-1.5 hover:bg-gray-50">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1e3a5f]">{formatPrice(price * item.quantity)}</p>
                      {item.quantity > 1 && <p className="text-xs text-gray-400">{formatPrice(price)} each</p>}
                    </div>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.productId, item.cartItemId)} className="text-gray-400 hover:text-red-500 self-start p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear Cart</button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h3 className="font-bold text-[#1e3a5f] text-lg mb-4">Order Summary</h3>

            {/* Delivery Method */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Delivery Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${deliveryMethod === 'pickup' ? 'border-[#f5a623] bg-[#f5a623]/10 text-[#1e3a5f]' : 'border-gray-200 text-gray-600'}`}
                >
                  🏪 Pickup
                </button>
                <button
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${deliveryMethod === 'delivery' ? 'border-[#f5a623] bg-[#f5a623]/10 text-[#1e3a5f]' : 'border-gray-200 text-gray-600'}`}
                >
                  🚚 Delivery
                </button>
              </div>
            </div>

            {deliveryMethod === 'delivery' && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Delivery Zone</label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                >
                  {deliveryZones.filter(z => z.active).map(z => (
                    <option key={z.id} value={z.id}>{z.name} — {formatPrice(z.fee)} ({z.estimatedDays})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Coupon */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
                <button
                  onClick={() => { if (couponCode.toLowerCase() === 'focus5') setCouponApplied(true); }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200"
                >
                  Apply
                </button>
              </div>
              {couponApplied && <p className="text-xs text-green-600 mt-1">✓ Coupon applied: 5% off</p>}
              <p className="text-[10px] text-gray-400 mt-1">Try: FOCUS5</p>
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount</span>
                  <span className="text-green-600 font-medium">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span className="font-medium">{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Free'}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
                <span className="text-[#1e3a5f]">Total</span>
                <span className="text-[#1e3a5f]">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-[#f5a623] hover:bg-[#e09500] text-[#1e3a5f] font-bold py-3.5 rounded-xl mt-6 transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <Link to="/shop" className="block text-center text-sm text-gray-500 hover:text-[#1e3a5f] mt-3">
              ← Continue Shopping
            </Link>

            <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure checkout • SSL encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckoutPage() {
  const { state, clearCart, dispatch } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: state.user?.fullName || '',
    phone: state.user?.phone || '',
    email: state.user?.email || '',
    address: state.user?.address || '',
    city: state.user?.city || '',
    notes: '',
    deliveryMethod: 'pickup' as 'pickup' | 'delivery',
    paymentMethod: 'pay_on_pickup' as 'paystack' | 'pay_on_pickup',
    deliveryZone: deliveryZones[0]?.id || '',
  });
  const [processing, setProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  const getOrderSaveError = (error: unknown) => {
    const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : String(error);
    if (/PGRST205|orders.*does not exist|schema cache/i.test(message)) {
      return 'Supabase order storage is not set up yet. Run the complete supabase/product-upload-setup.sql script in the Supabase SQL Editor, then try again.';
    }
    return message || 'Could not save your order. Please try again or contact the store.';
  };

  const cartItems = state.cart.map(item => {
    const product = getProductById(item.productId);
    return { ...item, product };
  }).filter(item => item.product);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.unitPrice ?? item.product!.salePrice ?? item.product!.price;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = formData.deliveryMethod === 'delivery' ? (deliveryZones.find(z => z.id === formData.deliveryZone)?.fee || 0) : 0;
  const total = subtotal + deliveryFee;

  const createOrderRecord = (paymentStatus: 'pending' | 'paid', paymentMethod: 'pay_on_pickup' | 'paystack', orderNumber = `FOC${Math.floor(1000 + Math.random() * 9000)}`) => {
    const now = new Date().toISOString();
    return {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: state.user?.id || 'guest',
      customerName: formData.fullName.trim(),
      customerPhone: formData.phone.trim(),
      customerEmail: formData.email.trim() || undefined,
      items: cartItems.map(item => ({
        productId: item.productId,
        productName: item.product!.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice ?? item.product!.salePrice ?? item.product!.price,
        totalPrice: (item.unitPrice ?? item.product!.salePrice ?? item.product!.price) * item.quantity,
        packageId: item.packageId,
      })),
      subtotal,
      discount: 0,
      deliveryFee,
      total,
      paymentStatus,
      paymentMethod,
      orderStatus: paymentStatus === 'paid' ? 'processing' as const : 'pending' as const,
      deliveryMethod: formData.deliveryMethod,
      address: formData.deliveryMethod === 'delivery' ? `${formData.address}, ${formData.city}` : '',
      notes: formData.notes,
      createdAt: now,
      updatedAt: now,
    };
  };

  const finishOrder = (order: Awaited<ReturnType<typeof saveSupabaseOrder>>) => {
    dispatch({ type: 'ADD_ORDER', order });
    clearCart();
    navigate(`/order-confirmation/${order.orderNumber}`);
  };

  const placeOrder = async (paymentMethod: 'pay_on_pickup' | 'paystack', orderNumber?: string) => {
    const order = createOrderRecord('pending', paymentMethod, orderNumber);
    const savedOrder = await saveSupabaseOrder(order);
    finishOrder(savedOrder);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentMessage('');
    if (formData.paymentMethod === 'paystack') {
      const supabaseClient = supabase;
      if (!paystackPublicKey || !supabaseClient) {
        setPaymentMessage('Paystack is not configured. Add its public key to the app environment and deploy the Supabase verifier.');
        return;
      }
      if (!formData.email) {
        setPaymentMessage('Enter an email address to continue with Paystack.');
        return;
      }
      setProcessing(true);
      const { data: readiness, error: readinessError } = await supabaseClient.functions.invoke('verify-paystack-payment', {
        body: { action: 'ready' },
      });
      if (readinessError || !readiness?.ready) {
        setProcessing(false);
        setPaymentMessage('Paystack is not ready yet. Deploy the verify-paystack-payment Supabase function and set PAYSTACK_SECRET_KEY in Supabase Function Secrets. No payment was started.');
        return;
      }

      const orderNumber = `FOC-${Date.now()}`;
      try {
        const pendingOrder = createOrderRecord('pending', 'paystack', orderNumber);
        await saveSupabaseOrder(pendingOrder);
        const paystack = new PaystackPop();
        paystack.newTransaction({
          key: paystackPublicKey,
          email: formData.email,
          amount: Math.round(total * 100),
          currency: 'GHS',
          reference: orderNumber,
          metadata: { orderNumber },
          onSuccess: async transaction => {
            const { data, error } = await supabaseClient.functions.invoke('verify-paystack-payment', {
              body: { action: 'verify', reference: transaction.reference },
            });
            if (error || !data?.verified) {
              setProcessing(false);
              setPaymentMessage(`Payment could not be verified. Keep reference ${transaction.reference} and contact the store before retrying.`);
              return;
            }
            if (data.orderNumber !== pendingOrder.orderNumber) {
              setProcessing(false);
              setPaymentMessage(`Payment was received but the order record could not be confirmed. Keep reference ${transaction.reference} and contact the store.`);
              return;
            }
            finishOrder({ ...pendingOrder, paymentStatus: 'paid', orderStatus: 'processing', updatedAt: new Date().toISOString() });
          },
          onCancel: () => {
            setProcessing(false);
            setPaymentMessage('Payment was cancelled. Your order has not been placed.');
          },
          onError: error => {
            setProcessing(false);
            setPaymentMessage(error.message || 'Paystack could not start this payment.');
          },
        });
      } catch (error) {
        setProcessing(false);
        setPaymentMessage(getOrderSaveError(error));
      }
      return;
    }
    setProcessing(true);
    try {
      await placeOrder('pay_on_pickup');
    } catch (error) {
      setProcessing(false);
      setPaymentMessage(getOrderSaveError(error));
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🛒</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some items to your cart before checking out.</p>
        <Link to="/shop" className="bg-[#f5a623] text-[#1e3a5f] font-bold px-6 py-3 rounded-xl inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name *</label>
                  <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number *</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623]" placeholder="024XXXXXXX" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">City/Area</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623]" />
                </div>
                {formData.deliveryMethod === 'delivery' && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Delivery Address *</label>
                    <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623]" />
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Additional Notes</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623]" rows={2} />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-4">Delivery Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setFormData({...formData, deliveryMethod: 'pickup'})} className={`p-4 rounded-xl border text-left transition-colors ${formData.deliveryMethod === 'pickup' ? 'border-[#f5a623] bg-[#f5a623]/5' : 'border-gray-200'}`}>
                  <p className="font-semibold text-sm">🏪 Store Pickup</p>
                  <p className="text-xs text-gray-500 mt-1">Free • Ready in 2 hours</p>
                </button>
                <button type="button" onClick={() => setFormData({...formData, deliveryMethod: 'delivery'})} className={`p-4 rounded-xl border text-left transition-colors ${formData.deliveryMethod === 'delivery' ? 'border-[#f5a623] bg-[#f5a623]/5' : 'border-gray-200'}`}>
                  <p className="font-semibold text-sm">🚚 Home Delivery</p>
                  <p className="text-xs text-gray-500 mt-1">From GH₵15 • 1-3 days</p>
                </button>
              </div>
              {formData.deliveryMethod === 'delivery' && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Select Zone</label>
                  <select value={formData.deliveryZone} onChange={e => setFormData({...formData, deliveryZone: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm">
                    {deliveryZones.filter(z => z.active).map(z => (
                      <option key={z.id} value={z.id}>{z.name} — {formatPrice(z.fee)} ({z.estimatedDays})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-4">Payment Method</h3>
              <div className="space-y-3">
                {[
                  { id: 'paystack', label: 'Pay online with Paystack', desc: 'Cards and Mobile Money, paid securely in GHS', disabled: false },
                  { id: 'pay_on_pickup', label: 'Place order, pay on pickup', desc: 'Payment is due when you collect', disabled: false },
                ].map(method => (
                  <label key={method.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${method.disabled ? 'cursor-not-allowed bg-gray-50 opacity-60' : 'cursor-pointer'} ${formData.paymentMethod === method.id ? 'border-[#f5a623] bg-[#f5a623]/5' : 'border-gray-200'}`}>
                    <input type="radio" name="payment" value={method.id} checked={formData.paymentMethod === method.id} disabled={method.disabled} onChange={e => setFormData({...formData, paymentMethod: e.target.value as 'paystack' | 'pay_on_pickup'})} className="text-[#f5a623] focus:ring-[#f5a623]" />
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{method.label}</p>
                      <p className="text-sm text-gray-600">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">Paystack orders are marked paid only after the server verifies the transaction. Pickup orders stay pending until collected and paid.</p>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-[#1e3a5f] mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.cartItemId || item.productId} className="flex items-center gap-3">
                    <ProductArtwork source={item.product!.images[0]} alt={item.product!.name} className="h-10 w-10 text-xl" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{item.product!.name}</p>
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold">{formatPrice((item.unitPrice ?? item.product!.salePrice ?? item.product!.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Free'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
                  <span className="text-[#1e3a5f]">Total</span>
                  <span className="text-[#1e3a5f]">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-[#f5a623] hover:bg-[#e09500] disabled:bg-gray-300 text-[#1e3a5f] font-bold py-3.5 rounded-xl mt-6 transition-colors flex items-center justify-center gap-2"
              >
                {processing ? (
                  <><span className="w-5 h-5 border-2 border-[#1e3a5f]/30 border-t-[#1e3a5f] rounded-full animate-spin"></span> Processing...</>
                ) : (
                  <>{formData.paymentMethod === 'paystack' ? 'Pay with Paystack' : 'Place Order'} — {formatPrice(total)}</>
                )}
              </button>
              {paymentMessage && <p role="alert" className="mt-3 text-sm text-red-700">{paymentMessage}</p>}

              <p className="text-[10px] text-gray-400 text-center mt-3">
                By placing this order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export function OrderConfirmationPage() {
  const { state } = useApp();
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const order = state.orders.find(o => o.orderNumber === orderNumber);

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Order not found</h2>
        <Link to="/" className="text-[#f5a623] mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  const whatsappMsg = encodeURIComponent(`Hello FOCUS, I just placed order ${order.orderNumber}.\n\nItems:\n${order.items.map(i => `- ${i.productName} × ${i.quantity}`).join('\n')}\n\nTotal: ${formatPrice(order.total)}`);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldCheck className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-2">Order Placed Successfully!</h1>
      <p className="text-gray-500 mb-8">Thank you for shopping with FOCUS</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-left mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#1e3a5f]">Order #{order.orderNumber}</h3>
          <span className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full capitalize">{order.orderStatus.replace('_', ' ')}</span>
        </div>
        
        <div className="space-y-2 border-t border-gray-100 pt-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.productName} × {item.quantity}</span>
              <span className="font-medium">{formatPrice(item.totalPrice)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-[#1e3a5f]">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
        <p className="mt-3 text-sm text-amber-800">
          Payment status: {order.paymentStatus}. {order.paymentMethod === 'paystack'
            ? 'Paystack payment verified.'
            : order.deliveryMethod === 'pickup'
              ? 'Payment is due at pickup.'
              : 'Please contact the store to arrange payment before delivery.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={`/track-order?id=${order.orderNumber}`} className="bg-[#1e3a5f] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#162d4a] transition-colors">
          Track Order
        </Link>
        <a
          href={`https://wa.me/233000000000?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" /> Chat with FOCUS
        </a>
        <Link to="/shop" className="border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
