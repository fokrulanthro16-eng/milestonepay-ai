import React, { useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  AlertTriangle, 
  ExternalLink, 
  Search, 
  Radio, 
  Hash,
  ArrowUpRight
} from 'lucide-react';
import { AuditEvent } from '../types';

interface AuditLedgerProps {
  events: AuditEvent[];
  isLive: boolean;
}

export const AuditLedger: React.FC<AuditLedgerProps> = ({ events, isLive }) => {
  const [filter, setFilter] = useState<'ALL' | 'PAYPAL' | 'VERIFICATION'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEvents = events.filter((evt) => {
    if (filter === 'PAYPAL' && evt.event_type !== 'PAYPAL_CAPTURE' && evt.event_type !== 'ESCROW_LOCKED') {
      return false;
    }
    if (filter === 'VERIFICATION' && evt.event_type !== 'PR_VERIFICATION') {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        evt.title.toLowerCase().includes(term) ||
        evt.description.toLowerCase().includes(term) ||
        (evt.verification_hash && evt.verification_hash.toLowerCase().includes(term)) ||
        (evt.paypal_capture_id && evt.paypal_capture_id.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="glass-panel rounded-2xl border border-cyan-500/20 shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 bg-slate-900/90 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Cryptographic Audit & Payout Ledger
            </h3>
          </div>
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>SSE Stream Active</span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center bg-slate-800/80 rounded-lg border border-slate-700 p-0.5">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                filter === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('PAYPAL')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                filter === 'PAYPAL' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
            >
              PayPal Captures
            </button>
            <button
              onClick={() => setFilter('VERIFICATION')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                filter === 'VERIFICATION' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
            >
              PR Verifications
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search hash or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-36 sm:w-48 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Ledger Stream Table */}
      <div className="divide-y divide-slate-800/60 max-h-[380px] overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No audit records match the current filter.
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isCapture = evt.event_type === 'PAYPAL_CAPTURE';
            const isLock = evt.event_type === 'ESCROW_LOCKED';
            const isPR = evt.event_type === 'PR_VERIFICATION';

            return (
              <div
                key={evt.id}
                className="p-3.5 hover:bg-slate-900/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start space-x-3">
                  {/* Event Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isCapture
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                        : isLock
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                        : 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {isCapture ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isLock ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-200">{evt.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{evt.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{evt.description}</p>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 font-mono text-[10px]">
                      {evt.paypal_capture_id && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/30">
                          Capture: {evt.paypal_capture_id}
                        </span>
                      )}
                      {evt.paypal_order_id && !evt.paypal_capture_id && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-600/30">
                          Order: {evt.paypal_order_id}
                        </span>
                      )}
                      {evt.verification_hash && (
                        <span
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 truncate max-w-[280px]"
                          title={evt.verification_hash}
                        >
                          Proof: {evt.verification_hash}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {evt.amount && (
                  <div className="text-right sm:flex-shrink-0 font-mono">
                    <span
                      className={`text-sm font-bold ${
                        isCapture ? 'text-emerald-400' : 'text-cyan-300'
                      }`}
                    >
                      ${evt.amount.toFixed(2)}
                    </span>
                    <div className="text-[10px] text-slate-500 uppercase">{evt.currency}</div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
