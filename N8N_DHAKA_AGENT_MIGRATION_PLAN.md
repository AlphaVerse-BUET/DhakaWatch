# DhakaWatch n8n Agent Migration Plan

Last updated: 2026-04-10
Owner: DhakaWatch Product and Engineering
Status: Ready for implementation

## 1) Objective

Replace the current in-app AI agent implementation with an n8n Cloud based agent that:

- Uses Gemini as the primary model
- Uses embedded n8n chat for the user interface
- Answers Dhaka-first environmental intelligence questions using real project data and APIs
- Replaces chat, image analysis, and report generation in a single migration wave

This plan is written for immediate execution and assumes:

- Full replacement now (chat plus analyze plus report)
- Session continuity at browser-session level only (no persistent memory backend at launch)
- Hard cutover rollout

## 2) Success Criteria

The migration is complete only when all criteria below are met:

1. Embedded n8n chat is live in production and replaces the existing chatbot UI.
2. User prompts about pollution, encroachment, erosion, waterways, and ward-level risk are answered using tool-backed data.
3. Image analysis and report generation are routed through n8n workflows, not legacy AI routes.
4. Dhaka-first rules and scientific constraints are consistently enforced.
5. Streaming chat responses work in production for normal chat flows.
6. Legacy AI routes are removed or disabled after parity verification.

## 3) In-Scope and Out-of-Scope

### In scope

- Replace current chatbot flow in frontend
- Replace AI chat route
- Replace AI analyze route
- Replace AI report route
- Introduce n8n Cloud workflows for orchestration
- Use existing DhakaWatch API routes as tool data sources
- Add safeguards, observability, and launch runbook for hard cutover

### Out of scope

- Rebuilding geospatial business logic inside n8n
- Introducing a new persistent chat memory datastore in v1
- Re-architecting optional Python backend
- Expanding coverage to non-Dhaka geographies beyond current project constraints

## 4) Current State Snapshot

The current implementation has:

- A globally mounted chatbot component in frontend
- Next.js API routes for chat, analyze, and report
- Gemini service logic in app code
- Rich domain APIs already available for factory, pollution, attribution, waterways, analytics, and verification

Core files that define current behavior:

- src/components/AIChatbot.tsx
- src/app/layout.tsx
- src/app/api/ai/chat/route.ts
- src/app/api/ai/analyze/route.ts
- src/app/api/ai/report/route.ts
- src/lib/gemini.ts
- src/lib/backend-parity.ts
- src/lib/route-query.ts

## 5) Target Architecture

## 5.1 High-level architecture

1. Frontend embeds n8n chat widget and sends:
   - user message
   - session id
   - route/page metadata
   - optional user locale and client hints
2. n8n Chat Trigger receives events in embedded mode.
3. n8n AI Agent (Tools Agent with Gemini model) determines required tools.
4. Tools call existing DhakaWatch API routes over HTTPS.
5. Agent composes response with:
   - factual data summary
   - confidence framing
   - uncertainty and limitation wording
6. Streaming response returns to chat UI for standard chat paths.
7. Separate webhook workflows handle image analysis and report generation.

## 5.2 Dhaka-first decision layer

All agent responses must apply these rules:

1. Prefer Dhaka interpretation when location is ambiguous.
2. Ask for clarification if user location can map to multiple areas.
3. Never claim impossible sensor capabilities.
4. Use near-real-time language, not real-time language.
5. Frame outputs as enforcement triage intelligence, not legal proof.

## 5.3 Session model at launch

- Session id is generated client-side and sent with each message.
- No Redis or Postgres memory node in v1.
- Session continuity exists while browser session remains active.
- On refresh/new device, continuity resets.

## 6) Workflow Design in n8n Cloud

## 6.1 Workflow A: Embedded Chat Orchestrator

Purpose: Primary chatbot workflow for user Q and A.

Node chain design:

1. Chat Trigger
   - Mode: Embedded chat
   - Allowed origins: production frontend domains only
   - Response mode: Streaming response
2. Input Normalizer (Set or Code node)
   - Normalize text, page context, route, session id, timestamp
   - Enforce max prompt length
3. Safety and Scope Guard
   - Reject empty, abusive, or out-of-domain requests
   - Apply Dhaka-first pre-prompt hints
4. AI Agent (Tools Agent)
   - Model: Gemini chat model node
   - System prompt: policy and domain constraints
   - Tools attached: data toolset below
5. Output Formatter
   - Ensure stable response contract
   - Include source notes when tool data was used
6. Return streamed answer

### Response contract for chat

Use one consistent response shape from n8n to frontend:

- answer: human-readable response
- summary: short one-line takeaway
- sourceSignals: array of data source labels used
- uncertainty: optional warning text when data is missing or stale
- actionHints: optional next query suggestions

## 6.2 Workflow B: Image Analysis

Purpose: Replace existing image-based environmental analysis endpoint.

Node chain design:

1. Webhook Trigger
2. Input validation for image payload and metadata
3. Optional preprocessing step
4. Gemini image analysis operation
5. Policy post-processor for scientific wording and allowed claim checks
6. Structured JSON response output

## 6.3 Workflow C: Report Generation

Purpose: Replace existing report generation endpoint.

Node chain design:

1. Webhook Trigger
2. Input assembler (topic, area, date window, context)
3. Tool calls for factual grounding
4. Gemini synthesis step with strict report template
5. Output validator for prohibited claims and format
6. Structured report response

## 6.4 Recommended toolset for AI Agent

Attach tools that call these existing APIs:

- pollution intelligence: /api/pollution
- factories list and filtering: /api/factories
- source attribution: /api/attribution
- waterways context: /api/waterways
- rivers reference: /api/rivers
- summary stats: /api/stats
- ward scoring: /api/analytics/ward-scores
- satellite verification: /api/verify_satellite

Optional advanced tools after baseline stabilization:

- gee pollution overlays
- gee erosion overlays
- gee uhi overlays
- dynamic area synthesis routes

## 7) API Tool Contract Hardening

Before go-live, ensure each tool endpoint has:

1. strict input validation
2. normalized error envelope
3. bounded execution time
4. pagination or bounded result size where needed
5. clear freshness metadata

### Standardized error envelope

All tool failures should return a consistent structure:

- code: machine-readable error code
- message: user-safe text
- retryable: true or false
- details: optional developer hints

### Minimum timeout and retry strategy

- Overpass dependent routes: short timeout plus graceful fallback
- GEE dependent routes: explicit timeout and user-safe message
- n8n HTTP tool calls: bounded retries with exponential backoff only on retryable errors

## 8) Frontend Migration Plan

## 8.1 Replace chatbot component

1. Remove legacy chatbot mount from app layout.
2. Add embedded n8n chat initialization in a dedicated frontend component.
3. Pass route/page metadata with each message.
4. Pass session id key expected by n8n chat workflow.
5. Enable streaming in widget config to match workflow behavior.

## 8.2 Integrate embedded n8n chat package

Use the official n8n chat package in frontend with:

- production webhook URL
- explicit session key mapping
- load previous session behavior aligned to browser-session expectation
- custom styling aligned to DhakaWatch branding

## 8.3 Replace analyze and report callers

1. Repoint analyze UI flow to n8n image webhook.
2. Repoint report UI flow to n8n report webhook.
3. Keep current frontend response parsing resilient to partial failures.
4. Surface user-safe errors and fallback suggestions.

## 9) Prompt and Policy Design

## 9.1 System prompt requirements

Must include:

1. Dhaka-first interpretation rules
2. Scientific and legal wording constraints
3. Tool usage policy: always query tools for factual claims when possible
4. Honest uncertainty handling when data is absent
5. No fabricated metrics or unsupported sensor claims

## 9.2 Prohibited claim blocklist

Hard-enforce these restrictions:

- no real-time claim for Sentinel-2 based outputs
- no thermal assertions from Sentinel-2
- no dissolved oxygen direct measurement claim from Sentinel-2
- no court-admissible or legal-grade proof language
- no arbitrary threat score scales

## 9.3 Output style guide

Responses should be:

- concise first answer, then optional detail
- area-specific
- evidence-aware with tool source labels
- transparent about uncertainty and resolution limits

## 10) Security and Access Control

1. Restrict n8n Chat Trigger Allowed Origins to production domains only.
2. Protect internal tool endpoints with a shared secret header where appropriate.
3. Rate-limit user-facing workflow entry points.
4. Avoid exposing internal diagnostics to end users.
5. Store credentials only in n8n credential manager and platform environment secrets.
6. Mask sensitive fields in execution logs where needed.

## 11) Observability and Operations

## 11.1 Metrics to track

- chat request count and latency
- tool call count by endpoint
- tool error rate by endpoint
- fallback response rate
- average tokens and generation duration
- user cancellation rate during long responses

## 11.2 Logs to capture

Each execution should include:

- request id
- session id hash
- workflow id and version
- selected tools
- upstream API status and duration
- final response mode (streaming or non-streaming)

## 11.3 Alert thresholds

Set alerts for:

- sudden increase in tool failure rate
- major latency regression
- repeated prohibited claim violations in QA checks

## 12) Testing and Validation Matrix

## 12.1 Functional tests

1. Pollution questions by named area and ward
2. Factory attribution questions for known hotspots
3. River and waterway context queries
4. Encroachment and erosion explanation prompts
5. Mixed-intent questions spanning multiple domains

## 12.2 Data quality tests

1. Responses must cite tool-derived facts when available.
2. Responses must degrade gracefully when tools fail.
3. No hallucinated values for unavailable metrics.

## 12.3 Policy tests

1. Real-time wording not present for Sentinel-2 context.
2. Thermal claim from Sentinel-2 never present.
3. Legal-grade evidence wording never present.
4. Dissolved oxygen direct measure claim absent.

## 12.4 Resilience tests

1. Overpass timeout simulation
2. GEE timeout simulation
3. No data in selected area
4. Invalid bbox and malformed area names
5. Long prompts and prompt truncation handling

## 13) Hard Cutover Runbook

## 13.1 T-7 to T-3 days

1. Finalize tool contracts and endpoint safeguards.
2. Complete n8n workflows in staging.
3. Execute full QA matrix and record defects.
4. Resolve all P0 and P1 defects.

## 13.2 T-2 to T-1 days

1. Freeze legacy AI code changes.
2. Re-run smoke tests in production-like environment.
3. Confirm CORS and webhook routing.
4. Confirm secrets and credential validity.

## 13.3 Launch day

1. Deploy frontend with n8n embed and new webhook config.
2. Activate n8n production workflows.
3. Disable legacy AI route usage in app paths.
4. Run live smoke test checklist.
5. Monitor metrics every 15 minutes for first 4 hours.

## 13.4 First 48 hours

1. Track failure trends and prompt edge cases.
2. Patch workflow prompt and tool routing issues quickly.
3. Publish daily incident summary for team.

## 14) Decommission Plan for Legacy AI Paths

After successful cutover validation:

1. Disable or remove:
   - /api/ai/chat
   - /api/ai/analyze
   - /api/ai/report
2. Reduce unused Gemini service code paths.
3. Keep all geospatial intelligence routes active as tools.
4. Update technical docs and architecture diagrams.

## 15) Detailed Work Breakdown and Timeline

## Week 1: Foundation and contracts

- Define response contracts and policy guardrails
- Harden tool endpoints and error envelopes
- Implement n8n workflow skeletons
- Add observability baseline

Deliverables:

- Stable tool contracts
- Workflow stubs for chat, analyze, report
- Approved system prompt and policy doc

## Week 2: Integration and parity

- Wire frontend embed chat
- Route analyze and report to n8n webhooks
- Implement final tool routing and prompt tuning
- Run full functional and policy test matrix

Deliverables:

- End-to-end parity in staging
- Test report with pass and fail details
- Launch readiness checklist

## Week 3: Cutover and stabilization

- Hard cutover to production
- Monitor and fix production issues
- Decommission legacy AI routes
- Close post-launch documentation

Deliverables:

- Production n8n-first AI stack
- Legacy route decommission summary
- Final migration sign-off

## 16) Risk Register

1. Risk: Tool latency spikes from external dependencies
   - Mitigation: bounded retries, timeout guards, fallback messaging
2. Risk: Agent answer quality drops on complex queries
   - Mitigation: enforce tool-first prompt policy, add targeted examples
3. Risk: Hard cutover regressions without fallback path
   - Mitigation: pre-launch QA depth, launch-day monitoring, rapid patch window
4. Risk: Session continuity confusion for users
   - Mitigation: clear UX copy and session behavior explanation
5. Risk: Policy violations in generated text
   - Mitigation: strict prompt constraints plus output validation checks

## 17) Go-Live Checklist

- n8n workflows active in production
- Allowed origins configured correctly
- Webhook URLs configured in frontend env
- Streaming verified end-to-end
- Tool endpoints validated and monitored
- Policy QA suite passed
- Legacy AI routes disabled in user flows

## 18) Post-Launch Improvement Backlog

After stable launch, prioritize:

1. Introduce persistent memory backend if needed (Redis or Postgres)
2. Add richer tool citation formatting in responses
3. Add multilingual UI and response adaptation
4. Add automated evaluation harness for monthly quality audits
5. Add workflow versioning policy and rollback playbook

## 19) Definition of Done

Migration is done when:

1. n8n workflows own all three AI capabilities in production
2. All critical user journeys pass with data-grounded responses
3. Policy constraints remain consistently enforced
4. Legacy AI routes are fully decommissioned from active paths
5. Team signs off on stability, accuracy, and maintainability
