# Northern BOOST — Module 3 / Module 4 Regression Guardrails

Updated: 2026-09-10

## Locked architecture

Northern Arizona evidence is based on Apache, Coconino, Gila, and Navajo Counties. Northern labor-market and occupation-preparation fields remain Northern-specific. O*NET and geography-neutral career relationships may enrich those records by SOC.

The Recommendation Gate controls only proactive BOOST surfacing:
- 500+ current regional jobs, or
- 350–499 jobs and 30+ average annual openings.

A career that does not pass the Recommendation Gate remains available for participant- or coach-directed exploration.

## Participant-facing scoring rule

Internal normalized values may support ranking or comparisons. Participant-facing screens must not display composite fit, readiness, mobility, or interest-alignment percentages. Use interpretable evidence labels and the underlying jobs, wages, preparation, life-fit, and career-relationship evidence instead.

## Module 3 — Work Now rule

WORK NOW is a feasibility gate, not a ranking label. A new occupation may be proactively surfaced as Work Now only when all applicable evidence supports a credible direct employment move:
1. Northern Recommendation Gate passes.
2. No higher formal preparation barrier is introduced.
3. No regulated-title / credential barrier blocks direct entry.
4. Direct-access and employment-first guardrails pass.
5. Occupational adjacency is sufficiently strong.
6. A credible career relationship is present, unless occupational adjacency is exceptionally close.

Skill similarity alone is never enough.

## Regression cases

| Starting point | Target | Expected behavior |
| --- | --- | --- |
| Customer Service Representative | Registered Nurse | **Never auto-surface as Work Now.** RN can still be intentionally explored and should normally be Build Toward unless readiness/credential evidence supports otherwise. |
| Nursing Assistant | Registered Nurse | Related healthcare progression can be acknowledged, but RN preparation/licensure remains a barrier; normally Build Toward. |
| Customer Service Representative | First-Line Office / Administrative Support Supervisor | Credible advancement relationship; may be Move Now or a Work Now candidate when actual experience and direct-access evidence support it. |
| Laborer / Freight / Material Mover | Transportation / Material-Moving Supervisor | Credible logistics progression; may be Move Now depending on experience and preparation. |
| Computer User Support Specialist | Computer Systems Analyst / related IT progression | Recognize IT pathway relationship; route depends on preparation and direct-access evidence. |
| Any occupation below Northern Recommendation Gate | Any proactive recommendation slot | Must not auto-surface, but must remain available for intentional exploration. |

## Module 4 — evidence contract

Module 4 consumes the current Module 1–3 record rather than legacy score fields. It uses:
- top-three O*NET/RIASEC interest themes from Discover;
- career source and Northern regional evidence;
- Reality Check JOBS / WAGES / PREPARATION / employer-supported / LIFE / FUTURE evidence;
- Module 3 mobility signal and reason;
- transferable-skill evidence;
- optional Workplace Skills Lab / Pizza Lab evidence when completed;
- typical entry education, related work experience, and on-the-job training.

The Workplace Skills Lab is optional. Absence of lab evidence carries no penalty.

Module 4 retains the Pinal Decide route behavior:
- READY → Work Now
- BRIDGE → Earn While You Learn
- BUILD → Training Investment Conversation
- RECONSIDER → Explore Before Committing

BRIDGE requires verified employer-supported evidence; participant preference alone cannot manufacture a BRIDGE route.

## Static QA completed 2026-09-10

- Northern occupation master loader expects exactly 798 occupation records.
- Module 1 saves top-three interest themes, exploration source, Northern labor-market fields, Recommendation Gate result, and Northern preparation fields.
- Module 2 carries the same SOC records and adds six Reality Check judgments.
- Active Module 3 v2 replaces the older generic Work Now choice with strict Work Now feasibility logic.
- Participant-facing Module 3 score remnants are scrubbed/hidden by the v2 architecture layer.
- Geography-specific Pinal/H3 wording in the relationship crosswalk is sanitized before Northern Module 3 uses it.
- Module 4 v3 reads `mobilitySignalsBySoc`, `decisionEvidence`, `selfAssessment`, and optional `workplaceLab` / `skillLab` rather than obsolete `skillAlignment` / `interestAlignment` fields.
- Module 4 v3 contains no participant-facing Pinal/H3 references or composite alignment percentages.

## Browser QA still required

Run one clean end-to-end journey after deployment with each regression scenario above. Confirm Module 1 → Module 2 → Module 3 → Module 4 persistence in local state and Supabase, route behavior, optional Workplace Skills Lab carry-forward, and map completion gating before calling the conversion production-final.
