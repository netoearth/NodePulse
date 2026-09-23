import React from 'react';
import {
  Play,
  Square,
  Activity,
  Globe,
  ShieldCheck,
  Zap,
  FileText,
  Smartphone,
  Monitor,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import { DiagnosticMode } from '../types';
import { OSPlatform } from '../hooks/usePWA';

interface HeaderProps {
  currentMode: DiagnosticMode;
  onModeChange: (mode: DiagnosticMode) => void;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onOpenReport: () => void;
  onOpenCrossPlatform: () => void;
  currentOS?: OSPlatform;
  canInstall?: boolean;
  isInstalled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  isRunning,
  onStart,
  onStop,
  onOpenReport,
  onOpenCrossPlatform,
  currentOS = 'unknown',
  canInstall = false,
  isInstalled = false,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const getOsIcon = () => {
    if (currentOS === 'android' || currentOS === 'ios') {
      return <Smartphone className="h-3.5 w-3.5 text-cyan-400" />;
    }
    return <Monitor className="h-3.5 w-3.5 text-cyan-400" />;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
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

        {/* Zone 2: Navigation / Diagnostic Mode Selector */}
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
        <div className="flex items-center gap-2">
          {/* Cross-Platform Release & Install Button */}
          <button
            onClick={onOpenCrossPlatform}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap active:scale-95 ${
              canInstall && !isInstalled
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60'
                : 'bg-neutral-900/90 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
            title="跨平台客户端发布与安装 (Android, Windows, Linux, macOS)"
          >
            {getOsIcon()}
            <span>跨平台客户端</span>
            {canInstall && !isInstalled ? (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            ) : (
              <span className="text-[10px] text-neutral-400 hidden sm:inline">多端</span>
            )}
          </button>

          {/* Diagnostic Report Button */}
          <button
            onClick={onOpenReport}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap"
            title="生成并导出诊断报告"
          >
            <FileText className="h-3.5 w-3.5 text-neutral-400" />
            <span>诊断报告</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="hidden lg:inline-flex items-center p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors"
            title={isFullscreen ? '退出全屏' : '全屏体验'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          {/* Run / Stop Button */}
          {isRunning ? (
            <button
              onClick={onStop}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600/90 hover:bg-rose-500 rounded-lg shadow-sm hover:shadow-rose-950/40 transition-all whitespace-nowrap active:scale-[0.98]"
            >
              <Square className="h-3 w-3 fill-current" />
              <span>停止</span>
            </button>
          ) : (
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm hover:shadow-cyan-900/30 transition-all whitespace-nowrap active:scale-[0.98]"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>全面测速</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
