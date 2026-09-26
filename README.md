# focusonlineshop
FOCUS Ecommerce Platform

## Supabase product uploads

1. Install dependencies with `npm install`, then copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The anon key is intended for browser use; never put a Supabase service-role key in this app.
2. In the Supabase SQL Editor, run [`supabase/product-upload-setup.sql`](supabase/product-upload-setup.sql). This creates the products, store-packages, and orders tables, the public product-images bucket, and row-level security policies. If you ran an earlier version, run this updated script again to create the missing tables and update storefront reads.
3. Create the administrator using Supabase Authentication with email and password. An Auth account by itself is not an admin: copy that user's UUID and run this in the Supabase SQL Editor (the admin sign-in screen also shows the exact statement for the current user):

	```sql
	insert into public.admin_users (user_id) values ('ADMIN_AUTH_USER_UUID') on conflict do nothing;
	```

4. Start the app with `npm run dev`. Opening `/#/admin` now shows sign-in first; the dashboard only appears after both Supabase Auth and the admin allowlist check succeed. If login succeeds but access is denied, run the updated SQL setup and add the Auth user's UUID as above.
5. Guest and signed-in checkout orders are saved to Supabase and appear in the admin Orders section. Order reads/updates are restricted to admins; public checkout can only insert pending orders.

Product and store-package writes and image uploads are restricted by row-level security to UUIDs in `public.admin_users`. Do not disable RLS or add anonymous write policies. Admins create customer bundles from the Packages dashboard section; available bundles are shown on the homepage and customer Packages page.

## Paystack test checkout

1. Set `VITE_PAYSTACK_PUBLIC_KEY` in `.env.local` to the public test key from Paystack.
2. Deploy `supabase/functions/verify-paystack-payment/index.ts` to this Supabase project with `supabase functions deploy verify-paystack-payment`.
3. Set `PAYSTACK_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in Supabase Edge Function secrets (the Supabase URL is provided automatically in deployed Edge Functions). Never put either secret in `.env.local`, Vite variables, or the browser.
4. Restart the Vite server. Checkout now offers Paystack and pay-on-pickup; it checks that the verifier is deployed before opening Paystack and only records a Paystack payment as paid after server verification.

This is a test integration. Before live payments, move cart price calculation and durable order creation to a trusted server endpoint; the current demo catalog and order records are still partly client-side.
# focus-online-shop
