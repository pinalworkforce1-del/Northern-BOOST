# Northern Ready 2 Work — occupation search

## Data and licensing
- Source: O*NET 31.0 Database, U.S. Department of Labor, Employment and Training Administration, CC BY 4.0: https://www.onetcenter.org/database.html
- `tools/build_resume_onet_catalog.py` downloads `occupation_data.csv` and `job_titles.csv` and validates row counts before generating `site/preview-v2/ready2work/onet-occupation-catalog-v31.json`.
- The generated static index is used in the browser. It does not require participants to obtain an API key or send their search text to O*NET.
- O*NET 31.0 changed the file name from Alternate Titles to Job Titles; the build uses the current official file.

## Behavior
- Search official occupation titles and alternate job titles.
- A selected match saves the participant's display title separately from the O*NET title and code, within that résumé version.
- The participant can always choose **Use my exact job title**; this deliberately clears any inferred O*NET classification.
- If the index fails to load, the existing familiar-title suggestions and custom-title entry remain available.
- Changing the résumé version refreshes the selected title and its metadata.
- Pinal BOOST, Level Up, and Supabase policies are unchanged.

## Browser acceptance checks
1. Search **electrician** and choose a result; verify the displayed title and O*NET classification.
2. Search **patient access** and choose a relevant result if offered; do not auto-select a classification.
3. Type a custom job title and choose **Use my exact job title**; verify the title remains unchanged.
4. Switch résumé versions and back, then hard-refresh; confirm each version's title and classification are preserved.
5. Confirm Rosie still receives the participant's exact target title and the job description.
6. Test keyboard arrow navigation, Enter, Escape, and mobile scrolling.
7. Check the full index loads after GitHub Pages deployment; a build workflow success alone is insufficient to prove deployment.
