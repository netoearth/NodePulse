import React, { useState } from 'react';
import { Download, X, Smartphone, Monitor, Sparkles } from 'lucide-react';
import { OSPlatform } from '../hooks/usePWA';

interface InstallBannerProps {
  canInstall: boolean;
  isInstalled: boolean;
  currentOS: OSPlatform;
  onInstall: () => void;
  onOpenDetails: () => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({
  canInstall,
  isInstalled,
  currentOS,
  onInstall,
  onOpenDetails,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // If already installed or manually dismissed, don't show
  if (isInstalled || isDismissed) return null;

  const isMobile = currentOS === 'android' || currentOS === 'ios';

  return (
    <div className="w-full bg-gradient-to-r from-cyan-950/70 via-neutral-900/90 to-blue-950/70 border-b border-cyan-500/20 backdrop-blur-sm px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0">
            {isMobile ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          </div>
          <p className="text-neutral-300">
            <span className="font-semibold text-white">
              {currentOS === 'android'
                ? '📱 发现 Android 客户端'
                : currentOS === 'windows'
                ? '🪟 发现 Windows 客户端'
                : currentOS === 'macos'
                ? '🍏 发现 macOS 客户端'
                : currentOS === 'linux'
                ? '🐧 发现 Linux 客户端'
                : '🚀 全平台跨端支持'}
            </span>
            ：支持一键将 NodePulse 离线安装为原生桌面/手机 App，免去网址栏干扰。
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canInstall && (
            <button
              onClick={onInstall}
              className="inline-flex items-center gap-1.5 px-3 py-1 font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>立即安装</span>
            </button>
          )}

          <button
            onClick={onOpenDetails}
            className="px-2.5 py-1 font-medium text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-700/60"
          >
            全平台发布指南
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-neutral-400 hover:text-white rounded-md transition-colors"
            title="暂时关闭"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
