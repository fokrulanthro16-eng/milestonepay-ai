export interface BryntumDependency {
  id: string;
  from: number;
  to: number;
  type: number; // 2 = End-to-Start
  lag?: number;
}

export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'VERIFYING' | 'COMPLETED' | 'DISPUTED';
export type EscrowStatus = 'HELD_IN_ESCROW' | 'RELEASED' | 'PENDING_AUTH' | 'REFUNDED';

export interface Milestone {
  id: number;
  name: string;
  startDate: string;
  endDate?: string;
  duration: number; // days
  progress: number; // 0 - 100
  amount: number;
  currency: string;
  status: MilestoneStatus;
  escrow_status: EscrowStatus;
  paypal_order_id?: string;
  paypal_capture_id?: string;
  verification_hash?: string;
  github_pr_url?: string;
  deliverable_description?: string;
  acceptance_criteria: string[];
  predecessors: number[];
  assigned_resource?: string;
  critical_path: boolean;
}

export interface BryntumProjectData {
  project_id: string;
  title: string;
  currency: string;
  total_budget: number;
  total_released: number;
  total_in_escrow: number;
  paypal_auth_order_id?: string;
  tasks: Milestone[];
  dependencies: BryntumDependency[];
  created_at: string;
  sla_hours: number;
  dispute_grace_period_days: number;
}

export interface EscrowStatusSummary {
  project_id: string;
  title: string;
  total_budget: number;
  total_in_escrow: number;
  total_released: number;
  milestones_count: number;
  completed_milestones: number;
  pending_milestones: number;
  paypal_auth_order_id?: string;
  paypal_status: string;
  is_live_sandbox: boolean;
  platform_take_rate_pct?: number;
  total_platform_revenue?: number;
  net_freelancer_disbursed?: number;
}

export interface AuditEvent {
  id: string;
  event_type: 'DECOMPOSE' | 'ESCROW_LOCKED' | 'PR_VERIFICATION' | 'PAYPAL_CAPTURE' | 'DISPUTE_ALERT';
  milestone_id?: number;
  title: string;
  description: string;
  paypal_order_id?: string;
  paypal_capture_id?: string;
  amount?: number;
  currency: string;
  verification_hash?: string;
  timestamp: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  metadata: Record<string, any>;
}

export interface VerificationRequest {
  github_pr_url?: string;
  commit_sha?: string;
  test_suite_passed?: boolean;
  ai_audit_score?: number;
  notes?: string;
}

export interface VerificationResult {
  milestone_id: number;
  milestone_name: string;
  amount: number;
  currency: string;
  paypal_order_id: string;
  paypal_capture_id: string;
  escrow_status: string;
  status: string;
  verification_hash: string;
  timestamp: string;
  debug_mode: boolean;
  details: Record<string, any>;
}
