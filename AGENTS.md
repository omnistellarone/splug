# AGENTS.md — Instructions for Antigravity

## 1. Mission

Build the production-capable electronics e-commerce application defined in:
1. `PRD.md`
2. `PLAN.md`
3. this `AGENTS.md`

Read all three files completely before modifying code.

If there is a conflict:
1. Security/integrity requirements in this file win.
2. `PRD.md` defines product behavior.
3. `PLAN.md` defines preferred architecture.
4. Existing code conventions win only when they do not conflict with the above.

Do not silently change the stack.

---

## 2. Locked Stack

Use:
- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Radix primitives where appropriate.
- Supabase PostgreSQL.
- Supabase Auth.
- Supabase Storage.
- Supabase JS client.
- Supabase SSR helpers.
- Paystack.
- Mailgun.
- Vercel.
- Zod.
- React Hook Form where useful.
- Zustand only for guest/optimistic cart/UI state where needed.

Do not introduce:
- Prisma.
- Drizzle.
- NestJS.
- Express.
- Firebase.
- another database.
- another auth provider.
- another payment provider.
- another email provider.
- Redux.

unless explicitly requested.

---

## 3. Operating Rules

### Before coding a phase
1. Read relevant sections of PRD/PLAN.
2. Inspect current repo.
3. Identify existing patterns/components.
4. Create a short implementation checklist.
5. Implement the smallest complete vertical slice.
6. Test it.
7. Update docs only if implementation changed a documented contract.

Do not generate large amounts of speculative code without verifying it compiles.

---

## 4. Package Version Rule

Use the latest stable compatible package versions at project initialization.

Do not copy old tutorials blindly.

Before implementing:
- Next.js request/session proxy behavior.
- Supabase SSR auth.
- Google OAuth.
- Paystack.
- Mailgun.

verify current official API usage.

Do not use deprecated Supabase auth helper packages if current docs specify another package.

---

## 5. TypeScript Rules

- Strict TypeScript.
- Avoid `any`.
- Prefer explicit domain types.
- Validate untrusted data with Zod.
- Do not cast external API responses just to satisfy TypeScript.
- Narrow errors safely.
- Keep money as integer minor units.
- Avoid floating-point currency arithmetic.

---

## 6. Next.js Rules

Prefer Server Components by default.

Use Client Components only for:
- Interactive controls.
- Browser APIs.
- Local optimistic state.
- Theme UI.
- Rich client forms where required.

Do not add `"use client"` to large page trees unnecessarily.

Use:
- Server Components for catalog reads where practical.
- Route Handlers for webhooks and external callback endpoints.
- Server Actions only when they improve clarity and remain secure.

Never expose privileged env variables to Client Components.

---

## 7. Supabase Rules

Create three conceptual clients:

### Browser client
Uses:
- Public URL.
- Publishable/anon key.

### Server user client
Uses:
- User cookie/session.
- Enforces RLS.

### Server admin client
Uses:
- Service-role key.
- Server-only module.
- Only for operations that intentionally bypass RLS.

Rules:
- Never import server admin client into a Client Component.
- Never send service-role key to browser.
- Never disable RLS just to make a feature work.
- Every migration must be committed.
- No production-only schema edits that are absent from migrations.

---

## 8. RLS Rule

RLS is mandatory for every exposed application table.

For every new table:
1. Decide who can SELECT.
2. Decide who can INSERT.
3. Decide who can UPDATE.
4. Decide who can DELETE.
5. Add policies.
6. Test policies.

Do not rely on UI hiding.

A user must never be able to:
- Read another user's cart.
- Read another user's addresses.
- Read another user's private order data.
- Write another user's review.
- Promote themselves to admin.
- Modify product prices/inventory.
- Modify payment status.

---

## 9. Admin Authorization

Admin role lives in trusted authorization data such as `user_roles`.

Do not:
- Read `?admin=true`.
- Trust localStorage.
- Trust editable profile fields.
- Trust UI state.

Every admin mutation must confirm authorization server-side or through RLS/database functions.

---

## 10. Database Rules

Use:
- UUIDs.
- `timestamptz`.
- Foreign keys.
- Unique constraints.
- Check constraints.
- Explicit indexes based on query needs.

Catalog records referenced by orders should generally be archived, not destructively deleted.

Orders must contain snapshots.

Do not reconstruct an old order by reading the current product price/name.

---

## 11. Money Rules

All stored money values are integer minor units.

For NGN:
- `100000` minor units means ₦1,000.00 if using kobo.

Create shared helpers:
- `formatMoney`.
- `toMinorUnits` only where safe.
- `fromMinorUnits` for display only if needed.

Never trust formatted currency strings for calculations.

---

## 12. Cart Rules

### Guest
Persist in localStorage through a dedicated cart store.

### Signed in
Supabase cart is canonical.

### Login
Merge local cart into DB cart safely, then clear local cart.

### Checkout
Load server-side cart and current variant data again.

Never:
- Use a browser-calculated total as final.
- Use stale cached product price as final.
- Allow negative/zero quantities.
- Allow quantity above permitted stock.

---

## 13. Product Variant Rules

A cart item points to a `product_variant`, not only a product.

Variants own:
- SKU.
- Price.
- Compare-at price.
- Stock.
- Active state.
- Option attributes.

Product page must require a valid variant before add-to-cart.

---

## 14. Inventory Rules

Stock updates must be concurrency-safe.

At payment finalization:
- Check idempotency.
- Update payment.
- Update order.
- Decrement stock.
- Insert inventory movement.

Do this atomically using a PostgreSQL function/RPC or equivalent transaction strategy.

Never decrement stock twice for a replayed webhook.

---

## 15. Checkout Rules

Checkout requires a signed-in user.

Server must:
1. Load cart.
2. Load current prices.
3. Validate stock.
4. Validate coupon.
5. Calculate totals.
6. Create pending order.
7. Create payment reference.
8. Initialize Paystack.

Browser may display an estimate but cannot define the order value.

---

## 16. Paystack Rules

Secrets are server-only.

Initialization:
- Server only.

Verification:
- Server only.

Webhook:
- Verify `x-paystack-signature`.
- Use raw request body correctly.
- Validate event before processing.
- Match expected amount/currency/reference.
- Make fulfillment idempotent.

Do not mark an order paid merely because:
- User reached success page.
- Callback query says success.
- Client JavaScript says payment completed.

The server must verify.

---

## 17. Mailgun Rules

Mailgun API key is server-only.

Email sending happens:
- after committed business state.
- through one reusable service.

Do not make order success depend on Mailgun availability.

If email fails:
- record/log failure.
- preserve paid order.
- allow retry.

Do not expose Mailgun key in browser bundles.

---

## 18. Google OAuth Rules

Use Supabase Auth Google provider.

At implementation time:
- Follow current Supabase Google login guide.
- Configure Google Cloud OAuth client.
- Configure exact required redirect URI.
- Configure Supabase Site URL/redirect allow list.
- Implement `/auth/callback` code exchange when required by current SSR flow.

Do not guess callback URLs.

When manual setup is needed, stop only at the exact point where human credentials/dashboard actions are required and provide precise instructions; continue implementing all code that does not require the secret itself.

Never commit Google client secret.

---

## 19. Storage Rules

Product files go to Supabase Storage.

Use a dedicated bucket.

For public catalog images:
- Public reads are allowed if configured.
- Admin-only writes.

Validate:
- MIME type.
- file size.
- authorization.

Store object paths in database.

Use Storage API for upload/delete/move. Do not directly mutate internal Storage metadata tables.

---

## 20. UI/UX Rules

Design target:
- Shopify-like clarity.
- Premium/minimal electronics feel.

Requirements:
- Mobile-first.
- Responsive.
- Accessible.
- Light/dark/system.
- Fast perceived interactions.
- Skeletons.
- Useful empty/error states.
- Optimistic UI only when rollback is safe.
- Toasts for transient confirmations/errors.
- Dialogs only when they improve flow.

Do not:
- Turn every section into a card.
- Overuse gradients.
- Add decorative animation that slows interaction.
- Ship default shadcn styling without customization.
- Hide essential actions behind hover on mobile.

---

## 21. Component Rules

Before creating a new component:
1. Check `components/ui`.
2. Check feature components.
3. Reuse existing primitives.

Keep components focused.

Prefer:
- Composition.
- Small stable props.
- Domain-specific feature components over giant generic components.

Avoid:
- 800-line page components.
- Duplicated form field markup.
- Duplicated money/status formatting.
- Duplicated Supabase client creation.

---

## 22. Data Fetching Rules

Public catalog:
- server fetch where practical.
- cache intentionally.
- revalidate appropriately after admin catalog changes.

Private data:
- user-scoped.
- do not put private responses in public caches.

Admin:
- server-side pagination/filtering.
- no “fetch all records then filter in browser” for growing datasets.

---

## 23. Error Rules

Expected errors must have user-safe messages.

Create domain error handling for:
- auth required.
- forbidden.
- invalid form.
- out of stock.
- invalid coupon.
- payment init failure.
- payment verification failure.
- network/external service failure.

Never show:
- secret keys.
- stack traces in production UI.
- raw Supabase service errors containing sensitive context.

---

## 24. Logging Rules

Log:
- order ID.
- payment reference.
- webhook event type.
- external request outcome.
- email event status.

Do not log:
- passwords.
- auth tokens.
- service keys.
- card data.
- full sensitive payloads.

---

## 25. Accessibility Rules

Every interactive element must:
- be keyboard reachable.
- have accessible name.
- show focus.
- have proper semantics.

Forms:
- label inputs.
- connect errors.
- preserve user input on recoverable errors.

Images:
- meaningful alt text.
- decorative images use empty alt.

Dialogs:
- focus trapped/restored by accessible primitive.

---

## 26. Test Rules

No phase is done because “it looks correct”.

Run relevant:
- typecheck.
- lint.
- unit tests.
- integration tests.
- E2E tests.
- production build.

Critical security/business logic requires tests.

At minimum test:
- RLS.
- admin authorization.
- cart merge.
- coupon calculation.
- order total.
- payment idempotency.
- webhook signature helper.
- inventory decrement once.
- unauthorized admin mutation rejection.

---

## 27. External Services in Tests

Never perform real paid transactions from automated tests.

Use:
- Paystack test mode for manual integration.
- mocks/fakes at test boundaries.
- Mailgun sandbox/test behavior where applicable.

Do not make CI dependent on third-party uptime for unit tests.

---

## 28. Git Rules

Keep commits logically scoped.

Never commit:
- `.env.local`.
- API keys.
- service-role key.
- Paystack secret.
- Mailgun secret.
- Google secret.

Update `.env.example` when a new env variable is introduced.

Do not commit generated build directories.

---

## 29. Phase Completion Format

At the end of each phase, report:

```text
Phase: <name>

Implemented:
- ...

Database changes:
- ...

Routes/pages:
- ...

Tests added:
- ...

Commands run:
- ...

Manual setup still required:
- ...

Known issues:
- ...

Next recommended phase:
- ...
```

Do not claim a test passed if it was not run.

---

## 30. Do Not Overbuild

The target is a polished production-capable assignment, not Shopify itself.

Do not add:
- multi-vendor.
- Kubernetes.
- microservices.
- event buses.
- Redis.
- queues.
- Elasticsearch.
- Docker.
- separate backend service.

unless requirements change and the user explicitly approves it.

Keep boundaries clean enough to add those later if scale demands them.

---

## 31. First Task for Antigravity

Start with **Phase 0 — Project foundation** from `PLAN.md`.

Before writing code:
1. Inspect whether a Next.js project already exists.
2. If it exists, adapt it rather than destroying working code.
3. If it does not exist, initialize a current stable Next.js TypeScript App Router project.
4. Install/configure Tailwind if not already included.
5. Configure shadcn/ui.
6. Configure theme support.
7. Set up directory structure.
8. Add `.env.example`.
9. Add Supabase browser/server client scaffolding without secrets.
10. Add lint/typecheck/test commands.
11. Build a polished responsive store shell with placeholder navigation.
12. Run lint, typecheck, tests, and production build.
13. Report results using the phase completion format.

Do not begin payment implementation in Phase 0.

---

## 32. Human-Required Configuration Checkpoints

Antigravity may implement code around these, but human dashboard actions/credentials will be needed:

### Supabase
- Project creation.
- Project URL/publishable key.
- Service-role secret.
- Auth provider configuration.
- Storage bucket/policies if migrations/API cannot cover all setup.

### Google Cloud
- OAuth consent/audience.
- OAuth web client.
- Client ID/secret.
- Authorized redirect URI.

### Paystack
- Test keys.
- Webhook URL.
- Later live keys.

### Mailgun
- Account/domain.
- API key.
- DNS verification.
- Sender.

### Vercel
- Project link.
- Environment variables.
- Production domain.

Never invent credentials.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
