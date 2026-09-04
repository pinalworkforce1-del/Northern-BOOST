# Northern BOOST — Supabase + GitHub Beta v2

Supabase project **Northern BOOST** has been created and the initial cloud persistence migration has been applied. The browser configuration in this package already points to that project using its publishable key.

# Northern Arizona BOOST — Supabase + GitHub Beta v1

This package converts the connected Northern Arizona BOOST journey from browser-only persistence to a GitHub Pages front end with Supabase cloud mirroring. Existing module logic remains intact.

## What changed
- All existing modules still write the same `boost_naz_journey_v1` record to browser storage.
- A shared cloud adapter mirrors that record to Supabase asynchronously.
- If a participant later opens a valid BOOST resume link on another browser/device, the adapter can restore the cloud record into browser storage and reload the experience.
- Supabase table access is locked down; the browser uses token-validated RPC functions instead of direct table CRUD.
- GitHub Actions workflow publishes only `/site` to GitHub Pages.

## 1. Create / connect Supabase
Run `supabase/migrations/001_boost_journeys.sql` in the Supabase SQL editor.

Then open `site/assets/js/boost-config.js` and replace:
- `https://dxcajwarqojvmbteroco.supabase.co`
- `configured publishable key`

The browser key is intentionally public. Security comes from RLS plus the token-validated RPC functions. Never put a Supabase service-role key in this repo or in browser JavaScript.

## 2. Publish to GitHub
Create a repository, copy this package into it, commit, and push to `main`. The included GitHub Pages workflow deploys the `/site` folder. In repository Settings → Pages, set Source to **GitHub Actions** if needed.

## 3. Test cloud persistence
1. Complete enough of Module 1 to create a journey.
2. In the browser console, run `BOOSTCloud.configured()` — it should return `true`.
3. Check the Supabase `boost_journeys` table in the dashboard.
4. Continue through modules and confirm `updated_at` changes and `journey_data` grows.

## Resume links
The adapter supports a tokenized cross-device resume link using the URL fragment, which is not sent to the server as a referrer. In the browser console, `BOOSTCloud.resumeLink()` returns the current journey's resume link. A polished participant-facing “Save my resume link” control can be added later without changing the database design.

## Privacy / retention
This cloud record follows the retention decisions already built into Northern BOOST: structured career-development evidence carries forward; selected detailed research inputs, financial details, and free-text coach reflections remain download/share-only unless explicitly added to the data contract.

## Files
- `site/` — GitHub Pages application
- `site/assets/js/boost-cloud.js` — shared Supabase adapter
- `site/assets/js/boost-config.js` — project URL + public browser key
- `supabase/migrations/001_boost_journeys.sql` — table, RLS posture, secure RPCs
- `docs/JOURNEY_DATA_CONTRACT.md` — v1 shared record definition
- `.github/workflows/deploy-pages.yml` — Pages deployment
