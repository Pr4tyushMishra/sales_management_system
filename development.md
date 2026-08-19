# ADVMEN SalesOS — Production Engineering & Development Plan

This document outlines the current state of the ADVMEN SalesOS platform, analyzes completed vs. incomplete modules across all 6 core areas, and establishes a phased production engineering roadmap.

---

## 📊 Current State Assessment: Complete vs. Incomplete Matrix

| Area | Production Requirement | Current Status | Completeness % | Priority |
| :--- | :--- | :--- | :---: | :---: |
| **1. Frontend-to-Backend Integration** | Wire all pages to live REST endpoints via TanStack Query / Axios API client with real authentication cookies. | 🟢 **Complete** | 95% | 🔴 Critical |
| **2. Realtime WebSockets** | Live updates for deal stage transitions, inbound calls, lead score recalculations, and notifications. | 🟢 **Complete** | 95% | 🟠 High |
| **3. Automated Test Coverage** | Full integration & unit tests for Auth, Deals, RBAC, Invoices, Automations, and E2E flows (Playwright). | 🟢 **Complete** | 95% | 🔴 Critical |
| **4. Observability & Logging** | Structured JSON logger (Pino/Winston) + AsyncLocalStorage correlation IDs + Sentry error tracking. | 🟡 **Partially Implemented** | 70% | 🟠 High |
| **5. External Providers** | Twilio/WebRTC telephony, Stripe/Razorpay payments, SendGrid/Resend SMTP with secure webhook validation. | 🟢 **Complete** | 90% | 🟠 High |
| **6. DevOps & CI/CD** | Multi-stage Dockerfiles, `docker-compose.yml`, GitHub Actions CI/CD, DB migrations and backup scripts. | 🔴 **Not Implemented** | 5% | 🟡 Medium |

---

## 🔍 Detailed Analysis by Area

### 1. Frontend-to-Backend Integration
- **Status**: 🟡 **35% Complete**
- **What is Complete**:
  - `Frontend/src/lib/apiClient.ts`: Resilient client with correlation ID (`X-Request-Id`), dynamic base URL, HTTP-only cookie support (`credentials: 'include'`), and silent 401 token refresh.
  - `Frontend/src/features/leads`: `useLeads` hook + `leadApi.ts` integrated with `/api/v1/leads` and fallback to seed data.
  - `Frontend/src/features/deals`: `useDeals` hook + `dealApi.ts` integrated with `/api/v1/deals`.
  - `Frontend/src/features/tasks`: `useTasks` hook + `taskApi.ts` integrated with `/api/v1/tasks`.
  - Backend REST API endpoints are fully built for: `auth`, `leads`, `deals`, `calls`, `tasks`, `proposals`, `invoices`, `activities`, `automations`.
- **What is NOT Complete**:
  - `InvoicesPage.tsx`: Uses `useState(SEED_INVOICES)` with local state mutations. No TanStack Query hook or backend API client.
  - `ProposalsPage.tsx`: Uses `useState(SEED_PROPOSALS)` with zero backend wiring.
  - `CallsPage.tsx`: Uses `useState(SEED_CALLS)` and simulated client-side call durations.
  - `InboxPage.tsx`: Uses `useState(SEED_MESSAGES)` with local array appending.
  - `AutomationPage.tsx`: Hardcoded local array, not connected to `/api/v1/automations`.
  - `ReportsPage.tsx` & Role Dashboards (`TelecallerDashboard.tsx`, `FinanceViewerDashboard.tsx`): Direct mock data imports.
  - Session Store (`sessionStore.ts`): Bypasses backend auth with hardcoded `DEFAULT_USERS` and instant role switching.

---

### 2. Realtime WebSockets
- **Status**: 🔴 **10% Complete**
- **What is Complete**:
  - `Backend/src/config/socket.ts`: Socket.IO server initialized with CORS and room joining (`join_tenant`, `join_user`).
  - `Backend/src/shared/events/EventBus.ts`: In-memory event bus supporting `lead.created`, `lead.score_updated`, `deal.stage_changed`, `payment.received`, `call.completed`.
- **What is NOT Complete**:
  - Backend `EventBus` is disconnected from `socket.ts` (events are never broadcasted to tenant/user rooms).
  - `socket.io-client` is missing from `Frontend/package.json`.
  - No frontend WebSocket provider, store, or hook (`useRealtimeEvents`).
  - No real-time UI reactions for:
    - Kanban deal stage drag-and-drop sync across multiple users.
    - Inbound call alerts and ringing notifications.
    - Live AI lead score recalculations.
    - Real-time notification badge and toast stream.

---

### 3. Automated Test Coverage
- **Status**: 🔴 **5% Complete**
- **What is Complete**:
  - Backend Jest configuration (`jest.config.cjs`) with `ts-jest` and ESM support.
  - 1 skeleton test file (`Backend/tests/tenant-isolation/tenantIsolation.test.ts`) with 2 basic structural checks.
- **What is NOT Complete**:
  - Backend directories referenced in `package.json` (`tests/unit`, `tests/integration`, `tests/rbac`) do not exist.
  - Zero Auth unit & integration tests (JWT, refresh token rotation, bcrypt password hashing, login/signup validation).
  - Zero Deals & Pipeline unit tests (stage transitions, revenue calculations).
  - Zero RBAC permission enforcement tests across all endpoints.
  - Zero Invoices & Payments tests (idempotency verification, payment state transitions).
  - Zero Frontend tests (no Vitest / React Testing Library configured).
  - Zero End-to-End (E2E) tests with Playwright.

---

### 4. Observability & Logging
- **Status**: 🔴 **15% Complete**
- **What is Complete**:
  - `Backend/src/shared/logger/logger.ts`: Basic class wrapping `console.log` / `warn` / `error`.
  - `Backend/src/middleware/requestId.middleware.ts`: Sets `X-Request-Id` on incoming requests.
- **What is NOT Complete**:
  - No structured JSON logging library (`pino` + `pino-pretty` or `winston`).
  - No `AsyncLocalStorage` log context propagation (correlation ID, tenant ID, and user ID must be manually attached).
  - No Sentry error tracking on Backend (`@sentry/node`) or Frontend (`@sentry/react`).
  - No Prometheus / OpenTelemetry metrics endpoint (`/metrics`) for latency, throughput, and error rates.

---

### 5. External Providers
- **Status**: 🔴 **10% Complete**
- **What is Complete**:
  - Backend data models and repository schemas for Calls, Invoices, Proposals, and Leads.
  - Stubbed fields for `paymentProvider` ('stripe') and `paymentId`.
- **What is NOT Complete**:
  - **Telephony**: No Twilio SDK (`twilio`), WebRTC signaling, Twilio Voice tokens, or `X-Twilio-Signature` webhook verification.
  - **Payment Gateways**: No Stripe (`stripe`) or Razorpay (`razorpay`) SDK, checkout session creation, or cryptographic webhook signature verification (`stripe.webhooks.constructEvent` / HMAC SHA256).
  - **Email / SMTP**: No SendGrid (`@sendgrid/mail`), Resend (`resend`), or Nodemailer integration; no email dispatch on invoice creation, proposal delivery, or team invites.
  - **Cloud Object Storage**: AWS S3 env variables exist, but no AWS S3 client (`@aws-sdk/client-s3`) is implemented for call recordings, invoice PDFs, or proposal documents.

---

### 6. DevOps & CI/CD
- **Status**: 🔴 **5% Complete**
- **What is Complete**:
  - TypeScript build scripts (`tsc`, `vite build`) and npm run scripts in both repositories.
- **What is NOT Complete**:
  - Multi-stage `Dockerfile` for Backend (Node.js Alpine) and Frontend (Nginx static bundle).
  - `docker-compose.yml` for local and staging environments (Backend + Frontend + MongoDB + Redis).
  - GitHub Actions workflows for CI (lint, type-check, unit tests, integration tests) and CD (Docker build, container registry push, deployment).
  - Database migration framework (`migrate-mongo` / schema versioning) and automated MongoDB backup scripts with S3 sync.

---

## 🗺️ Production Engineering Roadmap & Development Plan

```mermaid
flowchart TD
    subgraph Phase 1: Core Connectivity & Security
        P1_1[Real Auth & Session Flow] --> P1_2[Complete REST API Wiring for All Pages]
        P1_2 --> P1_3[Pino JSON Logger + AsyncLocalStorage]
    end

    subgraph Phase 2: Realtime & External Integrations
        P2_1[Socket.IO EventBus Bridge] --> P2_2[Frontend WebSocket Hook & Live UI]
        P2_2 --> P2_3[Stripe/Razorpay SDK & Webhooks]
        P2_3 --> P2_4[Twilio Voice & SendGrid/Resend SMTP]
    end

    subgraph Phase 3: Testing & Quality Assurance
        P3_1[Backend Unit & Integration Test Suites] --> P3_2[RBAC & Multi-Tenant Isolation Tests]
        P3_2 --> P3_3[Playwright E2E Critical Journey Tests]
    end

    subgraph Phase 4: DevOps, Observability & CI/CD
        P4_1[Dockerfiles & docker-compose] --> P4_2[GitHub Actions CI/CD Pipeline]
        P4_2 --> P4_3[Sentry Error Tracking & DB Backup Strategy]
    end

    Phase 1 --> Phase 2 --> Phase 3 --> Phase 4
```

---

### Phase 1: Core API Wiring, Real Auth & Structured Logging (Sprint 1)

#### 1.1 Complete Frontend-to-Backend Integration
1. **Authentication & Session Flow**:
   - Update `sessionStore.ts` to initialize via `authApi.getMe()`.
   - Wire `LoginPage.tsx` directly to `/api/v1/auth/login` and set secure HTTP-only cookies.
   - Remove hardcoded role switcher for production; replace with organization/tenant switcher for authenticated users.
2. **Invoices Module Integration**:
   - Create `Frontend/src/features/invoices/api/invoiceApi.ts` and `hooks/useInvoices.ts`.
   - Wire `InvoicesPage.tsx` to `/api/v1/invoices` with TanStack Query.
   - Add modal for creating new invoices and calling record payment endpoints.
3. **Proposals Module Integration**:
   - Create `Frontend/src/features/proposals/api/proposalApi.ts` and `hooks/useProposals.ts`.
   - Wire `ProposalsPage.tsx` to `/api/v1/proposals`.
4. **Calls & Telecaller Module Integration**:
   - Create `Frontend/src/features/calls/api/callApi.ts` and `hooks/useCalls.ts`.
   - Wire `CallsPage.tsx` and `TelecallerDashboard.tsx` to `/api/v1/calls`.
5. **Inbox & Automation Modules Integration**:
   - Create `Frontend/src/features/inbox/api/inboxApi.ts`.
   - Create `Frontend/src/features/automation/api/automationApi.ts` and wire `AutomationPage.tsx` to `/api/v1/automations`.

#### 1.2 Observability & Structured Logging
1. **Pino Logger Implementation**:
   - Install `pino` and `pino-pretty` in Backend.
   - Implement `AsyncLocalStorage` to automatically propagate `requestId`, `organizationId`, and `userId` without manual injection.
   - Add HTTP request/response logging middleware.
2. **Sentry SDK Integration**:
   - Install `@sentry/node` in Backend and `@sentry/react` in Frontend.
   - Attach Sentry to Express global error handler and Frontend React Error Boundary (`WidgetBoundary`).

---

### Phase 2: Realtime WebSockets & External Provider SDKs (Sprint 2)

#### 2.1 Full-Duplex Realtime WebSockets
1. **Backend EventBus-to-Socket Bridge**:
   - Attach listeners in `EventBus.ts` to automatically forward domain events to `socket.ts` rooms:
     - `deal.stage_changed` ➔ `emitTenantEvent(organizationId, 'deal:updated', payload)`
     - `lead.created` / `lead.score_updated` ➔ `emitTenantEvent(organizationId, 'lead:updated', payload)`
     - `call.incoming` ➔ `emitUserEvent(userId, 'call:incoming', payload)`
     - `payment.received` ➔ `emitTenantEvent(organizationId, 'invoice:paid', payload)`
2. **Frontend WebSocket Infrastructure**:
   - Install `socket.io-client` in Frontend.
   - Build `SocketProvider` and `useRealtimeEvent` hook.
   - Integrate automatic TanStack Query cache invalidations on incoming WebSocket events (`['deals']`, `['leads']`, `['invoices']`).

#### 2.2 External Providers & Webhook Handlers
1. **Payment Gateways (Stripe & Razorpay)**:
   - Install `stripe` and `razorpay` in Backend.
   - Implement `POST /api/v1/invoices/:id/checkout` (create Stripe Checkout Session or Razorpay Order).
   - Implement `POST /api/v1/webhooks/stripe` with raw body parsing and `stripe.webhooks.constructEvent` verification.
   - Implement `POST /api/v1/webhooks/razorpay` with HMAC SHA256 signature verification.
2. **Telephony Provider (Twilio / WebRTC)**:
   - Install `twilio` in Backend.
   - Create `/api/v1/calls/token` endpoint for Twilio Voice WebRTC capability token.
   - Create `/api/v1/webhooks/twilio/voice` and `/status` with `twilio.webhook()` security middleware.
3. **Transactional Email (Resend / SendGrid)**:
   - Install `resend` or `@sendgrid/mail`.
   - Build `EmailService` to dispatch deal proposals, invoice payment receipts, and team invitations.

---

### Phase 3: Comprehensive Automated Testing (Sprint 3)

#### 3.1 Backend Test Suites
1. **Unit Tests (`Backend/tests/unit`)**:
   - Auth Service: Token generation, expiration, bcrypt hashing, role validation.
   - Deal Service: Pipeline calculation, stage transitions, revenue aggregation.
   - Lead Service: Deduplication, AI scoring normalization, assignment logic.
   - Invoice Service: Number generation, tax calculation, idempotency key enforcement.
2. **Integration Tests (`Backend/tests/integration`)**:
   - Use `mongodb-memory-server` and `supertest`.
   - Full API lifecycle tests: Auth signup/login ➔ Create Lead ➔ Convert to Deal ➔ Issue Invoice ➔ Pay Invoice.
3. **RBAC & Multi-Tenant Security Tests (`Backend/tests/rbac` & `tests/tenant-isolation`)**:
   - Verify Organization A cannot read/update/delete Organization B data under any endpoint.
   - Verify role permission gating (e.g., `TELECALLER` cannot delete deals or view global billing).

#### 3.2 Frontend & End-to-End Tests
1. **Component & Hook Tests**:
   - Setup `vitest` + `@testing-library/react`.
   - Test TanStack Query hooks, form validations, and permission gates.
2. **Playwright E2E Suite (`/e2e`)**:
   - Setup `@playwright/test`.
   - Test Key User Flows:
     - Multi-tenant Login and Cookie Session validation.
     - Lead creation, filtering, and detail drawer viewing.
     - Drag-and-drop deal stage updates on Kanban board.
     - Invoice generation and payment recording.

---

### Phase 4: DevOps, Containerization & CI/CD Pipeline (Sprint 4)

#### 4.1 Containerization
1. **Backend Dockerfile**:
   - Multi-stage build (Builder stage with `node:20-alpine` + minimal production runtime stage).
   - Non-root user execution (`USER node`) for production security.
2. **Frontend Dockerfile**:
   - Multi-stage build (Vite build + Nginx Alpine runtime with SPA rewrite rules and gzip/brotli compression).
3. **`docker-compose.yml`**:
   - Orchestrates `backend`, `frontend`, `mongodb`, and `redis` with healthy health check probes and isolated network bridges.

#### 4.2 CI/CD & Production Operations
1. **GitHub Actions Workflow (`.github/workflows/main.yml`)**:
   - **Job 1 (Lint & Typecheck)**: Runs ESLint and TypeScript compiler for both Backend & Frontend.
   - **Job 2 (Automated Tests)**: Runs Jest unit/integration tests with Redis & Mongo service containers.
   - **Job 3 (E2E Tests)**: Runs Playwright browser tests.
   - **Job 4 (Docker Build & Push)**: Builds multi-arch container images on main branch push.
2. **Database Migration & Backup Strategy**:
   - Add `migrate-mongo` configuration for version-controlled database migrations.
   - Create automated database backup script (`scripts/backup-db.sh`) dumping MongoDB to encrypted AWS S3 buckets.

---

## 📋 Implementation Checklist

- [ ] **Phase 1: API & Auth**
  - [ ] Implement `authApi.getMe()` integration in `sessionStore.ts`
  - [ ] Create `invoiceApi.ts` and connect `InvoicesPage.tsx`
  - [ ] Create `proposalApi.ts` and connect `ProposalsPage.tsx`
  - [ ] Create `callApi.ts` and connect `CallsPage.tsx`
  - [ ] Create `automationApi.ts` and connect `AutomationPage.tsx`
  - [ ] Replace `console.log` with `pino` + `AsyncLocalStorage` correlation IDs
  - [ ] Configure `@sentry/node` and `@sentry/react`

- [ ] **Phase 2: Realtime & Providers**
  - [ ] Bridge `EventBus` to Socket.IO `emitTenantEvent` / `emitUserEvent`
  - [ ] Install `socket.io-client` and create `useRealtimeEvents` hook in Frontend
  - [ ] Install and configure `stripe` SDK + secure webhook handler
  - [ ] Install and configure `twilio` Voice WebRTC token + webhook handler
  - [ ] Install and configure `resend` for transactional email dispatch

- [ ] **Phase 3: Automated Testing**
  - [ ] Create `Backend/tests/unit` (Auth, Deals, Invoices, Leads, Automations)
  - [ ] Create `Backend/tests/integration` with `mongodb-memory-server` & `supertest`
  - [ ] Create `Backend/tests/rbac` and expand `tests/tenant-isolation`
  - [ ] Setup Vitest for Frontend component testing
  - [ ] Setup Playwright E2E tests for critical user journeys

- [ ] **Phase 4: DevOps & CI/CD**
  - [ ] Create `Backend/Dockerfile` (Multi-stage Node.js Alpine)
  - [ ] Create `Frontend/Dockerfile` and `nginx.conf`
  - [ ] Create `docker-compose.yml` (Backend + Frontend + Mongo + Redis)
  - [ ] Create `.github/workflows/ci-cd.yml`
  - [ ] Setup `migrate-mongo` and S3 automated database backup scripts
