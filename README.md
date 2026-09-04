# Northern BOOST

Northern Arizona BOOST career-development experience for Apache, Coconino, Gila, and Navajo Counties.

## Connected journey

**Discover → Reality Check → Career Mobility → Decide → Applied Career Experience → Career Coach / Next Step**

The Northern version uses Lightcast regional labor-market evidence, O*NET career/interest data, and a shared journey record. Module 4 includes a conditional **Training & Funding Check** when BUILD is selected, including ETPL availability, potential ARIZONA@WORK contribution, Pell/Workforce Pell planning fields, and estimated remaining balance.

## Cloud persistence

This repository is configured for the dedicated **Northern BOOST** Supabase project. The browser uses only the Supabase publishable key. Structured journey evidence is mirrored to Supabase while localStorage remains the local adapter/fallback.

Participant-facing cloud access uses a random journey UUID plus a 64-character secret resume token. Detailed sensitive research inputs and free-text reflections remain outside the persistent journey unless explicitly included in the data contract.

See `SECURITY.md` for the current beta security posture and production hardening item.

## Deployment

GitHub Pages is deployed from the `/site` folder through `.github/workflows/deploy-pages.yml`.

Supabase migration: `supabase/migrations/001_boost_journeys.sql`

Shared journey contract: `docs/JOURNEY_DATA_CONTRACT.md`

## Status

**Beta / integration testing.** Do not treat BOOST pathway signals, ETPL findings, funding estimates, Pell/Workforce Pell fields, or training-cost calculations as eligibility or funding authorization. Final program decisions remain with ARIZONA@WORK staff and applicable policy/financial-aid processes.
