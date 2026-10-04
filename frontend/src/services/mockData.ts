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
