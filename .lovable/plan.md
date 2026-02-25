

## NYSED Transportation Law Expert — Dashboard Widget

### Summary

There is no NYSED transportation law skill currently built into the app dashboard. The existing `chat` edge function powers the public-facing RideLine marketing chatbot. This plan creates a dedicated **in-app legal compliance assistant** with the full NYSED transportation law knowledge base, accessible from the dashboard as a collapsible widget.

### Architecture

```text
┌─────────────────────────────────────────────┐
│  New Edge Function: nysed-advisor           │
│  - NYSED law system prompt (full reference) │
│  - JWT-authenticated (reuses chat pattern)  │
│  - Streams via Lovable AI gateway           │
│  - Model: gemini-3-flash-preview            │
└──────────────────┬──────────────────────────┘
                   │ SSE stream
┌──────────────────▼──────────────────────────┐
│  New Component: NysedAdvisorWidget.tsx       │
│  - Collapsible card on Dashboard            │
│  - Chat-style interface with markdown       │
│  - Suggested questions for common topics    │
│  - Session-scoped conversation history      │
│  - Also accessible from Compliance page     │
└─────────────────────────────────────────────┘
```

### Implementation Steps

#### 1. Create Edge Function `supabase/functions/nysed-advisor/index.ts`

- Clone the authenticated streaming pattern from `chat/index.ts`
- Replace the system prompt with the complete NYSED transportation law reference from the user's message (Ed Law §3635, §2-d, Part 156, Part 121, BEDS/STAC, McKinney-Vento, IDEA/504, childcare routing, residency verification, contractor compliance, deadlines)
- Add a `context` field in the request body so the widget can optionally pass the user's district name/state for personalized answers
- Keep JWT auth, input validation, rate limit/402 handling

#### 2. Update `supabase/config.toml`

Add the new function entry:
```toml
[functions.nysed-advisor]
verify_jwt = false
```

#### 3. Create `src/components/app/NysedAdvisorWidget.tsx`

- A `Card`-based collapsible chat panel (not a floating bubble — this is an in-app tool)
- Header with `Scale` (gavel) icon and title "NYSED Law Advisor"
- Suggested question chips for common queries:
  - "What are the mileage requirements under §3635?"
  - "What does Ed Law §2-d require for contractors?"
  - "Can we digitize parent registration?"
  - "What are McKinney-Vento transportation obligations?"
  - "When is the April 1 deadline and what does it cover?"
- Streaming chat with `ReactMarkdown` rendering (same pattern as `ChatWidget`)
- Uses the authenticated Supabase session token (not the anon key) since this is an in-app feature for logged-in staff
- Max 500 char input, 30 message session limit
- Clear conversation button

#### 4. Integrate into Dashboard (`src/pages/app/Dashboard.tsx`)

- Add the `NysedAdvisorWidget` as a card in the dashboard layout
- Position it in the right column or as a full-width section near the bottom

#### 5. Integrate into Compliance page (`src/pages/app/Compliance.tsx`)

- Add the widget as an additional tab or sidebar panel so compliance officers have quick access while working on BEDS/STAC/Ed Law 2-d tasks

### System Prompt Content

The edge function's system prompt will contain the entire NYSED transportation law reference provided, covering:
- Ed Law §3635 (transportation mandates, mileage, childcare, nonpublic, standing passengers)
- Ed Law §2-d (student data privacy, contractor obligations, penalties, Parents' Bill of Rights)
- Commissioner's Regs Part 156 (driver safety) and Part 121 (data security)
- BEDS/STAC reporting requirements
- McKinney-Vento, IDEA/504, foster care transportation
- Digital residency verification compliance framework
- Contractor compliance requirements
- Key deadlines table
- Caveats (not legal advice, verify current statutes)

### Technical Details

- **No database changes needed** — this is a stateless AI chat widget
- **Authentication**: Uses the logged-in user's JWT session token via `supabase.functions.invoke` or direct fetch with auth header
- **Streaming**: Same SSE line-by-line parsing pattern already proven in `ChatWidget.tsx`
- **No new dependencies** — uses existing `react-markdown`, `framer-motion`, `lucide-react`

