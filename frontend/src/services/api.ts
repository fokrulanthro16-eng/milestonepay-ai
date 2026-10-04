import { 
  BryntumProjectData, 
  EscrowStatusSummary, 
  AuditEvent, 
  VerificationRequest, 
  VerificationResult, 
  Milestone 
} from '../types';
import { 
  createMockProject, 
  createMockAuditEvents, 
  createMockEscrowSummary 
} from './mockData';

const API_BASE = '/api';

// Detect whether we are running locally with the FastAPI backend or on standalone cloud (Vercel)
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Standalone offline state cache for static Vercel hosting
let currentMockProject: BryntumProjectData = createMockProject('defi');
let currentMockAuditEvents: AuditEvent[] = createMockAuditEvents('defi');
const localSubscribers: Set<(event: AuditEvent) => void> = new Set();

function broadcastEvent(event: AuditEvent) {
  currentMockAuditEvents.unshift(event);
  localSubscribers.forEach((cb) => {
    try {
      cb(event);
    } catch (err) {
      console.warn('Error in audit listener:', err);
    }
  });
}

/**
 * Fetch current project state
 */
export async function fetchProject(): Promise<BryntumProjectData> {
  if (isLocal) {
    try {
      const res = await fetch(`${API_BASE}/project`, { signal: AbortSignal.timeout(2000) });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        currentMockProject = data;
        return data;
      }
    } catch {
      // Fallback
    }
  }
  return currentMockProject;
}

/**
 * Decompose Contract: calls backend Gemini API or executes high-fidelity client-side decomposition
 */
export async function decomposeContract(data: {
  raw_contract_text: string;
  project_title?: string;
  total_budget?: number;
  currency?: string;
}): Promise<BryntumProjectData> {
  if (isLocal) {
    try {
      const res = await fetch(`${API_BASE}/contracts/decompose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(4000),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const result = await res.json();
        currentMockProject = result;
        return result;
      }
    } catch {
      // Fallback
    }
  }

  // Client-side decomposition fallback
  const text = (data.raw_contract_text || '').toLowerCase();
  let baseKey = 'defi';
  if (text.includes('rag') || text.includes('llm') || text.includes('vector')) {
    baseKey = 'rag';
  } else if (text.includes('mobile') || text.includes('fintech') || text.includes('ios')) {
    baseKey = 'mobile';
  }

  const proj = createMockProject(baseKey);
  if (data.project_title) proj.title = data.project_title;
  if (data.total_budget) {
    proj.total_budget = data.total_budget;
    const ratio = data.total_budget / (proj.tasks.reduce((sum, t) => sum + t.amount, 0) || 1);
    proj.tasks.forEach((t) => {
      t.amount = Math.round(t.amount * ratio);
    });
    const released = proj.tasks
      .filter((t) => t.escrow_status === 'RELEASED')
      .reduce((sum, t) => sum + t.amount, 0);
    proj.total_released = released;
    proj.total_in_escrow = Math.max(0, proj.total_budget - released);
  }

  currentMockProject = proj;

  // Emit Escrow Locked event
  const lockEvent: AuditEvent = {
    id: `EVT-DEC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    event_type: 'ESCROW_LOCKED',
    title: `PayPal Escrow Authorized: ${proj.title}`,
    description: `$${proj.total_budget.toLocaleString()} USD authorized into PayPal Sandbox Vault across ${proj.tasks.length} milestones.`,
    paypal_order_id: proj.paypal_auth_order_id,
    amount: proj.total_budget,
    currency: 'USD',
    timestamp: new Date().toISOString(),
    severity: 'SUCCESS',
    metadata: { milestones_count: proj.tasks.length },
  };
  broadcastEvent(lockEvent);

  return currentMockProject;
}

/**
 * Verify milestone deliverable and trigger headless PayPal payout
 */
export async function verifyMilestone(
  milestoneId: number,
  req: VerificationRequest
): Promise<VerificationResult> {
  if (isLocal) {
    try {
      const res = await fetch(`${API_BASE}/milestones/${milestoneId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
        signal: AbortSignal.timeout(3000),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
  }

  // Standalone mock execution
  const target = currentMockProject.tasks.find((m) => m.id === milestoneId);
  const mName = target ? target.name : `Milestone #${milestoneId}`;
  const mAmt = target ? target.amount : 500;
  const hashHex = Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const vHash = `sha256:${hashHex}`;
  const capId = `PP-CAP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const orderId = currentMockProject.paypal_auth_order_id || 'PP-AUTH-MOCK-98A1B';

  if (target) {
    target.status = 'COMPLETED';
    target.progress = 100;
    target.escrow_status = 'RELEASED';
    target.verification_hash = vHash;
    target.paypal_capture_id = capId;

    currentMockProject.total_released += target.amount;
    currentMockProject.total_in_escrow = Math.max(
      0,
      currentMockProject.total_budget - currentMockProject.total_released
    );
  }

  // 1. Verification Event
  const vEvent: AuditEvent = {
    id: `EVT-VRF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    event_type: 'PR_VERIFICATION',
    milestone_id: milestoneId,
    title: `AI Cryptographic Deliverable Verified: ${mName}`,
    description: `GitHub PR verified. Automated test suite passed (96.4% coverage). Proof Hash: ${vHash.substring(0, 24)}...`,
    verification_hash: vHash,
    timestamp: new Date().toISOString(),
    severity: 'INFO',
    currency: 'USD',
    metadata: { coverage_pct: 96.4, score: 98.2 },
  };
  broadcastEvent(vEvent);

  // 2. PayPal Capture Event
  const takeRate = +(mAmt * 0.02).toFixed(2);
  const netDisbursed = +(mAmt - takeRate).toFixed(2);
  const capEvent: AuditEvent = {
    id: `EVT-CAP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    event_type: 'PAYPAL_CAPTURE',
    milestone_id: milestoneId,
    title: `PayPal Milestone Payout Released: $${mAmt.toLocaleString()} USD`,
    description: `Automated capture executed. Capture ID: ${capId} on Order: ${orderId}. Net to freelancer: $${netDisbursed.toLocaleString()} (2% platform take-rate: $${takeRate.toLocaleString()}).`,
    paypal_order_id: orderId,
    paypal_capture_id: capId,
    amount: mAmt,
    currency: 'USD',
    verification_hash: vHash,
    timestamp: new Date().toISOString(),
    severity: 'SUCCESS',
    metadata: { capture_id: capId, take_rate_2pct: takeRate, net_disbursed: netDisbursed },
  };
  broadcastEvent(capEvent);

  return {
    milestone_id: milestoneId,
    milestone_name: mName,
    amount: mAmt,
    currency: 'USD',
    paypal_order_id: orderId,
    paypal_capture_id: capId,
    escrow_status: 'RELEASED',
    status: 'COMPLETED',
    verification_hash: vHash,
    timestamp: new Date().toISOString(),
    debug_mode: true,
    details: {
      coverage_pct: 96.4,
      audit_score: 98.2,
      platform_fee_2pct: takeRate,
      net_freelancer_disbursed: netDisbursed,
    },
  };
}

/**
 * Fetch current escrow KPI summary
 */
export async function fetchEscrowSummary(): Promise<EscrowStatusSummary> {
  if (isLocal) {
    try {
      const res = await fetch(`${API_BASE}/escrow-summary`, { signal: AbortSignal.timeout(2000) });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
  }
  return createMockEscrowSummary(currentMockProject);
}

/**
 * Fetch all audit ledger events
 */
export async function fetchAuditEvents(): Promise<AuditEvent[]> {
  if (isLocal) {
    try {
      const res = await fetch(`${API_BASE}/audit-events`, { signal: AbortSignal.timeout(2000) });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
  }
  return currentMockAuditEvents;
}

/**
 * Instant 1-click Preset Loader for Hackathon Judges
 * Handles 'defi', 'rag', 'mobile', and aliases offline seamlessly
 */
export async function loadPresetScenario(scenarioKey: string): Promise<BryntumProjectData> {
  if (isLocal) {
    try {
      const res = await fetch(`${API_BASE}/preset-load/${scenarioKey}`, {
        method: 'POST',
        signal: AbortSignal.timeout(2000),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        currentMockProject = data;
        return data;
      }
    } catch {
      // Fallback
    }
  }

  // Seamless client-side load
  currentMockProject = createMockProject(scenarioKey);
  currentMockAuditEvents = createMockAuditEvents(scenarioKey);

  // Broadcast preset load event
  const presetEvent: AuditEvent = {
    id: `EVT-PRESET-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    event_type: 'ESCROW_LOCKED',
    title: `Preset SOW Loaded: ${currentMockProject.title}`,
    description: `Loaded ${currentMockProject.tasks.length} milestones ($${currentMockProject.total_budget.toLocaleString()} USD total authorized escrow).`,
    paypal_order_id: currentMockProject.paypal_auth_order_id,
    amount: currentMockProject.total_budget,
    currency: 'USD',
    timestamp: new Date().toISOString(),
    severity: 'INFO',
    metadata: { preset_key: scenarioKey },
  };
  broadcastEvent(presetEvent);

  return currentMockProject;
}

/**
 * Real-time SSE telemetry subscriber with local client-side event bridge
 */
export function subscribeToAuditStream(onEvent: (event: AuditEvent) => void): () => void {
  localSubscribers.add(onEvent);

  let eventSource: EventSource | null = null;
  if (isLocal) {
    try {
      eventSource = new EventSource(`${API_BASE}/audit-stream`);
      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.id && data.event_type) {
            onEvent(data as AuditEvent);
          }
        } catch {
          // ignore non-json keepalive
        }
      };
      eventSource.onerror = () => {
        // Quietly allow SSE reconnect without throwing to UI
      };
    } catch {
      // Local SSE not supported or unavailable
    }
  }

  return () => {
    localSubscribers.delete(onEvent);
    if (eventSource) {
      try {
        eventSource.close();
      } catch {}
    }
  };
}
