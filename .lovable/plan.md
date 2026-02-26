

## Rename and Upgrade the NYSED Advisor to "Sam"

The user wants to rebrand the NYSED Law Advisor widget, name it "Sam", and expand its knowledge to include the full RideLine platform/website information alongside the NYSED transportation law expertise.

### Changes

#### 1. Update the Edge Function System Prompt (`supabase/functions/nysed-advisor/index.ts`)

- Change the persona from "NYSED Transportation Law Advisor" to **"Sam"** — RideLine's in-app compliance and platform expert
- Merge the RideLine platform knowledge from the `chat` edge function's system prompt into Sam's system prompt. This gives Sam full knowledge of:
  - All 6 RideLine platform modules (Student Assignment, Route Optimization, Contractor Oversight, Parent Communication, Compliance & Reporting, AI Analytics)
  - Pricing ($75K–$100K/year), ROI stats ($710K–$1.6M savings), market data
  - How RideLine works (Connect → Analyze → Optimize → Save)
  - Free Route Audit offering
  - Common school transportation challenges
- Keep the entire existing NYSED legal framework (Ed Law §3635, §2-d, Part 156, Part 121, etc.)
- Update response guidelines: Sam should introduce itself as "Sam" and be warm/conversational while still citing statutes accurately

#### 2. Update the Widget Component (`src/components/app/NysedAdvisorWidget.tsx`)

- Rename display title from "NYSED Law Advisor" to **"Sam"**
- Update subtitle from "Ed Law §3635, §2-d, compliance guidance" to something like "NYSED law, compliance & RideLine platform expert"
- Update empty state text to reflect Sam's broader capabilities (law + platform knowledge)
- Update input placeholder from "Ask about NYSED transportation law..." to "Ask Sam anything..."
- Add suggested questions that cover both law AND platform, e.g.:
  - "How does RideLine handle route optimization?"
  - "What are the mileage requirements under §3635?"
  - "How can RideLine help with BEDS/STAC reporting?"
  - "What does Ed Law §2-d require for contractors?"
  - "How much can our district save with RideLine?"
- Update the disclaimer text to cover both legal info and platform guidance

#### 3. Dashboard Integration (`src/pages/app/Dashboard.tsx`)

- Update the comment from `{/* NYSED Law Advisor */}` to `{/* Sam — NYSED & Platform Advisor */}`

### Technical Details

- No new files, no new dependencies, no database changes
- The edge function prompt grows by ~80 lines to incorporate the RideLine platform knowledge from the existing `chat` function's prompt
- All existing streaming, authentication, and session logic remains unchanged

