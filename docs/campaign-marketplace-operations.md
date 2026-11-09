# Portr campaign marketplace operations

## Database rollout

Apply these migrations in order in the Neon SQL Editor:

1. `db/migrations/20261109_campaign_marketplace.sql`
2. `db/migrations/20261110_campaign_controls.sql`

The second migration adds and backfills the atomic campaign membership counter used by the enrollment endpoint. Do not deploy the updated Worker before both migrations have completed.

## Campaign lifecycle

- Business proposals are created as `draft`.
- Portr staff opens enrollment from Command. The campaign becomes `recruiting`.
- Runners may enroll in multiple campaigns. Enrollment does not reserve live working capacity.
- At the campaign start, after the enrollment deadline, the Worker cron checks every five minutes:
  - If joined membership meets the minimum, the campaign becomes `live`.
  - If it does not, the campaign becomes `void` and a pending refund ledger record is created.
- A Runner consumes an active slot only while online. Active capacity is reserved atomically and released when going offline.
- Custom operating schedules are evaluated in the campaign's IANA timezone, including overnight intervals.

## Stripe refund prerequisites

The refund endpoint is deliberately guarded. Before it can send money:
- Configure the Worker secret `STRIPE_SECRET_KEY`.
- The campaign must have a real Stripe PaymentIntent ID (`pi_...`) in `payment_reference`.
- The payment collection/escrow workflow must have actually charged and recorded that PaymentIntent. Campaign proposal amounts alone are not payments.

Portr's campaign proposal form currently records proposed funding amounts only; it does not collect or hold campaign funding. Therefore do not describe a campaign refund as guaranteed until the funding checkout and payment confirmation workflow has been connected. Staff can process an eligible pending refund and reconcile a Stripe refund that remains processing.

## Surfaces

- Website: business partnership proposal with per-day schedule editor.
- Vendor: campaign overview.
- Runner: campaign enrollment and live online/offline controls.
- Command: open enrollment, launch/void oversight, refund processing and reconciliation.
- Porter and FastFood: customer-facing campaign discovery.

## Deployment

Deploy the Worker after migrations are applied. Wrangler config schedules the lifecycle task every five minutes. Set the Stripe secret in the Worker environment only after confirming the correct Stripe account and mode (test or live).
