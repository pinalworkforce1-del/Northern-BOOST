# Upload Northern BOOST to the new GitHub repository

Repository:
https://github.com/pinalworkforce1-del/Northern-BOOST

The repository has already been initialized with README.md and SECURITY.md.

## Upload
1. Open the repository.
2. Choose **Add file → Upload files**.
3. Open this extracted `Northern_BOOST_GitHub_Deploy_v1` folder.
4. Drag these items into the GitHub upload window:
   - `.github`
   - `docs`
   - `site`
   - `supabase`
   - `.gitignore`
   - `QA_REPORT.txt`
5. Commit directly to `main`.

README.md and SECURITY.md are already in the repository, so you do not need to upload them again.

## GitHub Pages
After the files are committed:
1. Open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. The included workflow `.github/workflows/deploy-pages.yml` will publish `/site`.

## Supabase
The site is already configured for the dedicated Northern BOOST Supabase project:
`dxcajwarqojvmbteroco`

Only the browser-safe publishable key is included. No service-role key is present.
