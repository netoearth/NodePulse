import React from 'react';
import { Play, Square, Activity, Globe, ShieldCheck, Zap, RefreshCw, FileText } from 'lucide-react';
import { DiagnosticMode } from '../types';

interface HeaderProps {
  currentMode: DiagnosticMode;
  onModeChange: (mode: DiagnosticMode) => void;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  isRunning,
  onStart,
  onStop,
  onOpenReport,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single brand wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-900/30">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              NodePulse
              <span className="text-xs font-normal text-cyan-400/90 font-mono tracking-normal">SpeedTrace</span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation / Diagnostic Mode Selector (Single-line, unboxed tabs) */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-neutral-900/80 border border-neutral-800/80 rounded-xl text-xs font-medium">
          <button
            onClick={() => onModeChange('full')}
            className={`px-3.5 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
              currentMode === 'full'
                ? 'bg-neutral-800 text-cyan-300 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>全面诊断</span>
          </button>
          <button
            onClick={() => onModeChange('quick-ping')}
            className={`px-3.5 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
              currentMode === 'quick-ping'
                ? 'bg-neutral-800 text-cyan-300 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>延迟与丢包</span>
          </button>
          <button
            onClick={() => onModeChange('routes')}
            className={`px-3.5 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
              currentMode === 'routes'
                ? 'bg-neutral-800 text-cyan-300 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>全球路由矩阵</span>
          </button>
          <button
            onClick={() => onModeChange('unlock')}
            className={`px-3.5 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
              currentMode === 'unlock'
                ? 'bg-neutral-800 text-cyan-300 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>流媒体与出口</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenReport}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800/80 transition-colors whitespace-nowrap"
            title="生成并导出诊断报告"
          >
            <FileText className="h-3.5 w-3.5 text-neutral-400" />
            <span>诊断报告</span>
          </button>

          {isRunning ? (
            <button
              onClick={onStop}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600/90 hover:bg-rose-500 rounded-lg shadow-sm hover:shadow-rose-950/40 transition-all whitespace-nowrap active:scale-[0.98]"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>停止测试</span>
            </button>
          ) : (
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm hover:shadow-cyan-900/30 transition-all whitespace-nowrap active:scale-[0.98]"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>开始全面测速</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
