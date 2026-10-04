import React from 'react';
import { HelpCircle, X, Shield, Cpu, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl glass-panel-glow rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30 bg-slate-950 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900/90 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                How MilestonePay AI Works
              </h3>
              <p className="text-xs text-slate-400">
                Autonomous Gantt Escrow & Headless PayPal Payouts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-300 leading-relaxed">
          {/* Track Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
              <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs mb-1">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Track 1: Best Use of Bryntum ($1,000)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Judged by Mats Bryntse: Decomposes contracts into native Bryntum Gantt tasks with End-to-Start dependency trees, critical path resolution, and milestone completion flags.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30">
              <div className="flex items-center space-x-2 text-blue-300 font-bold text-xs mb-1">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Track 2: Best Use of PayPal + AI ($5,000)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Locks contract funds via PayPal Orders v2 (intent=AUTHORIZE). Upon AI PR acceptance verification, programmatically triggers headless escrow captures.
              </p>
            </div>
          </div>

          {/* Workflow Steps */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Autonomous Payout Lifecycle:</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-white block">Raw Contract SOW Ingestion & AI Decomposition</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Google Gemini 2.5 Flash extracts deliverable names, start dates, durations, and acceptance criteria into structured Bryntum Gantt JSON.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-white block">PayPal Orders v2 Escrow Authorization</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Client funds the contract with a single PayPal authorization order. Funds remain safe in PayPal escrow until each milestone is verified.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-white block">Cryptographic CI/CD & AI PR Verification</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    When the contractor submits a PR, the system runs automated test coverage checks, validates acceptance criteria, and generates a tamper-proof SHA-256 receipt.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                  4
                </span>
                <div>
                  <strong className="text-white block">Headless PayPal Escrow Capture</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Server executes headless capture on the specific milestone amount. Contractor receives instant funds without client ghosting or manual invoice disputes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-cyan-500/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
          >
            Got it, Let's Test
          </button>
        </div>
      </div>
    </div>
  );
};
