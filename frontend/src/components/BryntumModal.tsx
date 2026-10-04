import React, { useState } from 'react';
import { Layers, Copy, Check, Download, X, FileCode, CheckCircle2 } from 'lucide-react';
import { BryntumProjectData } from '../types';

interface BryntumModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: BryntumProjectData | null;
}

export const BryntumModal: React.FC<BryntumModalProps> = ({ isOpen, onClose, project }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'full' | 'tasks' | 'dependencies' | 'calendars'>('full');

  if (!isOpen || !project) return null;

  // Format Bryntum standard project JSON payloads
  const fullBryntumProject = {
    success: true,
    project: {
      calendar: 'general',
      startDate: project.tasks[0]?.startDate || '2026-10-05',
      name: project.title,
      totalBudget: project.total_budget,
      currency: project.currency,
      paypalOrderId: project.paypal_auth_order_id,
    },
    tasks: {
      rows: project.tasks.map((t) => ({
        id: t.id,
        name: t.name,
        startDate: t.startDate,
        endDate: t.endDate,
        duration: t.duration,
        durationUnit: 'd',
        percentDone: t.progress,
        cls: t.escrow_status === 'RELEASED' ? 'b-milestone-released' : 'b-milestone-locked',
        amount: t.amount,
        currency: t.currency,
        escrowStatus: t.escrow_status,
        paypalOrderId: t.paypal_order_id,
        paypalCaptureId: t.paypal_capture_id,
        verificationHash: t.verification_hash,
        critical: t.critical_path,
        assignedResource: t.assigned_resource,
        acceptanceCriteria: t.acceptance_criteria,
      })),
    },
    dependencies: {
      rows: project.dependencies.map((d) => ({
        id: d.id,
        from: d.from,
        to: d.to,
        type: d.type, // 2 = End-to-Start in Bryntum Gantt
        lag: d.lag || 0,
      })),
    },
    calendars: {
      rows: [
        {
          id: 'general',
          name: 'Standard Working Hours',
          intervals: [
            {
              isWorking: true,
              validFrom: '2026-01-01',
              validTo: '2026-12-31',
            },
          ],
        },
      ],
    },
  };

  const getActivePayload = () => {
    switch (activeTab) {
      case 'tasks':
        return fullBryntumProject.tasks;
      case 'dependencies':
        return fullBryntumProject.dependencies;
      case 'calendars':
        return fullBryntumProject.calendars;
      case 'full':
      default:
        return fullBryntumProject;
    }
  };

  const activeJsonString = JSON.stringify(getActivePayload(), null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(fullBryntumProject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bryntum-gantt-${project.project_id.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-4xl glass-panel-glow rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30 bg-slate-950 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900/90 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Bryntum Gantt Core Project Model
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono border border-cyan-500/40 font-semibold">
                  Schema Standard v5.x
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Judged by Mats Bryntse: Standard End-to-Start tasks, dependencies, calendars, and escrow properties.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls & Metadata Bar */}
        <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setActiveTab('full')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'full'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Project Model
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'tasks'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tasks ({project.tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('dependencies')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'dependencies'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dependencies ({project.dependencies.length})
            </button>
            <button
              onClick={() => setActiveTab('calendars')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'calendars'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Calendars
            </button>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <span className="text-slate-300">Type 2 (End-to-Start)</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">${project.total_budget.toLocaleString()} {project.currency}</span>
          </div>
        </div>

        {/* JSON Viewer with Syntax Highlighting */}
        <div className="p-4 bg-slate-950 font-mono text-xs overflow-y-auto flex-1 select-text">
          <div className="p-4 rounded-xl bg-black/90 border border-slate-800 text-slate-200 overflow-x-auto leading-relaxed shadow-inner">
            <pre className="text-cyan-300">{activeJsonString}</pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Ready for import into Bryntum Gantt Enterprise React Suite</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 flex items-center space-x-1.5 shadow-glow-teal transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download bryntum-project.json</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
