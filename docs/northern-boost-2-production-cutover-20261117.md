# Northern BOOST 2.0 — production cutover (2026-11-17)

## Code promotion
- Production home: `site/index.html` (Northern BOOST 2.0)
- Archived former home: `site/northern-boost-legacy-20261117.html`
- Existing participant modules: `site/preview-v2/*`, with return links pointed to the new production home
- Northern Ready 2 Work, Jacqueline, Rosie coaching feedback, coach reporting and regional certificate remain in their Northern paths
- Supabase project `dxcajwarqojvmbteroco`; Pinal tables and participant records unchanged
- ROSIE interview evaluation function CORS now allows `https://northern.boostpathways.org`, preserving Pinal and GitHub Pages origins

## Custom-domain activation — admin action required
1. In Cloudflare for **boostpathways.org**, create a **CNAME**:
   - Host/name: `northern`
   - Target: `pinalworkforce1-del.github.io`
   - Proxy: **DNS only** initially
   - Check for an existing conflicting DNS record for `northern` before adding.
2. In GitHub > **pinalworkforce1-del/Northern-BOOST** > **Settings** > **Pages**, enter `northern.boostpathways.org` in **Custom domain**; save. This repo deploys `site/` by **GitHub Actions** (`.github/workflows/deploy-pages.yml`), not by direct branch publication. Check DNS/verification and enable **Enforce HTTPS** once available.
3. In Supabase > project `dxcajwarqojvmbteroco` > **Authentication** > **URL Configuration**, add both `https://northern.boostpathways.org/` and `https://northern.boostpathways.org/index.html` to allowed redirect URLs. Preserve existing GitHub and Pinal entries. The product uses numeric email-code sign-in and email link callbacks. Do not replace the global Site URL unless all other experiences have been assessed.
4. Check that the custom domain resolves and displays Northern BOOST 2.0, with a valid TLS certificate and correct URL in the address bar. Do not publish the public onboarding link until this check passes.

## Functional launch verification
- Sign in **on the custom domain** using both numeric code and email link; check the return destination.
- Open Discover > Coach Appointment Prep > Modules 2–4, return to `index.html`, verify saved progression.
- NEAZ and Coconino orientation/form selectors; confirm that the original account's selected area carries forward.
- Coach View staff login and participant report; verify Northern-only interview evaluation and no Pinal crossover.
- Ready 2 Work: 22 scenarios, résumé, Jacqueline transcript/evaluation, certificate for each service area.
- Certificate ID starts `NEAZ-R2W-` or `COCONINO-R2W-`; print one landscape PDF each.
- Test on desktop and mobile; verify Chrome refresh, navigation, and sign-in persistence.
- Verify participant progress **after** cross-origin transition; localStorage does not migrate between github.io and custom domains. Cloud-saved state must be authoritative.

## Rollback
If a major regression occurs, repoint `site/index.html` to the content archived in `site/northern-boost-legacy-20261117.html`, via a reviewed GitHub commit. Keep the original archive and all participant/cloud data intact. Do not overwrite or clear Northern/Pinal Supabase progress as a rollback step.

## Caveat
GitHub code commits are verified; GitHub Pages deployment completion, custom-domain DNS, HTTPS and external-login callbacks require independent live checks. A successful commit alone does not prove the new domain is available.
