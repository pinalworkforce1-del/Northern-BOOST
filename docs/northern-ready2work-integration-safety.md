# Northern BOOST 2.0 — Ready2Work integration safety contract (2026-11-10)

## Stage 1 — completed, display only
- Add a Northern-only Ready 2 Work dashboard section with Pinal's *existing public artwork* and three program stages.
- The launch is deliberately **disabled**. It does not navigate to Pinal's app, read or write Ready2Work progress, or modify Northern progression.
- The current production Northern homepage and Pinal repository remain unchanged.
- This is **not** a completed Ready2Work integration or proof of successful AI/cloud saves.

## Verified existing dependencies
- Pinal application: `BOOST_Pathway-Portal/ready-2-work-qa/`.
- Pinal cloud progress: `public.boost_ready2work_progress` keyed by `participant_id` (Supabase Auth user UUID), with `progress_json`. There is **no region/journey column**.
- Pinal browser state: `boost-r2w-integrated-v1` in localStorage. Cloud save merges this state into the user-keyed row.
- The Pinal app contains Pinal-specific return link, certificate branding, and AI résumé/interview completion requirements.
- Northern preview authentication uses the same Supabase project as Pinal, but the new preview is hosted on GitHub Pages. Browser auth is origin-scoped; launching the existing Pinal site is not automatically authenticated in another origin.
- `talentsync_participants` has `source_area`, `source_user_id`, `source_journey_id`, `enrollment_approved_at`. The existing Pinal enrollment function checks `source_area='pinal'`. Do not change it.
- At inspection, TalentSync participant rows in the shared project had only Pinal source_area. **Absence of a Northern TalentSync row is not proof that a Northern participant is not enrolled elsewhere.**

## Stage 2 — required before enabling launch
1. Agree the **authoritative Northern staff enrollment source** and map the exact Northern source_area values, enrollment approval and journey ID to a server-verified identity. Do not treat Module 1 completion, browser region, query strings, or user-editable metadata as enrollment authorization.
2. Choose a region-safe progress contract. Prefer a separate `boost_northern_ready2work_progress` table (or a truly journey-keyed shared table) with ownership RLS and read/write integration tested separately; never upsert Northern data into Pinal's existing `boost_ready2work_progress` row.
3. Choose a **single maintained app build** that accepts a trusted Northern launch context, a Northern-only localStorage key, Northern cloud adapter, return destination and certificate branding. Avoid a third divergent copy; don't load the existing Pinal cloud-save script in Northern context.
4. Test cross-origin auth and refresh on staging, including a participant who has both Pinal and Northern journeys.
5. Confirm AI résumé and Jacqueline interview handoff, transcripts, evaluations, final résumé, certificate, and Northern Coach View using a Northern test account.
6. Run regression tests against Pinal's existing saved Ready2Work user and Pinal enrollment before any rollout.
7. Enable the Northern launch **only after** backend, security and end-to-end tests pass; keep Pinal routes, save keys, and RLS unchanged.

## Stage 1 invariants
- No schema migrations, RPC/Edge Function deployments, SQL writes, or Pinal repository edits.
- No changes to Northern `orders`, `done`, `available`, `launch`, `render`, module IDs, or progress percentage.
- All Ready2Work artwork is decorative; if it fails, text and the disabled state remain.
