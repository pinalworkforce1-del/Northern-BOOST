# Northern BOOST — Security Note

## Current beta posture

Supabase correctly flags the two anonymous journey save/load RPCs because they are intentionally callable from the participant-facing GitHub Pages site.

The underlying `boost_journeys` table is not directly available to anonymous or authenticated browser clients. Row Level Security is enabled, and the browser does not receive a Supabase service-role key.

Access to an individual journey requires both:
- a random journey UUID, and
- a separate 64-character secret resume token.

The token is stored as a hash in the database. Resume credentials are carried in the URL fragment (`#...`) rather than the normal query string, so the fragment is not sent to the web server as part of the HTTP request.

The public browser configuration contains only the Supabase publishable key. A publishable key is expected to be visible in a browser application and must never be treated as a secret.

## Production hardening item

Before broad production rollout, add abuse/rate-limit protection around the anonymous save/load endpoints and complete an additional security review of the participant resume-link flow.

The Supabase database advisor warnings for the two `SECURITY DEFINER` RPCs are currently expected because these functions intentionally form the narrow participant-facing API. They should remain tightly scoped, validate all inputs, and expose no direct table CRUD.

## Data minimization

Northern BOOST persists structured career-development evidence needed to continue the participant journey. Detailed sensitive research inputs, household/financial narratives, transportation or childcare narratives, and free-text coach reflections remain download/share-only unless the data contract is deliberately changed.

## Never commit

Do **not** commit any Supabase service-role key, database password, private staff credential, participant resume token, or other privileged secret to this repository or browser JavaScript.
