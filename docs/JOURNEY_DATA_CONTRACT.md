# Northern Arizona BOOST — Journey Data Contract v2

## Principle
Each module adds structured interpretation without overwriting prior evidence. The occupation SOC is the stable key that keeps Discover → Validate → Career Mobility → Decide on the same career record. Participant-facing downloads may contain additional discussion detail that is intentionally not retained in the shared cloud record.

Northern labor-market and preparation evidence remains Northern Arizona-specific. Geography-neutral O*NET and career-relationship evidence may be joined by SOC but may not replace Northern jobs, openings, wages, growth, or preparation fields.

## Identity
- `participant.name` — required in Module 1
- `participant.email` — optional

## Module 1 — Discover
Stores the participant's O*NET/RIASEC results and up to three saved career records.

The module retains raw RIASEC values internally so the top-three themes can be ordered and carried forward. Participant-facing screens use plain-language interest evidence rather than numerical alignment scores.

Each saved career record carries:
- SOC and occupation title
- exploration source (`BOOST Surfaced` or `I Chose to Explore`)
- plain-language interest connection
- Northern regional opportunity label
- 2026 jobs, average annual openings, projected growth, and wage evidence
- Recommendation Gate result
- Typical Entry-Level Education
- Work Experience Required
- Typical On-the-Job Training

The Recommendation Gate controls only careers BOOST proactively surfaces. It never prevents participant- or coach-directed exploration of the full occupation universe.

## Module 2 — Reality Check
Stores the same 1–3 career SOC records and adds structured JOBS / WAGES / PREPARATION / EARN-WHILE-YOU-LEARN / LIFE / FUTURE interpretations. Detailed job-search terms, posting observations, local search details, current/target wage entries, and free-text reflection remain participant-shareable rather than automatically retained.

Module 2 does not re-score interests. The top-three Module 1 interest themes remain attached to the journey.

## Module 3 — Career Mobility
Stores starting-point occupation/workforce status, structured skill-use categories, transferable-skill evidence, geography-neutral career relationship evidence, and WORK NOW / MOVE NOW / BUILD TOWARD mobility signals.

WORK NOW is a feasibility gate, not a ranking label. Regional demand or generic skill similarity cannot override occupation-specific preparation, credential/license barriers, or a lack of credible occupational relationship.

Module 3 automatically receives the participant's top-three Module 1 interest themes. If the Workplace Skills Lab / Pizza Lab is completed, its strengths and work-preference evidence are stored as optional additional evidence. Not completing the lab carries no penalty.

## Module 4 — Decide
Stores career target, BOOST signal, participant-selected direction, gap-closing route, applied-experience recommendation/selection, and conditional BUILD training/funding planning fields.

Module 4 uses the accumulated Module 1–3 evidence, including Workplace Skills Lab / Pizza Lab evidence when it exists. It should explain recommendations in plain language rather than display composite fit, readiness, or alignment percentages.

BUILD planning may include ETPL status, provider/program/credential, program cost, potential ARIZONA@WORK amount, Pell/Workforce Pell indicators and planning amounts, estimated remaining balance, and funding-plan status. These are planning estimates, not funding approvals.

## Applied Career Experience
Stores before/after fit and applied evidence from Skilled Trades, Advanced Manufacturing, CDL/Transportation, Health Care, IT, or Customer Service/Transferable Skills without replacing the participant's primary career target.

## Cloud security model
The browser never receives database table permissions. It calls two RPC functions using a random journey UUID + 256-bit access token. Supabase stores only a SHA-256 hash of the token. RLS remains enabled and direct anon/authenticated table access is revoked.
