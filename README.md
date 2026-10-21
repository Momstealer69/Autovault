# AutoVault

Premium automotive service discovery and vehicle ownership frontend using React, Vite, TypeScript, Tailwind CSS 4, React Router, Lucide, Framer Motion (available for follow-up UI work), and Recharts (available for analytics screens). Supabase provides Auth, Postgres, Storage, and Edge Functions. Razorpay is the only configured payment gateway.

## Run locally

1. Install Node.js 20.19+ or 22.12+.
2. Copy `.env.example` to `.env.local` only if you are connecting Supabase. Studio discovery uses bundled directory data and does not require a Maps integration.
3. Run `npm install`, `npm run dev`. `npm run build` checks TypeScript and produces the deployable bundle.
4. Apply `supabase/migrations/202610210001_core.sql` with the Supabase CLI (`supabase db push`) or SQL editor.
5. Deploy Edge Functions and set secrets:

```sh
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy razorpay-webhook --no-verify-jwt
supabase secrets set RAZORPAY_KEY_ID=... RAZORPAY_KEY_SECRET=... RAZORPAY_WEBHOOK_SECRET=...
```

Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` through Supabase's Edge Function runtime (the CLI/project supplies the Supabase values). Never put the Razorpay secret or service-role key in Vite variables. Configure a Razorpay webhook for `payment.captured` and `payment.failed`, pointing to the deployed `razorpay-webhook` endpoint. Add the Edge Function `verify-razorpay-payment` URL and Razorpay Checkout script to the booking UI before taking payments.

## Included now

- Responsive premium dark-first landing, searchable directory of real studios with sourced photos and direct links, plus a browser-local vehicle garage that needs no sign-in.
- Supabase client configuration, auth profile trigger, core database tables, RLS policies, private vehicle storage bucket policy, and an advisory-locked booking hold RPC. The RPC accepts only the package's server-stored price and serializes competing reservations for a business.
- Razorpay server-side order creation, checkout-signature validation plus provider-side captured-payment lookup, and signed webhook handling. Amount, INR currency, booking ownership, payment idempotency, and hold expiry are checked server-side.
- Studio listings are compiled from public business websites and linked to their sources. AutoVault has not independently verified these businesses or the current status of their details.

## Before launch

This is a substantial product scaffold, not a fully launch-ready marketplace. No Supabase or Razorpay account credentials were supplied, so database migrations, RLS behavior, edge functions, payment callbacks, and email verification have not been exercised against a real project. Complete and validate these launch blockers:

- Configure Supabase Auth redirect URLs, email templates/SMTP, project secrets, Storage buckets, scheduled expiry cleanup, and an authorized admin provisioning process. Review the migration against your Supabase role grants and run policy tests in a staging project.
- Finish booking UI/availability calculation: working hours, business timezone, service availability, blocked dates, configured concurrent capacity/resources, buffers, and checkout slot refresh. Current hold RPC serializes one booking per business for any overlapping interval; it does not yet model resources or `max_concurrent_bookings`. Add server-side expiry cleanup before launch.
- Add a durable Razorpay webhook event ledger and production monitoring/reconciliation; configure capture behavior and test captured, failed, duplicate, delayed, and refund scenarios in Razorpay test mode. The frontend does not yet initiate checkout.
- Build remaining product surfaces: full business onboarding/dashboard and admin moderation, booking/confirmation/booking management, service and package editor, vehicle detail tabs, secure document upload UI, maintenance reminders, expenses charts, favorites/reviews/offers management, comparisons, AI assistant integration/configuration, subscription billing, and analytics.
- Replace policy-page placeholders with counsel-approved documents; configure support contacts, brand assets, real listings, maps, analytics, and deployment settings. Add an AI provider only through a secured server function and show an explicit unconfigured state until then.

RLS is the security boundary; client route checks are not a substitute. Do not grant admin roles from a public client. Business verification transitions and review verification must be implemented through a trusted admin/server process before production.
