# 🏛️ MilestonePay AI Architecture & System Specification

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer ["1. Client / Employer Layer"]
        SOW["Raw Freelance Agreement / SOW"]
        ClientAuth["PayPal Client Checkout / Authorization"]
    end

    subgraph AIEngine ["2. AI & Scheduling Engine"]
        Gemini["Google Gemini 2.5 Flash Engine"]
        Decomposer["Autonomous Contract Decomposer"]
        Bryntum["Bryntum Gantt Core Project Model"]
    end

    subgraph EscrowCore ["3. Headless Escrow & Persistence Core"]
        FastAPI["FastAPI High-Performance Async Backend"]
        DB[(SQLAlchemy ORM: Users / Contracts / Milestones / Ledger)]
        PayPalAuth["PayPal Orders v2 API (intent=AUTHORIZE)"]
        Vault["Locked PayPal Sandbox Escrow Vault"]
        Monetization["2% SaaS Take-Rate Fee Ledger"]
    end

    subgraph DeliveryVerification ["4. CI/CD & Delivery Verification"]
        Dev["Freelancer PR Delivery"]
        GitHubWebhook["GitHub Webhook Ingestion (/webhooks/github)"]
        VerifyAgent["AI Cryptographic Verification Agent"]
        ProofGen["SHA-256 Tamper-Proof Proof Generation"]
    end

    subgraph PayoutExecution ["5. Headless Payout & Telemetry"]
        HeadlessCapture["Programmatic PayPal Capture (/v2/checkout/orders/{id}/capture)"]
        Disbursement["98% Net Funds Disbursed to Freelancer"]
        PlatformFee["2% Platform Revenue Captured"]
        SSEStream["Real-Time SSE Audit Stream (/api/audit-stream)"]
        AuditLedger["Immutable Audit Ledger & Dashboard UI"]
    end

    %% Flow Connections
    SOW --> Decomposer
    Decomposer --> Gemini
    Gemini --> Bryntum
    Bryntum --> FastAPI
    FastAPI --> DB
    FastAPI --> PayPalAuth
    PayPalAuth --> Vault
    
    Dev --> GitHubWebhook
    GitHubWebhook --> VerifyAgent
    VerifyAgent --> ProofGen
    ProofGen --> HeadlessCapture
    HeadlessCapture --> Vault
    HeadlessCapture --> Disbursement
    HeadlessCapture --> PlatformFee
    PlatformFee --> Monetization
    HeadlessCapture --> SSEStream
    SSEStream --> AuditLedger
```

---

## 2. End-to-End Autonomous Pipeline (ASCII)

```
=============================================================================================================================
                                     MILESTONEPAY AI END-TO-END ESCROW DATAFLOW
=============================================================================================================================

 [ Raw Contract / SOW ]
          │
          ▼
 [ Gemini 2.5 Flash ] ───────► Natural Language Clause Decomposition into Tasks, Durations & Criteria
          │
          ▼
 [ Bryntum Gantt Tree ] ─────► End-to-Start (Type 2) Dependencies, Critical Paths & JSON Schemas
          │
          ▼
 [ PayPal Orders v2 ] ───────► POST /v2/checkout/orders (intent: "AUTHORIZE") Locks 100% of Escrow
          │
          ▼
 [ Locked Escrow Vault ] ────► PayPal Sandbox Holds Total Budget (Protected from Unauthorized Drain)
          │
          ▼
 [ Freelancer Submits PR ] ──► GitHub Webhook: POST /api/webhooks/github (action: "closed", merged: true)
          │
          ▼
 [ AI Verification Agent ] ──► Automated Unit/Integration Tests (>90% coverage) & Criteria Audit
          │
          ▼
 [ SHA-256 Proof Signed ] ───► Immutable Cryptographic Receipt Hash Created
          │
          ▼
 [ Headless Capture ] ───────► POST /v2/checkout/orders/{id}/capture Disburses Milestone Allocation
          │
          ├──► 98% Net Amount Routed to Freelancer PayPal Account
          └──► 2% Take-Rate Fee Recorded into SaaS Platform Revenue Ledger
          │
          ▼
 [ Real-Time SSE Ledger ] ───► EventSource Stream Emits Verified Transaction Proof to Live UI
=============================================================================================================================
```

---

## 3. Escrow State Machine

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Contract Ingested
    DRAFT --> AI_DECOMPOSING: Gemini 2.5 Flash Invoked
    AI_DECOMPOSING --> SCHEDULED: Bryntum Gantt Model Formed
    SCHEDULED --> AUTHORIZED: PayPal Orders v2 (intent=AUTHORIZE)
    
    state AUTHORIZED {
        [*] --> HELD_IN_ESCROW
        HELD_IN_ESCROW --> IN_PROGRESS: Contractor Commits Code
        IN_PROGRESS --> VERIFYING: PR Submitted / Webhook Fired
        VERIFYING --> AUDIT_PASSED: Tests Pass & AI Approves
        VERIFYING --> DISPUTED: Criteria Failed / SLA Breached
        AUDIT_PASSED --> CAPTURED: Headless PayPal Capture Executed
        CAPTURED --> RELEASED: 98% to Contractor, 2% to Platform
    }
    
    DISPUTED --> ARBITRATION: 48h SLA Grace Timer
    ARBITRATION --> RELEASED: Dispute Resolved
    ARBITRATION --> REFUNDED: Client Rollback
    RELEASED --> SETTLED: All Milestones Disbursed
    SETTLED --> [*]
```

---

## 4. Security & Cryptographic Proof Specification

For each milestone payout, an immutable cryptographic receipt is generated:
$$\text{Proof} = \text{SHA-256}\Big(\text{"MILESTONE\_PAY\_AI"} \,\|\, \text{MS\_ID} \,\|\, \text{Commit SHA} \,\|\, \text{Amount} \,\|\, \text{Audit Score} \,\|\, \text{Timestamp}\Big)$$

This proof is simultaneously:
1. Passed in the PayPal Capture API request note (`note_to_payer`).
2. Stored in the SQLAlchemy database `audit_logs` table.
3. Broadcasted in real-time over the Server-Sent Events (`/api/audit-stream`) to connected browser clients.
