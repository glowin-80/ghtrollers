# Domain Contracts

This document defines the current **intended behavior contracts** for the production codebase.
These contracts are meant to reduce accidental regressions in Gäddhäng Trollers and to preserve
strict isolation from SFVOF.

If future changes intentionally alter any of these rules, both:
1. the implementation, and
2. the automated tests

must be updated together.

---

## 1. System boundaries

This repository contains two strictly separated systems:

- **Gäddhäng Trollers**
- **SFVOF**

### Contract
- Changes for Gäddhäng must not affect SFVOF.
- Changes for SFVOF must not affect Gäddhäng.
- Shared code should only be used when it is truly generic and safe for both systems.
- Business rules, member flows, display logic, and domain calculations must remain isolated unless explicitly intended and reviewed.

---

## 2. Identity and ownership

Gäddhäng uses **member-ID-based identity** as the primary source of truth.

### Core fields
- `caught_for_member_id`
- `registered_by_member_id`

### Contract
- Member ID is the primary identity source for ownership and registrar resolution.
- Name-based matching is fallback behavior only.
- Name-based fallback exists to preserve backward compatibility for older data and certain display paths.
- A name change must not break:
  - My Page
  - achievements
  - leaderboard
  - Big Five
  - all-time-high
  - private location logic

### Identity keys
- Current identity keys are expected to use the `member:<id>` format when a member ID exists.
- Tests lock this behavior.

---

## 3. Competition eligibility vs member stats

These are **not the same thing** and must not be conflated.

### Competition eligibility
Used for:
- leaderboard
- home leaderboard sections
- all-time competitive views
- Big Five competition logic

### Member stats
Used for:
- member page stats
- member-oriented totals and summaries

### Contract
- A catch may be valid for member stats while not being valid for competition results.
- Approved-only and competition-only logic are separate and must stay separate.

---

## 4. Achievement rules

Achievements are based on **reported catches count**, not competition eligibility.

### Reported catches thresholds
- `0–19`: Fiskesugen
- `20–49`: Fiskarn
- `50–99`: Storfiskarn
- `100–199`: Fångstjägaren
- `200–399`: Sjöveteranen
- `400–699`: Mästerfiskarn
- `700–999`: Fångstlegend
- `1000+`: Gäddhängsikon

### Contract
- Live-scope catches count toward achievements.
- Utomlands catches count toward achievements.
- Achievement progression, “current”, “next”, and “remaining to next” are treated as contract behavior and are covered by tests.

---

## 5. Big Five rules

Big Five is a core high-risk domain area.

### Contract
- Big Five is calculated from the best adjusted set of catches within a year.
- **Abborre counts as x4** in Big Five scoring.
- Big Five all-time selection is based on the **best single year**, not by mixing catches across years.
- Big Five breakdowns must only use eligible catches for the specific Big Five context being calculated.

### Exclusions from competition-oriented Big Five
The following must not influence competition Big Five or related competitive leaderboard views:
- Guest angler catches
- Live-scope catches
- Utomlands catches

### Notes
- Member page stats and other non-competition views may intentionally behave differently than competition Big Five logic.
- Tests currently lock the rule contracts around Big Five score weighting, breakdown construction, and all-time best-year selection.

---

## 6. Guest angler behavior

Guest angler behavior is intentionally distinct from regular competitive member behavior.

### Contract
- Guest anglers may register catches.
- Guest anglers must not appear in competition-oriented leaderboards.
- Guest anglers must not win all-time competitive views.
- Guest angler handling must remain distinct from normal member logic.

---

## 7. Private location visibility

Private location handling is a sensitive privacy contract.

### Contract
- Non-private locations are visible normally.
- Private locations must be hidden from logged-out/public viewers.
- Super admin can see private locations.
- Catch owner and registrar can see private locations when identity resolves correctly.
- Sanitization of hidden locations must clear:
  - `location_name`
  - `latitude`
  - `longitude`

### Important implementation note
- Current fallback matching is narrower than full name normalization.
- Current behavior trims identity values, but does not broadly enforce case-insensitive equivalence as a general contract.
- Tests lock the current behavior as implemented.

---

## 8. Home page aggregation contracts

Home page aggregation is a separate contract layer.

### Contract
- Home leaderboard results must use competition-eligible catches where appropriate.
- Big Five leaderboard output must reflect the current identity-key contract.
- All-time home highlights must reflect the actual winner under the current all-time best-year logic.
- Home aggregation behavior is test-covered and should not be changed casually.

---

## 9. Member page contracts

Member page logic is intentionally different from some competition views.

### Contract
- Member stats are derived from member-oriented views of approved catches.
- “Best fine fish” in member stats follows the current implementation contract, which may differ from “best Swedish fine fish only” helper behavior.
- Species aggregate stats follow the current approved-only aggregation behavior.
- Best yearly member Big Five breakdown must:
  - choose the best year for that member
  - ignore ineligible catches for the Big Five context
  - return `null` for guest anglers

### Important note
- Member page statistics and competition rankings must not be treated as interchangeable.

---

## 10. Testing and CI contracts

The repository now contains automated tests and CI that protect the current contract set.

### Current protected areas
- achievement thresholds
- catch identity
- private location visibility
- Big Five and competition rules
- home leaderboard / all-time result shaping
- member page formatting and stats helpers

### CI contract
GitHub Actions currently verifies:
- `npm ci`
- `npm run lint`
- `npm run test:run`
- `npm run build`

### Contract
- Changes to protected domain behavior should not be made without updating both code and tests.
- A green CI run is now a required quality signal before treating a change as stable.

---

## 11. Change management guidance

Before changing logic in any of the following areas, treat the change as high-risk:

- auth
- membership state
- catches
- identity resolution
- Big Five
- leaderboard
- all-time-high
- private location handling
- member page aggregation

### Required approach
- Prefer small steps.
- Prefer backward compatibility.
- Prefer tests before or alongside logic changes.
- Avoid changing production behavior just to satisfy an incorrect test.
- Adjust tests only when they incorrectly assume behavior that is not a real contract.

---

## 12. Relationship to README

This file is the **behavior contract layer**.

The `README.md` explains:
- project structure
- setup
- workflow
- repository overview

This file explains:
- what the code is currently expected to do
- what behavior must not drift unintentionally
- what domain rules are important enough to treat as contracts

---
