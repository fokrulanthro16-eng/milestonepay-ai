import React from 'react';
import { ShieldCheck, Cpu, Zap, Download, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';
import { BryntumProjectData } from '../types';

interface NavbarProps {
  project: BryntumProjectData | null;
  onOpenSowModal: () => void;
  onOpenHelpModal: () => void;
  onOpenBryntumJson: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  project,
  onOpenSowModal,
  onOpenHelpModal,
  onOpenBryntumJson,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/20 backdrop-blur-xl bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 p-[2px] shadow-glow-teal">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-white bg-clip-text text-transparent">
                MilestonePay
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-semibold">
                AI 2.5
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Autonomous Gantt Escrow & Headless PayPal Releases</p>
          </div>
        </div>

        {/* System Status Badges */}
        <div className="hidden lg:flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-600/30 text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono">PayPal Orders v2 Auth</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-purple-950/60 border border-purple-600/30 text-purple-300">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono">Gemini 2.5 Flash</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-600/30 text-cyan-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono">Bryntum Gantt Schema</span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenSowModal}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center space-x-1.5"
          >
            <span>+ Decompose SOW</span>
          </button>

          <button
            onClick={onOpenBryntumJson}
            title="Inspect Bryntum Project JSON Schema"
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Bryntum JSON</span>
          </button>

          <button
            onClick={onOpenHelpModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="How MilestonePay AI Works"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
