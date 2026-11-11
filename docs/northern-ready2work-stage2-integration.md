# Northern Ready2Work — isolated staging integration

## Implemented
- Northern dashboard main launch and three stage links route to `preview-v2/ready2work/`.
- A Northern-only shell reuses Pinal's *static course data, artwork, CSS and unmodified shared supplemental résumé step script*.
- Application JS for stage flow, résumé, and interview decision trail is copied into Northern staging with a **Northern-only local storage key**. This is an interim staging fork, not a long-term shared application architecture.
- Before any app script loads, a Supabase Auth session and `boost_northern_ready2work_enrolled()` RPC must verify Northern staff enrollment.
- Separate `boost_northern_ready2work_progress` with participant RLS; Northern adapter never reads or writes `boost_ready2work_progress`.
- Local state is additionally scoped to authenticated user UUID to prevent cross-account reuse on shared devices.
- Pinal source, save keys, progress records, enrollment RPC and RLS are untouched.
- Jacqueline live interview remains **held** until Northern callback and transcript association are verified. Certificate printing remains **disabled** until Northern branding and validation.
- The main Northern pathway percentage and original progression code are unchanged.

## Live data and access limitation
At implementation time, `talentsync_participants` had no Northern-sourced rows. Existing Northern BOOST journey records alone do **not** satisfy staff approval. Thus stage links are wired, but the guard currently denies entry to accounts without a Northern TalentSync enrollment approval. The Northern team must verify how enrollments are recorded and which source_area values are authoritative. Do not bypass this guard by using query parameters or browser flags.

## Next verification
1. Verify Northern TalentSync source_area and enrollment_approved_at semantics with an authorized test record.
2. Test authenticated launch, session refresh, cloud restore, save and re-open; test second Northern account and dual-region account.
3. Verify AI résumé endpoint and its regional audit association.
4. Wire Jacqueline's Northern-specific callback and verify transcript, evaluation, completion signal.
5. Replace Pinal certificate artwork with Northern-approved branding, enable issuance only after verified AI completion.
6. Wire Northern Coach View to Northern table, preserving participant access boundaries.
7. Compare Pinal Ready2Work regression before/after and decide how to maintain one shared versioned app bundle.

## Safety
This staging integration has not been browser-tested with an approved Northern account. Do not release to participants until verification. If a regression is found, revert the Northern staging commit; no Pinal schema/data changes are required.
