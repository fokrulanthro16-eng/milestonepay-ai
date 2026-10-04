import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Sliders, 
  ZoomIn, 
  ZoomOut, 
  Link2, 
  AlertCircle, 
  FileCode, 
  Layers, 
  ArrowRight,
  ExternalLink,
  Lock
} from 'lucide-react';
import { BryntumProjectData, Milestone } from '../types';

interface GanttTimelineProps {
  project: BryntumProjectData | null;
  onVerifyMilestone: (milestone: Milestone) => void;
}

export const GanttTimeline: React.FC<GanttTimelineProps> = ({
  project,
  onVerifyMilestone,
}) => {
  const [zoomLevel, setZoomLevel] = useState<'day' | 'week'>('day');
  const [highlightCritical, setHighlightCritical] = useState<boolean>(true);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Compute timeline boundaries
  const { minDate, totalDays, datesList } = useMemo(() => {
    if (!project || project.tasks.length === 0) {
      const now = new Date();
      return { minDate: now, totalDays: 30, datesList: [] };
    }

    const startTimestamps = project.tasks.map((t) => new Date(t.startDate).getTime());
    const minTimestamp = Math.min(...startTimestamps);
    const minD = new Date(minTimestamp);

    // Find latest end date
    const endTimestamps = project.tasks.map((t) => {
      const s = new Date(t.startDate).getTime();
      return s + (t.duration || 1) * 86400000;
    });
    const maxTimestamp = Math.max(...endTimestamps);
    const maxD = new Date(maxTimestamp + 86400000 * 3); // add 3 day buffer

    const diffDays = Math.max(14, Math.ceil((maxD.getTime() - minD.getTime()) / 86400000));

    const list: Date[] = [];
    for (let i = 0; i < diffDays; i++) {
      const d = new Date(minD.getTime() + i * 86400000);
      list.push(d);
    }

    return { minDate: minD, totalDays: diffDays, datesList: list };
  }, [project]);

  const columnWidth = zoomLevel === 'day' ? 36 : 22; // px per day
  const rowHeight = 56; // px per task row

  // Calculate task bar positions
  const getTaskGeometry = (milestone: Milestone) => {
    const taskStart = new Date(milestone.startDate).getTime();
    const dayOffset = Math.max(0, (taskStart - minDate.getTime()) / 86400000);
    const left = dayOffset * columnWidth;
    const width = Math.max(columnWidth * 0.9, (milestone.duration || 1) * columnWidth);
    return { left, width };
  };

  // Build SVG dependency paths
  const dependencyLines = useMemo(() => {
    if (!project) return [];
    const lines: Array<{ id: string; d: string; isCritical: boolean }> = [];

    const taskMap = new Map<number, { index: number; left: number; width: number }>();
    project.tasks.forEach((t, idx) => {
      const geom = getTaskGeometry(t);
      taskMap.set(t.id, { index: idx, left: geom.left, width: geom.width });
    });

    project.dependencies.forEach((dep) => {
      const fromGeom = taskMap.get(dep.from);
      const toGeom = taskMap.get(dep.to);
      if (!fromGeom || !toGeom) return;

      const fromX = fromGeom.left + fromGeom.width;
      const fromY = fromGeom.index * rowHeight + rowHeight / 2;
      const toX = toGeom.left;
      const toY = toGeom.index * rowHeight + rowHeight / 2;

      const midX = fromX + Math.max(12, (toX - fromX) / 2);
      // Smooth cubic bezier or stepped orthogonal line
      const pathD = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX - 4} ${toY}`;

      const fromTask = project.tasks.find((t) => t.id === dep.from);
      const toTask = project.tasks.find((t) => t.id === dep.to);
      const isCritical = Boolean(fromTask?.critical_path && toTask?.critical_path);

      lines.push({ id: dep.id, d: pathD, isCritical });
    });

    return lines;
  }, [project, minDate, columnWidth]);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl flex flex-col">
      {/* Top Gantt Toolbar */}
      <div className="p-4 bg-slate-900/90 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Bryntum Interactive Gantt Engine
            </h2>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
            {project?.title || 'Contract Deliverables'}
          </span>
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-2 text-xs">
          {/* Critical Path Toggle */}
          <button
            onClick={() => setHighlightCritical(!highlightCritical)}
            className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center space-x-1.5 ${
              highlightCritical
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300 shadow-sm'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${highlightCritical ? 'bg-rose-400' : 'bg-slate-500'}`}></span>
            <span>Critical Path</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800/80 rounded-lg border border-slate-700 p-0.5">
            <button
              onClick={() => setZoomLevel('day')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                zoomLevel === 'day' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
              title="Day View"
            >
              Day
            </button>
            <button
              onClick={() => setZoomLevel('week')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                zoomLevel === 'week' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
              title="Week View"
            >
              Compact
            </button>
          </div>
        </div>
      </div>

      {/* Main Split View: Left Tree Table + Right Gantt Timeline Canvas */}
      <div className="grid grid-cols-1 xl:grid-cols-12 overflow-x-auto divide-y xl:divide-y-0 xl:divide-x divide-slate-800">
        {/* Left Tree Table (5 cols on xl) */}
        <div className="xl:col-span-5 bg-slate-950/60 flex flex-col overflow-x-auto min-w-[520px]">
          {/* Table Header */}
          <div className="h-14 px-3 bg-slate-900/80 border-b border-slate-800 flex items-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <div className="w-16 min-w-[4rem] text-center flex-shrink-0">ID</div>
            <div className="flex-1 min-w-[180px] pl-2">Milestone Deliverable</div>
            <div className="w-20 min-w-[5rem] text-right pr-2 flex-shrink-0">Escrow</div>
            <div className="w-24 min-w-[6rem] text-center flex-shrink-0">Status</div>
            <div className="w-36 min-w-[9rem] text-center pl-2 flex-shrink-0">Action</div>
          </div>

          {/* Table Task Rows */}
          <div className="divide-y divide-slate-800/60">
            {project?.tasks.map((task) => {
              const isReleased = task.escrow_status === 'RELEASED';
              const isInProgress = task.status === 'IN_PROGRESS';

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedMilestone(task)}
                  className={`h-14 px-3 flex items-center text-xs transition-colors cursor-pointer group ${
                    selectedMilestone?.id === task.id
                      ? 'bg-cyan-950/30 border-l-2 border-cyan-400'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  {/* Task ID & Predecessor chip */}
                  <div className="w-16 min-w-[4rem] text-center font-mono text-slate-400 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="font-bold text-white text-xs">#{task.id}</span>
                    {task.predecessors.length > 0 ? (
                      <span className="text-[9px] text-cyan-300 font-mono bg-cyan-950/80 px-1 rounded border border-cyan-500/30 mt-0.5">
                        ←{task.predecessors.join(',')}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5">root</span>
                    )}
                  </div>

                  {/* Task Name & Metadata */}
                  <div className="flex-1 min-w-[180px] pl-2 overflow-hidden pr-2">
                    <div className="font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors" title={task.name}>
                      {task.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-slate-300">{task.duration}d</span>
                      <span>•</span>
                      <span className="truncate max-w-[140px] text-slate-400">{task.assigned_resource}</span>
                    </div>
                  </div>

                  {/* Escrow Value */}
                  <div className="w-20 min-w-[5rem] text-right pr-2 font-mono font-bold flex-shrink-0">
                    <span className={isReleased ? 'text-emerald-400' : 'text-slate-200'}>
                      ${task.amount.toFixed(0)}
                    </span>
                    <div className="text-[9px] text-slate-400">{task.currency}</div>
                  </div>

                  {/* Escrow Status Tag */}
                  <div className="w-24 min-w-[6rem] text-center flex-shrink-0">
                    {isReleased ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                        RELEASED
                      </span>
                    ) : isInProgress ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                        <Clock className="w-2.5 h-2.5 mr-1 animate-spin" />
                        IN AUDIT
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                        <Lock className="w-2.5 h-2.5 mr-1" />
                        IN ESCROW
                      </span>
                    )}
                  </div>

                  {/* Action Button: Verify & Release or Full PayPal Capture Badge */}
                  <div className="w-36 min-w-[9rem] text-center pl-2 flex items-center justify-center flex-shrink-0">
                    {isReleased ? (
                      <div className="w-full flex flex-col items-center">
                        <span
                          className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 truncate max-w-[136px] shadow-sm"
                          title={`PayPal Capture ID: ${task.paypal_capture_id}`}
                        >
                          {task.paypal_capture_id || 'CAPTURED'}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onVerifyMilestone(task);
                        }}
                        className="w-full py-1.5 px-2 rounded-md font-semibold text-[11px] bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-400/40 hover:border-cyan-300 transition-all shadow-sm flex items-center justify-center space-x-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Verify & Pay</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Visual Gantt Chart (7 cols on xl) */}
        <div className="xl:col-span-7 bg-slate-950/90 overflow-x-auto relative min-h-[300px]">
          {/* Header Timescale (Dates) */}
          <div
            className="h-14 bg-slate-900/90 border-b border-slate-800 flex sticky top-0 z-10"
            style={{ width: `${totalDays * columnWidth}px` }}
          >
            {datesList.map((date, idx) => {
              const dayNum = date.getDate();
              const isFirstOfMonth = dayNum === 1 || idx === 0;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <div
                  key={idx}
                  className={`border-r border-slate-800/80 flex flex-col justify-center items-center select-none text-[10px] ${
                    isWeekend ? 'bg-slate-950/40 text-slate-400' : 'text-slate-400'
                  }`}
                  style={{ width: `${columnWidth}px` }}
                >
                  <span className="font-mono font-medium text-slate-300">{dayNum}</span>
                  <span className="text-[8px] text-slate-400">
                    {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Timeline Grid Body with SVG Dependency Arrows and Bars */}
          <div
            className="relative"
            style={{
              width: `${totalDays * columnWidth}px`,
              height: `${(project?.tasks.length || 0) * rowHeight}px`,
            }}
          >
            {/* Background Column Grid Lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {datesList.map((date, idx) => {
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                return (
                  <div
                    key={idx}
                    className={`h-full border-r border-slate-900/70 ${
                      isWeekend ? 'bg-slate-950/20' : ''
                    }`}
                    style={{ width: `${columnWidth}px` }}
                  />
                );
              })}
            </div>

            {/* SVG Dependency Arrows Layer */}
            <svg
              className="absolute inset-0 pointer-events-none z-10"
              style={{ width: '100%', height: '100%' }}
            >
              <defs>
                <marker
                  id="dep-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#00E5FF" opacity="0.8" />
                </marker>
                <marker
                  id="dep-arrow-critical"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#F43F5E" opacity="0.9" />
                </marker>
              </defs>

              {dependencyLines.map((line) => (
                <path
                  key={line.id}
                  d={line.d}
                  fill="none"
                  stroke={highlightCritical && line.isCritical ? '#F43F5E' : '#00E5FF'}
                  strokeWidth={highlightCritical && line.isCritical ? '2' : '1.5'}
                  strokeDasharray={line.isCritical ? 'none' : '3,3'}
                  markerEnd={highlightCritical && line.isCritical ? 'url(#dep-arrow-critical)' : 'url(#dep-arrow)'}
                  opacity={highlightCritical && !line.isCritical ? 0.3 : 0.8}
                />
              ))}
            </svg>

            {/* Task Horizontal Bars */}
            {project?.tasks.map((task, idx) => {
              const geom = getTaskGeometry(task);
              const top = idx * rowHeight + 10;
              const isReleased = task.escrow_status === 'RELEASED';
              const isCritical = task.critical_path && highlightCritical;

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedMilestone(task)}
                  className="absolute z-20 group cursor-pointer transition-all"
                  style={{
                    left: `${geom.left}px`,
                    top: `${top}px`,
                    width: `${geom.width}px`,
                    height: '36px',
                  }}
                >
                  {/* Task Bar Outer Container */}
                  <div
                    className={`h-full rounded-lg border relative overflow-hidden shadow-lg transition-transform group-hover:scale-[1.01] ${
                      isReleased
                        ? 'bg-emerald-950/80 border-emerald-500/60 shadow-glow-emerald/30'
                        : isCritical
                        ? 'bg-slate-900 border-rose-500/70 shadow-sm'
                        : 'bg-slate-900 border-cyan-500/50 shadow-glow-teal/20'
                    }`}
                  >
                    {/* Progress Fill Bar */}
                    <div
                      className={`h-full absolute left-0 top-0 transition-all duration-700 ${
                        isReleased
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-500 opacity-80'
                          : 'bg-gradient-to-r from-cyan-600 to-blue-500 opacity-60'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />

                    {/* Task Bar Content Label */}
                    <div className="absolute inset-0 px-2 flex items-center justify-between text-[11px] font-semibold text-white truncate pointer-events-none z-10">
                      <span className="truncate drop-shadow-md">
                        #{task.id} {task.name}
                      </span>
                      <span className="font-mono text-[10px] ml-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-cyan-300 border border-slate-700">
                        ${task.amount.toFixed(0)}
                      </span>
                    </div>

                    {/* Milestone Pin Diamond at End */}
                    <div
                      className={`absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 border ${
                        isReleased
                          ? 'bg-emerald-400 border-white'
                          : 'bg-cyan-400 border-slate-900'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Milestone Detail Drawer / Inspector */}
      {selectedMilestone && (
        <div className="p-4 bg-slate-900/95 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-white text-sm">
                  #{selectedMilestone.id}: {selectedMilestone.name}
                </h4>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-cyan-300">
                  ${selectedMilestone.amount.toFixed(2)} {selectedMilestone.currency}
                </span>
                {selectedMilestone.critical_path && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-500/30 font-semibold">
                    Critical Path
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                {selectedMilestone.deliverable_description}
              </p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                <span>Start: <strong className="text-slate-300">{selectedMilestone.startDate}</strong></span>
                <span>Duration: <strong className="text-slate-300">{selectedMilestone.duration} days</strong></span>
                <span>Predecessors: <strong className="text-cyan-400">{selectedMilestone.predecessors.join(', ') || 'None (Root)'}</strong></span>
                {selectedMilestone.verification_hash && (
                  <span className="font-mono text-emerald-400">
                    Hash: {selectedMilestone.verification_hash.substring(0, 18)}...
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedMilestone(null)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              Dismiss
            </button>
            {selectedMilestone.escrow_status !== 'RELEASED' && (
              <button
                onClick={() => onVerifyMilestone(selectedMilestone)}
                className="px-4 py-2 rounded-lg font-semibold text-xs bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 shadow-glow-teal flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify PR & Release PayPal Escrow</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
