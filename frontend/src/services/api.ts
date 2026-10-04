import { BryntumProjectData, EscrowStatusSummary, AuditEvent, VerificationRequest, VerificationResult } from '../types';

const API_BASE = '/api';

export async function fetchProject(): Promise<BryntumProjectData> {
  const res = await fetch(`${API_BASE}/project`);
  if (!res.ok) throw new Error(`Failed to load project: ${res.statusText}`);
  return res.json();
}

export async function decomposeContract(data: {
  raw_contract_text: string;
  project_title?: string;
  total_budget?: number;
  currency?: string;
}): Promise<BryntumProjectData> {
  const res = await fetch(`${API_BASE}/contracts/decompose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Contract decomposition failed');
  }
  return res.json();
}

export async function verifyMilestone(
  milestoneId: number,
  req: VerificationRequest
): Promise<VerificationResult> {
  const res = await fetch(`${API_BASE}/milestones/${milestoneId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Verification & payout capture failed');
  }
  return res.json();
}

export async function fetchEscrowSummary(): Promise<EscrowStatusSummary> {
  const res = await fetch(`${API_BASE}/escrow-summary`);
  if (!res.ok) throw new Error('Failed to fetch escrow summary');
  return res.json();
}

export async function fetchAuditEvents(): Promise<AuditEvent[]> {
  const res = await fetch(`${API_BASE}/audit-events`);
  if (!res.ok) throw new Error('Failed to fetch audit events');
  return res.json();
}

export async function loadPresetScenario(scenarioKey: string): Promise<BryntumProjectData> {
  const res = await fetch(`${API_BASE}/preset-load/${scenarioKey}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to load preset ${scenarioKey}`);
  return res.json();
}

export function subscribeToAuditStream(onEvent: (event: AuditEvent) => void): () => void {
  const eventSource = new EventSource(`${API_BASE}/audit-stream`);

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

  eventSource.onerror = (err) => {
    console.warn('[SSE] Audit stream reconnecting...', err);
  };

  return () => {
    eventSource.close();
  };
}
