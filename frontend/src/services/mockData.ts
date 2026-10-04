import { BryntumProjectData, Milestone, BryntumDependency, EscrowStatusSummary, AuditEvent, VerificationResult } from '../types';

export interface PresetContract {
  key: string;
  name: string;
  tagline: string;
  totalBudget: number;
  milestonesCount: number;
  contractText: string;
}

export const PRESET_CONTRACTS: PresetContract[] = [
  {
    key: 'defi',
    name: 'Web3 DeFi Exchange Build',
    tagline: 'High-security smart contract DEX with liquidity pools & Uniswap V3 vaults',
    totalBudget: 2800,
    milestonesCount: 4,
    contractText: `STATEMENT OF WORK: DECENTRALIZED EXCHANGE ENGINE (DEX)
Client: AlphaVentures DAO
Contractor: Lead Solidity Protocol Architect
Total Authorized Escrow: $2,800.00 USD (Held in PayPal Sandbox Escrow)

DELIVERABLES & SCHEDULE:
1. Smart Contract Architecture & Slither Audit ($700.00 USD - 4 Days)
   - ERC-20 token vault logic, Uniswap V3 LP router integration.
   - Acceptance: 0 critical/high Slither findings; 48 Hardhat unit tests pass.

2. Liquidity Pool Router & Subgraph Indexer ($840.00 USD - 5 Days)
   - The Graph protocol indexing subgraph on Sepolia testnet.
   - Acceptance: Subgraph sync latency <2 blocks; GraphQL query response <80ms.

3. Next.js Trading Terminal UI & Web3 Modal ($700.00 USD - 6 Days)
   - Real-time TradingView charts, slippage tolerance settings, MetaMask/Coinbase wallet connectors.
   - Acceptance: Zero layout shifts, cross-browser compatibility certified.

4. Production Deploy, Gas Optimization & Mainnet Verification ($560.00 USD - 4 Days)
   - Gnosis multi-sig ownership handover, Etherscan verified code, gas savings >=22%.
   - Acceptance: Multi-sig simulation pass and automated CI release tag.`,
  },
  {
    key: 'rag',
    name: 'Enterprise LLM RAG Pipeline',
    tagline: 'Hybrid search Qdrant vector engine, LangGraph self-reflection & guardrails',
    totalBudget: 1500,
    milestonesCount: 3,
    contractText: `STATEMENT OF WORK: ENTERPRISE GENERATIVE AI & RAG SYSTEM
Client: Nexus Enterprise Analytics
Contractor: Senior AI Systems Engineer
Total Authorized Escrow: $1,500.00 USD (Held in PayPal Sandbox Escrow)

DELIVERABLES & SCHEDULE:
1. Document Ingestion & Hybrid Vector Indexing ($525.00 USD - 3 Days)
   - Ingestion of 1,000+ unstructured PDFs, Qdrant cluster setup, BM25 + dense re-ranking.
   - Acceptance: Parsing benchmark <3 mins, Precision@5 > 88%.

2. Self-Correction Query Rewriter & Hallucination Guardrail ($600.00 USD - 4 Days)
   - LangGraph agentic loop with NeMo Guardrails to eliminate hallucinations and fact-check citations.
   - Acceptance: G-Eval faithfulness score >=0.92; 0 PII leaks on redteam test.

3. Production FastAPI Endpoints & Prometheus Telemetry ($375.00 USD - 3 Days)
   - SSE streaming chat endpoint, Docker containerization, Grafana dashboard.
   - Acceptance: P99 latency <800ms; 100 concurrent request load test pass.`,
  },
  {
    key: 'mobile',
    name: 'Mobile Fintech App & PayPal Checkout',
    tagline: 'React Native banking app with biometrics, PayPal Native SDK & split pay',
    totalBudget: 4000,
    milestonesCount: 5,
    contractText: `MASTER SERVICES AGREEMENT: MOBILE FINTECH APPLICATION
Client: PayPulse Financial Inc.
Contractor: Mobile Application Architect
Total Authorized Escrow: $4,000.00 USD (Held in PayPal Sandbox Escrow)

DELIVERABLES & SCHEDULE:
1. Design Tokens & Biometric Authentication Flow ($800.00 USD - 4 Days)
   - FaceID / TouchID biometric secure enclave key storage in React Native.
   - Acceptance: Biometrics tested on iOS 18 and Android 15.

2. PayPal Native SDK & Escrow Wallet Integration ($1,000.00 USD - 5 Days)
   - PayPal Orders v2 SDK native sheet, webhook listener, balance ledger.
   - Acceptance: PayPal Sandbox one-touch authorize test pass.

3. Instant P2P Split-Pay & Push Notifications ($1,000.00 USD - 5 Days)
   - QR code scanner, contact picker, and Apple APNs / Firebase messaging.
   - Acceptance: Push latency <1.5s; split math exact to the cent.

4. KYC Identity Verification & AML Compliance Module ($600.00 USD - 4 Days)
   - ID document scanner, OCR parsing, Sanction Watchlist verification mock.
   - Acceptance: Sandbox verification flow pass with end-to-end encryption.

5. App Store & Google Play Store Submission Package ($600.00 USD - 3 Days)
   - TestFlight build upload, fastlane deployment, release documentation.
   - Acceptance: Zero store compliance flags; crash-free rate >99.9%.`,
  },
];

// Helper to format dates cleanly
function fmtDate(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export function createMockProject(scenarioKey: string): BryntumProjectData {
  const key = scenarioKey.toLowerCase();

  if (key.includes('rag')) {
    const tasks: Milestone[] = [
      {
        id: 1,
        name: 'Document Ingestion & Hybrid Vector Indexing',
        startDate: fmtDate(0),
        endDate: fmtDate(3),
        duration: 3,
        progress: 100,
        amount: 525,
        currency: 'USD',
        status: 'COMPLETED',
        escrow_status: 'RELEASED',
        paypal_order_id: 'PP-AUTH-RAG-8812B',
        paypal_capture_id: 'PP-CAP-7112C3',
        verification_hash: 'sha256:88e01bf284da785c490219db8a72944bca0219c4901f829a1b',
        github_pr_url: 'https://github.com/nexus-analytics/rag-engine/pull/1',
        deliverable_description: 'Unstructured document chunking with Qdrant vector database and sparse-dense BM25 re-ranking.',
        acceptance_criteria: ['Document parser processes 1,000 PDFs in <3 mins', 'Precision@5 > 88%'],
        predecessors: [],
        assigned_resource: 'AI / ML Engineer',
        critical_path: true,
      },
      {
        id: 2,
        name: 'Self-Correction Query Rewriter & Hallucination Guardrail',
        startDate: fmtDate(3),
        endDate: fmtDate(7),
        duration: 4,
        progress: 25,
        amount: 600,
        currency: 'USD',
        status: 'IN_PROGRESS',
        escrow_status: 'HELD_IN_ESCROW',
        paypal_order_id: 'PP-AUTH-RAG-8812B',
        github_pr_url: 'https://github.com/nexus-analytics/rag-engine/pull/2',
        deliverable_description: 'LangGraph multi-step agent with NeMo Guardrails to eliminate hallucinations and fact-check citations.',
        acceptance_criteria: ['G-Eval faithfulness score >= 0.92', 'Zero PII leakage on redteam evaluation'],
        predecessors: [1],
        assigned_resource: 'AI Systems Architect',
        critical_path: true,
      },
      {
        id: 3,
        name: 'Production FastAPI Endpoints & Prometheus Telemetry',
        startDate: fmtDate(7),
        endDate: fmtDate(10),
        duration: 3,
        progress: 0,
        amount: 375,
        currency: 'USD',
        status: 'PENDING',
        escrow_status: 'HELD_IN_ESCROW',
        paypal_order_id: 'PP-AUTH-RAG-8812B',
        github_pr_url: 'https://github.com/nexus-analytics/rag-engine/pull/3',
        deliverable_description: 'Async streaming SSE response endpoint with Docker packaging and Grafana dashboard.',
        acceptance_criteria: ['P99 latency <800ms', '100 concurrent requests benchmark passed'],
        predecessors: [2],
        assigned_resource: 'Backend SRE',
        critical_path: false,
      },
    ];

    const dependencies: BryntumDependency[] = [
      { id: 'dep-1-2', from: 1, to: 2, type: 2, lag: 0 },
      { id: 'dep-2-3', from: 2, to: 3, type: 2, lag: 0 },
    ];

    return {
      project_id: 'PRJ-RAG-002',
      title: 'Enterprise LLM RAG Pipeline',
      currency: 'USD',
      total_budget: 1500,
      total_released: 525,
      total_in_escrow: 975,
      paypal_auth_order_id: 'PP-AUTH-RAG-8812B',
      tasks,
      dependencies,
      created_at: new Date().toISOString(),
      sla_hours: 48,
      dispute_grace_period_days: 7,
    };
  }

  if (key.includes('mobile') || key.includes('fintech')) {
    const tasks: Milestone[] = [
      {
        id: 1,
        name: 'Design Tokens & Biometric Authentication Flow',
        startDate: fmtDate(0),
        endDate: fmtDate(4),
        duration: 4,
        progress: 100,
        amount: 800,
        currency: 'USD',
        status: 'COMPLETED',
        escrow_status: 'RELEASED',
        paypal_order_id: 'PP-AUTH-MOB-9932A',
        paypal_capture_id: 'PP-CAP-1049D5',
        verification_hash: 'sha256:55ab29c0174be891275902148da39bca920194bc0281a179',
        github_pr_url: 'https://github.com/paypulse/mobile-wallet/pull/1',
        deliverable_description: 'Figma-accurate React Native screens with FaceID / TouchID keychain secure storage.',
        acceptance_criteria: ['Biometric unlock passes on iOS & Android', 'OWASP mobile compliance validated'],
        predecessors: [],
        assigned_resource: 'Mobile Architect',
        critical_path: true,
      },
      {
        id: 2,
        name: 'PayPal Native SDK & Escrow Wallet Integration',
        startDate: fmtDate(4),
        endDate: fmtDate(9),
        duration: 5,
        progress: 60,
        amount: 1000,
        currency: 'USD',
        status: 'IN_PROGRESS',
        escrow_status: 'HELD_IN_ESCROW',
        paypal_order_id: 'PP-AUTH-MOB-9932A',
        github_pr_url: 'https://github.com/paypulse/mobile-wallet/pull/2',
        deliverable_description: 'PayPal Checkout Orders v2 native sheet, webhook notification listener, and balance ledger.',
        acceptance_criteria: ['PayPal Sandbox one-touch authorize test passes', 'Webhook signature verification validated'],
        predecessors: [1],
        assigned_resource: 'Fintech Integration Engineer',
        critical_path: true,
      },
      {
        id: 3,
        name: 'Instant P2P Split-Pay & Push Notifications',
        startDate: fmtDate(9),
        endDate: fmtDate(14),
        duration: 5,
        progress: 0,
        amount: 1000,
        currency: 'USD',
        status: 'PENDING',
        escrow_status: 'HELD_IN_ESCROW',
        paypal_order_id: 'PP-AUTH-MOB-9932A',
        github_pr_url: 'https://github.com/paypulse/mobile-wallet/pull/3',
        deliverable_description: 'QR code scanner, contact picker, and Apple APNs / Firebase cloud messaging integration.',
        acceptance_criteria: ['Push delivery latency < 1.5s', 'Splits accurately sum to exact cents'],
        predecessors: [2],
        assigned_resource: 'Fullstack Mobile Engineer',
        critical_path: true,
      },
      {
        id: 4,
        name: 'KYC Identity Verification & AML Compliance Module',
        startDate: fmtDate(14),
        endDate: fmtDate(18),
        duration: 4,
        progress: 0,
        amount: 600,
        currency: 'USD',
        status: 'PENDING',
        escrow_status: 'HELD_IN_ESCROW',
        paypal_order_id: 'PP-AUTH-MOB-9932A',
        github_pr_url: 'https://github.com/paypulse/mobile-wallet/pull/4',
        deliverable_description: 'Government ID upload with AI OCR parsing and Sanction Watchlist verification mock.',
        acceptance_criteria: ['Document verification sandbox passes', 'Encrypted PII in Transit and Rest'],
        predecessors: [3],
        assigned_resource: 'Compliance Engineer',
        critical_path: false,
      },
      {
        id: 5,
        name: 'App Store & Google Play Store Submission Package',
        startDate: fmtDate(18),
        endDate: fmtDate(21),
        duration: 3,
        progress: 0,
        amount: 600,
        currency: 'USD',
        status: 'PENDING',
        escrow_status: 'HELD_IN_ESCROW',
        paypal_order_id: 'PP-AUTH-MOB-9932A',
        github_pr_url: 'https://github.com/paypulse/mobile-wallet/pull/5',
        deliverable_description: 'TestFlight build upload, fastlane deployment, release documentation.',
        acceptance_criteria: ['Zero store compliance flags', 'Crash-free rate >99.9%'],
        predecessors: [4],
        assigned_resource: 'Release Engineer',
        critical_path: false,
      },
    ];

    const dependencies: BryntumDependency[] = [
      { id: 'dep-1-2', from: 1, to: 2, type: 2, lag: 0 },
      { id: 'dep-2-3', from: 2, to: 3, type: 2, lag: 0 },
      { id: 'dep-3-4', from: 3, to: 4, type: 2, lag: 0 },
      { id: 'dep-4-5', from: 4, to: 5, type: 2, lag: 0 },
    ];

    return {
      project_id: 'PRJ-MOB-003',
      title: 'Mobile Fintech App & PayPal Checkout',
      currency: 'USD',
      total_budget: 4000,
      total_released: 800,
      total_in_escrow: 3200,
      paypal_auth_order_id: 'PP-AUTH-MOB-9932A',
      tasks,
      dependencies,
      created_at: new Date().toISOString(),
      sla_hours: 48,
      dispute_grace_period_days: 7,
    };
  }

  // Default: DeFi scenario
  const tasks: Milestone[] = [
    {
      id: 1,
      name: 'Smart Contract Architecture & Slither Audit',
      startDate: fmtDate(-4),
      endDate: fmtDate(0),
      duration: 4,
      progress: 100,
      amount: 700,
      currency: 'USD',
      status: 'COMPLETED',
      escrow_status: 'RELEASED',
      paypal_order_id: 'PP-AUTH-DEFI-98A1B',
      paypal_capture_id: 'PP-CAP-4091A8',
      verification_hash: 'sha256:7f9a8b11c03e84d1fa34e209848529283f512019aa59d28e71',
      github_pr_url: 'https://github.com/alphaventures-dao/dex-core/pull/1',
      deliverable_description: 'ERC-20/Uniswap V3 Vault contracts with 100% test coverage and Slither security report.',
      acceptance_criteria: ['Slither report: 0 high vulnerabilities', 'Hardhat suite passes 48 unit tests'],
      predecessors: [],
      assigned_resource: 'Solidity Security Architect',
      critical_path: true,
    },
    {
      id: 2,
      name: 'Liquidity Pool Router & Subgraph Indexer',
      startDate: fmtDate(0),
      endDate: fmtDate(5),
      duration: 5,
      progress: 100,
      amount: 840,
      currency: 'USD',
      status: 'COMPLETED',
      escrow_status: 'RELEASED',
      paypal_order_id: 'PP-AUTH-DEFI-98A1B',
      paypal_capture_id: 'PP-CAP-9921B7',
      verification_hash: 'sha256:3d9c44018fba819e075ac02498520285a8219cda744e8011c3',
      github_pr_url: 'https://github.com/alphaventures-dao/dex-core/pull/2',
      deliverable_description: 'High-throughput Graph Protocol subgraph deployed on Sepolia testnet with GraphQL query interface.',
      acceptance_criteria: ['Subgraph indexing latency <2 blocks', 'Query response time <80ms'],
      predecessors: [1],
      assigned_resource: 'DeFi Protocol Engineer',
      critical_path: true,
    },
    {
      id: 3,
      name: 'Next.js Trading Terminal UI & Web3 Modal',
      startDate: fmtDate(5),
      endDate: fmtDate(11),
      duration: 6,
      progress: 40,
      amount: 700,
      currency: 'USD',
      status: 'IN_PROGRESS',
      escrow_status: 'HELD_IN_ESCROW',
      paypal_order_id: 'PP-AUTH-DEFI-98A1B',
      github_pr_url: 'https://github.com/alphaventures-dao/dex-core/pull/3',
      deliverable_description: 'Responsive TradingView chart integration with MetaMask and Coinbase wallet connectors.',
      acceptance_criteria: ['Zero layout shifts', 'Slippage tolerance settings test verified'],
      predecessors: [2],
      assigned_resource: 'Frontend Lead',
      critical_path: true,
    },
    {
      id: 4,
      name: 'Production Deploy, Gas Optimization & Mainnet Verification',
      startDate: fmtDate(11),
      endDate: fmtDate(15),
      duration: 4,
      progress: 0,
      amount: 560,
      currency: 'USD',
      status: 'PENDING',
      escrow_status: 'HELD_IN_ESCROW',
      paypal_order_id: 'PP-AUTH-DEFI-98A1B',
      github_pr_url: 'https://github.com/alphaventures-dao/dex-core/pull/4',
      deliverable_description: 'Multi-sig Gnosis Safe setup, verified Etherscan contracts, and CI/CD deployment pipeline.',
      acceptance_criteria: ['Contract verified on Etherscan', 'Gas cost reduction >= 22%'],
      predecessors: [3],
      assigned_resource: 'DevOps & SRE',
      critical_path: false,
    },
  ];

  const dependencies: BryntumDependency[] = [
    { id: 'dep-1-2', from: 1, to: 2, type: 2, lag: 0 },
    { id: 'dep-2-3', from: 2, to: 3, type: 2, lag: 0 },
    { id: 'dep-3-4', from: 3, to: 4, type: 2, lag: 0 },
  ];

  return {
    project_id: 'PRJ-DEFI-001',
    title: 'Web3 DeFi Exchange Build',
    currency: 'USD',
    total_budget: 2800,
    total_released: 1540,
    total_in_escrow: 1260,
    paypal_auth_order_id: 'PP-AUTH-DEFI-98A1B',
    tasks,
    dependencies,
    created_at: new Date().toISOString(),
    sla_hours: 48,
    dispute_grace_period_days: 7,
  };
}

export function createMockAuditEvents(scenarioKey: string): AuditEvent[] {
  const key = scenarioKey.toLowerCase();

  if (key.includes('rag')) {
    return [
      {
        id: 'EVT-RAG-002',
        event_type: 'PAYPAL_CAPTURE',
        milestone_id: 1,
        title: 'PayPal Milestone Payout Released: $525.00 USD',
        description: 'Automated capture executed. Capture ID: PP-CAP-7112C3 on Order: PP-AUTH-RAG-8812B. Net disbursed to freelancer: $514.50 (2% platform fee: $10.50).',
        paypal_order_id: 'PP-AUTH-RAG-8812B',
        paypal_capture_id: 'PP-CAP-7112C3',
        amount: 525,
        currency: 'USD',
        verification_hash: 'sha256:88e01bf284da785c490219db8a72944bca0219c4901f829a1b',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        severity: 'SUCCESS',
        metadata: { capture_id: 'PP-CAP-7112C3', fee: 10.5, net: 514.5 },
      },
      {
        id: 'EVT-RAG-001',
        event_type: 'ESCROW_LOCKED',
        title: 'PayPal Escrow Authorized: Enterprise LLM RAG Pipeline',
        description: '$1,500.00 USD authorized across 3 milestones. PayPal Order: PP-AUTH-RAG-8812B',
        paypal_order_id: 'PP-AUTH-RAG-8812B',
        amount: 1500,
        currency: 'USD',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        severity: 'SUCCESS',
        metadata: { milestones_count: 3 },
      },
    ];
  }

  if (key.includes('mobile') || key.includes('fintech')) {
    return [
      {
        id: 'EVT-MOB-002',
        event_type: 'PAYPAL_CAPTURE',
        milestone_id: 1,
        title: 'PayPal Milestone Payout Released: $800.00 USD',
        description: 'Automated capture executed. Capture ID: PP-CAP-1049D5 on Order: PP-AUTH-MOB-9932A. Net disbursed: $784.00 (2% fee: $16.00).',
        paypal_order_id: 'PP-AUTH-MOB-9932A',
        paypal_capture_id: 'PP-CAP-1049D5',
        amount: 800,
        currency: 'USD',
        verification_hash: 'sha256:55ab29c0174be891275902148da39bca920194bc0281a179',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        severity: 'SUCCESS',
        metadata: { capture_id: 'PP-CAP-1049D5', fee: 16.0, net: 784.0 },
      },
      {
        id: 'EVT-MOB-001',
        event_type: 'ESCROW_LOCKED',
        title: 'PayPal Escrow Authorized: Mobile Fintech App & PayPal Checkout',
        description: '$4,000.00 USD authorized across 5 milestones. PayPal Order: PP-AUTH-MOB-9932A',
        paypal_order_id: 'PP-AUTH-MOB-9932A',
        amount: 4000,
        currency: 'USD',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        severity: 'SUCCESS',
        metadata: { milestones_count: 5 },
      },
    ];
  }

  // Default DeFi
  return [
    {
      id: 'EVT-DEFI-004',
      event_type: 'PAYPAL_CAPTURE',
      milestone_id: 2,
      title: 'PayPal Milestone Payout Released: $840.00 USD',
      description: 'Automated capture executed. Capture ID: PP-CAP-9921B7 on Order: PP-AUTH-DEFI-98A1B. Net disbursed to freelancer: $823.20 (2% platform fee: $16.80).',
      paypal_order_id: 'PP-AUTH-DEFI-98A1B',
      paypal_capture_id: 'PP-CAP-9921B7',
      amount: 840,
      currency: 'USD',
      verification_hash: 'sha256:3d9c44018fba819e075ac02498520285a8219cda744e8011c3',
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      severity: 'SUCCESS',
      metadata: { capture_id: 'PP-CAP-9921B7', fee: 16.8, net: 823.2 },
    },
    {
      id: 'EVT-DEFI-003',
      event_type: 'PR_VERIFICATION',
      milestone_id: 2,
      title: 'AI Cryptographic Deliverable Verified: Liquidity Pool Router & Subgraph Indexer',
      description: 'GitHub PR #2 verified. Coverage: 96.4%, Score: 98.1%. Proof Hash: sha256:3d9c44018fba819e...',
      verification_hash: 'sha256:3d9c44018fba819e075ac02498520285a8219cda744e8011c3',
      currency: 'USD',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      severity: 'INFO',
      metadata: { coverage_pct: 96.4, score: 98.1 },
    },
    {
      id: 'EVT-DEFI-002',
      event_type: 'PAYPAL_CAPTURE',
      milestone_id: 1,
      title: 'PayPal Milestone Payout Released: $700.00 USD',
      description: 'Automated capture executed. Capture ID: PP-CAP-4091A8 on Order: PP-AUTH-DEFI-98A1B. Net disbursed to freelancer: $686.00 (2% platform fee: $14.00).',
      paypal_order_id: 'PP-AUTH-DEFI-98A1B',
      paypal_capture_id: 'PP-CAP-4091A8',
      amount: 700,
      currency: 'USD',
      verification_hash: 'sha256:7f9a8b11c03e84d1fa34e209848529283f512019aa59d28e71',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      severity: 'SUCCESS',
      metadata: { capture_id: 'PP-CAP-4091A8', fee: 14.0, net: 686.0 },
    },
    {
      id: 'EVT-DEFI-001',
      event_type: 'ESCROW_LOCKED',
      title: 'PayPal Escrow Authorized: Web3 DeFi Exchange Build',
      description: '$2,800.00 USD authorized across 4 milestones. PayPal Order: PP-AUTH-DEFI-98A1B',
      paypal_order_id: 'PP-AUTH-DEFI-98A1B',
      amount: 2800,
      currency: 'USD',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      severity: 'SUCCESS',
      metadata: { milestones_count: 4 },
    },
  ];
}

export function createMockEscrowSummary(project: BryntumProjectData): EscrowStatusSummary {
  const completed = project.tasks.filter((t) => t.status === 'COMPLETED' || t.escrow_status === 'RELEASED').length;
  const pending = project.tasks.length - completed;
  const platformFee = Math.round(project.total_released * 0.02 * 100) / 100;
  const netDisbursed = Math.round((project.total_released - platformFee) * 100) / 100;

  return {
    project_id: project.project_id,
    title: project.title,
    total_budget: project.total_budget,
    total_in_escrow: project.total_in_escrow,
    total_released: project.total_released,
    milestones_count: project.tasks.length,
    completed_milestones: completed,
    pending_milestones: pending,
    paypal_auth_order_id: project.paypal_auth_order_id,
    paypal_status: project.total_in_escrow > 0 ? 'AUTHORIZED' : 'SETTLED',
    is_live_sandbox: false,
    platform_take_rate_pct: 2.0,
    total_platform_revenue: platformFee,
    net_freelancer_disbursed: netDisbursed,
  };
}
