import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchProject, 
  fetchEscrowSummary, 
  fetchAuditEvents, 
  loadPresetScenario, 
  decomposeContract, 
  verifyMilestone, 
  subscribeToAuditStream 
} from './services/api';
import { BryntumProjectData, EscrowStatusSummary, AuditEvent, Milestone, VerificationResult } from './types';
import { Navbar } from './components/Navbar';
import { EscrowSummary } from './components/EscrowSummary';
import { GanttTimeline } from './components/GanttTimeline';
import { AuditLedger } from './components/AuditLedger';
import { ContractUploader } from './components/ContractUploader';
import { VerificationModal } from './components/VerificationModal';
import { BryntumModal } from './components/BryntumModal';
import { HelpModal } from './components/HelpModal';

export const App: React.FC = () => {
  const [project, setProject] = useState<BryntumProjectData | null>(null);
  const [summary, setSummary] = useState<EscrowStatusSummary | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoadingPreset, setIsLoadingPreset] = useState<boolean>(false);
  const [isQuickReleasing, setIsQuickReleasing] = useState<boolean>(false);
  const [isDecomposing, setIsDecomposing] = useState<boolean>(false);

  // Modals state
  const [isUploaderOpen, setIsUploaderOpen] = useState<boolean>(false);
  const [isBryntumModalOpen, setIsBryntumModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [verifyingMilestone, setVerifyingMilestone] = useState<Milestone | null>(null);

  // Initial load
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [projData, summaryData, eventsData] = await Promise.all([
        fetchProject(),
        fetchEscrowSummary(),
        fetchAuditEvents(),
      ]);
      setProject(projData);
      setSummary(summaryData);
      setAuditEvents(eventsData);
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to SSE audit stream
    const unsubscribe = subscribeToAuditStream((newEvent) => {
      setAuditEvents((prev) => [newEvent, ...prev]);
      // refresh project and summary on new events
      fetchProject().then(setProject).catch(() => {});
      fetchEscrowSummary().then(setSummary).catch(() => {});
    });

    return () => {
      unsubscribe();
    };
  }, [loadData]);

  // Handle Preset Load
  const handleLoadPreset = async (key: string) => {
    try {
      setIsLoadingPreset(true);
      const newProj = await loadPresetScenario(key);
      setProject(newProj);
      const newSummary = await fetchEscrowSummary();
      setSummary(newSummary);
      const newEvents = await fetchAuditEvents();
      setAuditEvents(newEvents);
    } catch (err: any) {
      console.warn('Preset load fallback handled:', err);
    } finally {
      setIsLoadingPreset(false);
    }
  };

  // Handle Decompose Contract
  const handleDecomposeContract = async (data: any) => {
    try {
      setIsDecomposing(true);
      const newProj = await decomposeContract(data);
      setProject(newProj);
      const newSummary = await fetchEscrowSummary();
      setSummary(newSummary);
      const newEvents = await fetchAuditEvents();
      setAuditEvents(newEvents);
    } catch (err: any) {
      console.warn('Decomposition error handled:', err);
    } finally {
      setIsDecomposing(false);
    }
  };

  // Handle Verification Execution
  const handleExecuteVerification = async (
    milestoneId: number,
    reqData: any
  ): Promise<VerificationResult> => {
    const result = await verifyMilestone(milestoneId, reqData);
    // Refresh project and summary
    const [updatedProj, updatedSummary, updatedEvents] = await Promise.all([
      fetchProject(),
      fetchEscrowSummary(),
      fetchAuditEvents(),
    ]);
    setProject(updatedProj);
    setSummary(updatedSummary);
    setAuditEvents(updatedEvents);
    return result;
  };

  // Quick Release Next Milestone
  const handleQuickReleaseNext = async () => {
    if (!project) return;
    const next = project.tasks.find((m) => m.escrow_status !== 'RELEASED');
    if (!next) {
      alert('All contract milestones have already been released!');
      return;
    }
    setVerifyingMilestone(next);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        project={project}
        onOpenSowModal={() => setIsUploaderOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onOpenBryntumJson={() => setIsBryntumModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Escrow Summary & Preset Bar */}
        <EscrowSummary
          summary={summary}
          project={project}
          onLoadPreset={handleLoadPreset}
          onQuickReleaseNext={handleQuickReleaseNext}
          isQuickReleasing={isQuickReleasing}
          isLoadingPreset={isLoadingPreset}
        />

        {/* Central Bryntum Gantt Timeline */}
        <GanttTimeline
          project={project}
          onVerifyMilestone={(m) => setVerifyingMilestone(m)}
        />

        {/* Real-time Cryptographic Audit Ledger */}
        <AuditLedger events={auditEvents} isLive={true} />
      </main>

      {/* Modals */}
      <ContractUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onDecompose={handleDecomposeContract}
        isSubmitting={isDecomposing}
      />

      <VerificationModal
        milestone={verifyingMilestone}
        isOpen={Boolean(verifyingMilestone)}
        onClose={() => setVerifyingMilestone(null)}
        onExecuteVerification={handleExecuteVerification}
      />

      <BryntumModal
        isOpen={isBryntumModalOpen}
        onClose={() => setIsBryntumModalOpen(false)}
        project={project}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Built for <strong>PayPal AI Hackathon 2026</strong> • Bryntum Track & PayPal+AI Track
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>PayPal Orders v2</span>
            <span>•</span>
            <span>Gemini 2.5 Flash</span>
            <span>•</span>
            <span>Bryntum Gantt Model</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
