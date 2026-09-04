# Northern Arizona BOOST — Journey Data Contract v1

## Principle
Each module adds structured interpretation without overwriting prior evidence. Participant-facing downloads may contain additional discussion detail that is intentionally not retained in the shared cloud record.

## Identity
- `participant.name` — required in Module 1
- `participant.email` — optional

## Module 1 — Discover
Stores interest results and up to six saved career records, including career source, interest alignment, regional opportunity evidence, and labor-market fields used downstream.

## Module 2 — Reality Check
Stores the 1–3 careers investigated and structured JOBS / WAGES / LIFE / FUTURE interpretations. Detailed job-search terms, posting observations, local search details, current/target wage entries, and free-text reflection remain participant-shareable rather than automatically retained.

## Module 3 — Career Mobility
Stores starting-point occupation/workforce status, structured skill-use categories, skill-transfer evidence, and WORK NOW / MOVE NOW / BUILD TOWARD pathways.

## Module 4 — Decide
Stores career target, BOOST signal, participant-selected direction, gap-closing route, applied-experience recommendation/selection, and conditional BUILD training/funding planning fields.

BUILD planning may include ETPL status, provider/program/credential, program cost, potential ARIZONA@WORK amount, Pell/Workforce Pell indicators and planning amounts, estimated remaining balance, and funding-plan status. These are planning estimates, not funding approvals.

## Applied Career Experience
Stores before/after fit and applied evidence from Skilled Trades, Advanced Manufacturing, CDL/Transportation, Health Care, IT, or Customer Service/Transferable Skills without replacing the participant's primary career target.

## Cloud security model
The browser never receives database table permissions. It calls two RPC functions using a random journey UUID + 256-bit access token. Supabase stores only a SHA-256 hash of the token. RLS remains enabled and direct anon/authenticated table access is revoked.
