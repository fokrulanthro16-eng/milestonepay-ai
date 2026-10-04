import React from 'react';
import { Shield, CheckCircle, Clock, Lock, Sparkles, ExternalLink, ArrowRight, RefreshCw } from 'lucide-react';
import { EscrowStatusSummary, BryntumProjectData } from '../types';

interface EscrowSummaryProps {
  summary: EscrowStatusSummary | null;
  project: BryntumProjectData | null;
  onLoadPreset: (key: string) => void;
  onQuickReleaseNext: () => void;
  isQuickReleasing: boolean;
  isLoadingPreset: boolean;
}

export const EscrowSummary: React.FC<EscrowSummaryProps> = ({
  summary,
  project,
  onLoadPreset,
  onQuickReleaseNext,
  isQuickReleasing,
  isLoadingPreset,
}) => {
  const totalBudget = summary?.total_budget || project?.total_budget || 0;
  const inEscrow = summary?.total_in_escrow ?? project?.total_in_escrow ?? 0;
  const released = summary?.total_released ?? project?.total_released ?? 0;
  const releasePct = totalBudget > 0 ? Math.round((released / totalBudget) * 100) : 0;
  const orderId = summary?.paypal_auth_order_id || project?.paypal_auth_order_id || 'PP-AUTH-PENDING';

  // Find next pending/in-progress milestone
  const nextMilestone = project?.tasks.find((m) => m.escrow_status !== 'RELEASED');

  return (
    <div className="space-y-4">
      {/* Preset Demo Scenarios Bar for Hackathon Judges */}
      <div className="p-3.5 rounded-xl glass-panel bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950 flex flex-wrap items-center justify-between gap-3 border border-cyan-500/20">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Judge Quick Demos:
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">1-Click load real-world freelance SOWs:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onLoadPreset('defi')}
            disabled={isLoadingPreset}
            className="px-2.5 py-1 text-xs rounded-lg font-mono bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 transition-all flex items-center space-x-1"
          >
            <span>Web3 DeFi ($2,800)</span>
          </button>

          <button
            onClick={() => onLoadPreset('rag')}
            disabled={isLoadingPreset}
            className="px-2.5 py-1 text-xs rounded-lg font-mono bg-purple-950/70 hover:bg-purple-900 text-purple-300 border border-purple-500/40 transition-all flex items-center space-x-1"
          >
            <span>LLM RAG ($1,500)</span>
          </button>

          <button
            onClick={() => onLoadPreset('mobile')}
            disabled={isLoadingPreset}
            className="px-2.5 py-1 text-xs rounded-lg font-mono bg-blue-950/70 hover:bg-blue-900 text-blue-300 border border-blue-500/40 transition-all flex items-center space-x-1"
          >
            <span>Fintech App ($4,000)</span>
          </button>

          {nextMilestone && (
            <button
              onClick={onQuickReleaseNext}
              disabled={isQuickReleasing}
              className="px-3 py-1 text-xs rounded-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-glow-emerald transition-all flex items-center space-x-1.5 ml-1 animate-pulse"
            >
              {isQuickReleasing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying & Paying...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verify & Pay Next Milestone (#{nextMilestone.id})</span>
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total SOW Escrow Value */}
        <div className="p-4 rounded-xl glass-panel relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Contract Escrow</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            ${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>{project?.tasks.length || 0} Milestones total</span>
            <span className="text-cyan-400 font-mono">PayPal Orders v2</span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Card 2: Locked in PayPal Escrow */}
        <div className="p-4 rounded-xl glass-panel relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Locked in PayPal Escrow</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 tracking-tight">
            ${inEscrow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono truncate max-w-[170px]" title={orderId}>
              {orderId}
            </span>
            <span className="text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-amber-500/30">
              AUTHORIZED
            </span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Card 3: Headless Released to Freelancer */}
        <div className="p-4 rounded-xl glass-panel relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Released to Freelancer</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            ${released.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mr-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${releasePct}%` }}
              ></div>
            </div>
            <span className="font-mono text-emerald-400 whitespace-nowrap">{releasePct}%</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Net: <strong className="text-emerald-300">${(summary?.net_freelancer_disbursed ?? Math.round(released * 0.98)).toLocaleString()}</strong></span>
            <span className="text-purple-400">2% Fee: ${(summary?.total_platform_revenue ?? Math.round(released * 0.02)).toLocaleString()}</span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Card 4: SLA & Dispute Grace Timer */}
        <div className="p-4 rounded-xl glass-panel relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active SLA Payout Window</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 tracking-tight">
            48h : 00m : 00s
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Auto-release if no client dispute</span>
            <span className="text-blue-400 font-mono">Anti-Ghosting SLA</span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};
