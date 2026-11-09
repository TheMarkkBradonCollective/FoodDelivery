# Portr campaign marketplace operations

## Database rollout

Apply all three migrations in order in the Neon SQL Editor:

1. `db/migrations/20261109_campaign_marketplace.sql`
2. `db/migrations/20261110_campaign_controls.sql`
3. `db/migrations/20261111_campaign_funding.sql`

Do not deploy the updated Worker before all three migrations have completed.

## Campaign lifecycle

- Business proposals are created as `draft`.
- Portr staff opens Runner enrollment from Command. The campaign becomes `recruiting`.
- Runners may enroll in multiple campaigns. Enrollment does not reserve live working capacity.
- Enrollment closes at the configured deadline.
- The Cloudflare Worker cron checks every five minutes once both the enrollment deadline and campaign start time have passed:
  - If joined membership meets the minimum, the campaign becomes `live`.
  - If it does not, the campaign becomes `void`.
- A Runner consumes an active slot only while online. Active capacity is reserved atomically and released when going offline.
- Custom operating schedules are evaluated in the campaign's IANA timezone, including overnight intervals.

## Stripe funding and automatic refunds

Configure these Worker secrets in the correct Stripe account and mode:

- `STRIPE_SECRET_KEY` — Checkout and refunds.
- `STRIPE_WEBHOOK_SECRET` — signature verification for Stripe webhooks.

Register a Stripe webhook endpoint at:

`https://portr-api.<your-worker-domain>/stripe/webhook`

Subscribe it to `checkout.session.completed` and `checkout.session.async_payment_succeeded`.

Vendor campaign funding uses Stripe Checkout. The signed webhook verifies the paid Checkout session, campaign ID, and exact expected amount before recording its PaymentIntent. A campaign voided for insufficient Runner membership receives a pending refund ledger entry only if funding was actually collected. The scheduled Worker processes eligible pending refunds through Stripe using a stable idempotency key; Stripe refunds that remain processing can be reconciled in Command.

If Checkout completes after a campaign has already been voided, the webhook records the PaymentIntent as refund-pending so the scheduled refund worker can return it.

A refund is not marked complete until Stripe reports `succeeded`. Missing secrets or unrecorded payments do not create false refund confirmations.

## Surfaces

- Website: business partnership proposal with per-day schedule editor.
- Vendor: campaign overview and Stripe Checkout funding.
- Runner: campaign enrollment and live online/offline controls.
- Command: open enrollment, launch/void oversight, refund processing and reconciliation.
- Porter and FastFood: customer-facing campaign discovery.

## Deployment

1. Apply all three migrations.
2. Set the Stripe Worker secrets.
3. Deploy the Worker and verify the five-minute cron is active.
4. Configure the Stripe webhook endpoint and subscribe to the two Checkout completion events.
5. Run a full test-mode flow: fund a campaign, complete enrollment, verify automatic launch; then test an under-enrolled campaign and verify the full refund in Stripe.

The proposal page defaults the campaign's refundable amount to 100% of proposed funding. Campaign funding is returned in full when the minimum Runner enrollment is not met.


## Campaign Runner payout and financial controls

The campaign finance follow-up migration is `db/migrations/20261113_campaign_financial_ledger.sql`. Run it only after the consolidated campaign setup migration (`20261112_campaign_setup_all_in_one.sql`).

Campaign financial data and controls are management-only: administrator, manager, director, founder, or a profile with the founder flag. Support and moderator roles do not receive campaign finance access.

The migration creates combined-funding allocations, a campaign financial ledger, and per-delivery payout snapshots. Management assigns the Runner compensation and platform fee portions of the combined funding; the unallocated remainder stays available. Runner compensation defaults to a $3.00 base plus $1.50 per mile, bounded between $3.00 and $7.50, and can be changed per campaign by management.

A campaign-linked delivery can be accepted only by a Runner who is enrolled and currently online in that live, funded campaign. Acceptance reserves the calculated base-plus-mileage amount from the campaign's Runner budget. The customer's order tip is read from the order record and is added to the Runner total at 100%; it is not taken from the campaign Runner compensation budget. Completion writes the earned compensation and tip pass-through entries. Cancelling an uncompleted campaign delivery releases the reserved Runner budget.

The ledger records earnings and allocations; it does not itself send a bank payout. Actual payout settlement, hourly platform-fee accrual, reconciliation UI, and production deployment remain separate steps.
