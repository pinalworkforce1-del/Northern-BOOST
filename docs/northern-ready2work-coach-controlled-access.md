# Northern BOOST Ready2Work — Coach-controlled access

## Implementation
- Northern Coach View participant cards include a Ready 2 Work Access control with **Enable access** / **Disable access**.
- Coach View uses existing `boost-staff-access` staff sessions and a **separate** `boost-northern-ready2work-access` Edge Function. It checks staff token hash, expiry, revocation, active staff membership and `can_northern` before any read/write.
- Access is stored in `public.boost_northern_ready2work_access` (journey ID, user ID, enabled, changed by, changed when, staff session ID). It defaults disabled and has RLS enabled, no direct authenticated or anon table grants.
- Existing participant RPC `boost_northern_ready2work_enrolled()` now checks Northern coach access instead of TalentSync. It keeps the name to avoid breaking the existing guard and Northern progress RLS.
- Staff must enable access per Northern participant. Participants must have a linked Supabase Auth user ID. Disabling access blocks new launch and progress reads/writes via RLS, but retains previously saved Northern progress.
- Northern Ready2Work progress table remains isolated from Pinal. No Pinal source, records, policies, or routing changed.
- Jacqueline and Northern certificate printing remain intentionally unavailable pending validation.

## Verification and rollout
- Database migration applied: separate Northern access table and updated Northern-only RPC.
- Edge Function deployed: `boost-northern-ready2work-access` version 1.
- Coach View JS syntax checked; server authentication and linked user verification are implemented.
- **Not yet tested end-to-end with a signed-in coach and participant account**. Before participant rollout, test: enable → launch → save → reopen; disable → access denied; second participant cannot access; staff without Northern permission denied; Pinal regression unchanged.
- The Coach View HTML is shared Northern production dashboard, while the participant Ready2Work is staging. This new control only changes the Northern Ready2Work gate; it does not alter pathway progress.
