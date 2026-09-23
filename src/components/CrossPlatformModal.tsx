import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  Apple,
  Terminal,
  Download,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Layers,
  Cpu,
  PackageCheck,
  FolderArchive,
} from 'lucide-react';
import { OSPlatform } from '../hooks/usePWA';

interface CrossPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOS: OSPlatform;
  canInstall: boolean;
  isInstalled: boolean;
  onInstall: () => void;
}

export const CrossPlatformModal: React.FC<CrossPlatformModalProps> = ({
  isOpen,
  onClose,
  currentOS,
  canInstall,
  isInstalled,
  onInstall,
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'windows' | 'macos' | 'linux' | 'offline'>(
    currentOS === 'android'
      ? 'android'
      : currentOS === 'macos'
      ? 'macos'
      : currentOS === 'linux'
      ? 'linux'
      : 'windows'
  );

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getOsLabel = (os: OSPlatform) => {
    switch (os) {
      case 'android':
        return 'Android 安卓系统';
      case 'windows':
        return 'Windows 10 / 11 桌面系统';
      case 'macos':
        return 'macOS 苹果系统';
      case 'linux':
        return 'Linux 发行版系统';
      case 'ios':
        return 'iOS / iPadOS 苹果移动系统';
      default:
        return 'Web 浏览器环境';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  全平台客户端与发布部署中心
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full">
                  多端支持 (Android / Win / Mac / Linux)
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                支持以 PWA 原生流式桌面应用秒级安装，或通过 Tauri / Capacitor 一键编译发布原生安装包
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Device Detection Banner */}
        <div className="px-5 py-3 bg-neutral-900/70 border-b border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">当前设备识别：</span>
            <span className="font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              {getOsLabel(currentOS)}
            </span>
            {isInstalled && (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                已作为独立应用运行
              </span>
            )}
          </div>

          {canInstall && !isInstalled && (
            <button
              onClick={onInstall}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-95 rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>立即一键安装到本地 ({getOsLabel(currentOS).split(' ')[0]})</span>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-900/30 px-5 gap-2 overflow-x-auto scrollbar-none py-2">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'android'
                ? 'bg-neutral-800 text-cyan-300 border border-neutral-700/80'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Android (安卓 APK / WebAPK)</span>
          </button>

          <button
            onClick={() => setActiveTab('windows')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'windows'
                ? 'bg-neutral-800 text-cyan-300 border border-neutral-700/80'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Monitor className="h-4 w-4" />
            <span>Windows (10 / 11 .exe & PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('macos')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'macos'
                ? 'bg-neutral-800 text-cyan-300 border border-neutral-700/80'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Apple className="h-4 w-4" />
            <span>macOS (.dmg & 程序坞应用)</span>
          </button>

          <button
            onClick={() => setActiveTab('linux')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'linux'
                ? 'bg-neutral-800 text-cyan-300 border border-neutral-700/80'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>Linux (.AppImage / .deb)</span>
          </button>

          <button
            onClick={() => setActiveTab('offline')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'offline'
                ? 'bg-neutral-800 text-cyan-300 border border-neutral-700/80'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <FolderArchive className="h-4 w-4" />
            <span>离线单机包 / 软路由部署</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-neutral-300 text-xs leading-relaxed">
          {/* ANDROID TAB */}
          {activeTab === 'android' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">方案 1：Android WebAPK 原生流式安装 (极力推荐)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40">
                      无需任何编译环境
                    </span>
                  </div>
                </div>
                <p className="text-neutral-400">
                  使用 Chrome、Edge、三星浏览器或小米浏览器访问本网址，系统将自动触发 WebAPK 生成：
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 pl-1">
                  <li>点击浏览器右上角菜单（三个点 <span className="font-mono">⋮</span>）。</li>
                  <li>点击 <strong className="text-white">“安装应用”</strong> 或 <strong className="text-white">“添加到主屏幕”</strong>。</li>
                  <li>手机主屏幕将生成带有专属应用图标的独立 App，点击直接全屏启动，脱离浏览器顶栏。</li>
                </ol>
                {canInstall && (
                  <button
                    onClick={onInstall}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>立即在当前安卓设备上安装</span>
                  </button>
                )}
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">方案 2：Capacitor 构建独立 Android .APK 安装包</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/40">
                      生成独立 APK 安装包
                    </span>
                  </div>
                </div>
                <p className="text-neutral-400">
                  项目中已配置好了 <span className="font-mono text-cyan-300">capacitor.config.json</span>，只需在终端中运行以下三行指令即可由 Android Studio 编译生成 APK：
                </p>

                <div className="relative bg-neutral-950 p-3 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-200">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'npm run build\nnpx cap add android\nnpx cap sync android\nnpx cap open android',
                        'android-cmd'
                      )
                    }
                    className="absolute top-2.5 right-2.5 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] flex items-center gap-1"
                  >
                    {copiedCode === 'android-cmd' ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>复制代码</span>
                      </>
                    )}
                  </button>
                  <pre className="whitespace-pre overflow-x-auto py-1">
{`# 1. 编译生成生产构建静态资产
npm run build

# 2. 初始化并同步至 Android 原生工程
npx @capacitor/cli add android
npx @capacitor/cli sync android

# 3. 在 Android Studio 中打开直接编译生成 APK
npx @capacitor/cli open android`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* WINDOWS TAB */}
          {activeTab === 'windows' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">方案 1：Microsoft Edge / Chrome 独立桌面应用 (秒装)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40">
                      推荐方案 · 性能极高
                    </span>
                  </div>
                </div>
                <p className="text-neutral-400">
                  支持像原生软件一样常驻 Windows 任务栏，拥有独立的窗口进程与图标：
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 pl-1">
                  <li>在 Edge 浏览器地址栏右侧，点击出现的 <strong className="text-white">“应用可用。安装 NodePulse”</strong> 图标；</li>
                  <li>或点击右上角菜单 <span className="font-mono">⋯</span> → <strong className="text-white">应用</strong> → <strong className="text-white">将此站点作为应用安装</strong>。</li>
                  <li>勾选“固定到任务栏”与“创建桌面快捷方式”，即可获得原生 Windows App 体验。</li>
                </ol>
                {canInstall && (
                  <button
                    onClick={onInstall}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>立即安装到 Windows 桌面</span>
                  </button>
                )}
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">方案 2：Tauri 一键打包原生 Windows .EXE / .MSI 安装包</span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/40">
                      轻量 Rust 架构 · 体积仅 ~15MB
                    </span>
                  </div>
                </div>
                <p className="text-neutral-400">
                  相较于传统臃肿的 Electron（包体大于 180MB、占内存 250MB），本项目内置了 Tauri v1/v2 配置架构，内存占用仅 30MB 左右：
                </p>

                <div className="relative bg-neutral-950 p-3 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-200">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'npm install -g @tauri-apps/cli\nnpm run build\ncargo tauri build',
                        'win-cmd'
                      )
                    }
                    className="absolute top-2.5 right-2.5 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] flex items-center gap-1"
                  >
                    {copiedCode === 'win-cmd' ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>复制代码</span>
                      </>
                    )}
                  </button>
                  <pre className="whitespace-pre overflow-x-auto py-1">
{`# 编译打包 Windows 64位安装包 (.exe / .msi)
npm run build
npx @tauri-apps/cli build

# 生成产物路径:
# src-tauri/target/release/bundle/msi/NodePulse_1.0.0_x64_en-US.msi
# src-tauri/target/release/bundle/nsis/NodePulse_1.0.0_x64-setup.exe`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* MACOS TAB */}
          {activeTab === 'macos' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">方案 1：Safari 17+ / Chrome “添加到程序坞 (Dock)”</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40">
                      macOS 原生集成
                    </span>
                  </div>
                </div>
                <p className="text-neutral-400">
                  在 macOS Sonoma / Sequoia 上，Safari 现已完全原生支持将 Web 应用作为独立 App 运行：
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 pl-1">
                  <li>使用 Safari 浏览器打开当前页面。</li>
                  <li>在顶部菜单栏点击 <strong className="text-white">“文件 (File)”</strong> → <strong className="text-white">“添加到程序坞 (Add to Dock...)”</strong>。</li>
                  <li>可直接通过 Spotlight 聚焦搜索或启动台 (Launchpad) 打开，支持系统 <span className="font-mono">⌘ + Tab</span> 快速切换。</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">方案 2：Tauri 构建 macOS .DMG 镜像及通用二进制文件</span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/40">
                      支持 Apple Silicon (M1/M2/M3/M4) 及 Intel
                    </span>
                  </div>
                </div>

                <div className="relative bg-neutral-950 p-3 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-200">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'npm run build\nnpx @tauri-apps/cli build',
                        'mac-cmd'
                      )
                    }
                    className="absolute top-2.5 right-2.5 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] flex items-center gap-1"
                  >
                    {copiedCode === 'mac-cmd' ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>复制代码</span>
                      </>
                    )}
                  </button>
                  <pre className="whitespace-pre overflow-x-auto py-1">
{`# 编译生成 macOS .dmg 磁盘镜像安装包
npm run build
npx @tauri-apps/cli build

# 生成产物路径:
# src-tauri/target/release/bundle/dmg/NodePulse_1.0.0_aarch64.dmg
# src-tauri/target/release/bundle/macos/NodePulse.app`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* LINUX TAB */}
          {activeTab === 'linux' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">方案 1：Tauri 打包 .AppImage (通用 Linux 可执行单文件)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40">
                      适配 Ubuntu, Debian, Arch, Fedora
                    </span>
                  </div>
                </div>
                <p className="text-neutral-400">
                  无需安装复杂依赖，单文件赋权即可直接双击运行：
                </p>

                <div className="relative bg-neutral-950 p-3 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-200">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'npm run build\nnpx @tauri-apps/cli build --bundles appimage,deb',
                        'linux-cmd'
                      )
                    }
                    className="absolute top-2.5 right-2.5 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] flex items-center gap-1"
                  >
                    {copiedCode === 'linux-cmd' ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>复制代码</span>
                      </>
                    )}
                  </button>
                  <pre className="whitespace-pre overflow-x-auto py-1">
{`# 编译生成 AppImage 与 Debian .deb 安装包
npm run build
npx @tauri-apps/cli build --bundles appimage,deb

# 运行:
chmod +x src-tauri/target/release/bundle/appimage/nodepulse_1.0.0_amd64.AppImage
./src-tauri/target/release/bundle/appimage/nodepulse_1.0.0_amd64.AppImage`}
                  </pre>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <span className="text-sm font-bold text-white">方案 2：Linux 桌面快捷方式 (nodepulse.desktop)</span>
                <p className="text-neutral-400">
                  可将以下内容保存至 <span className="font-mono text-cyan-300">~/.local/share/applications/nodepulse.desktop</span>，使应用出现在 GNOME / KDE 应用启动器中：
                </p>
                <div className="relative bg-neutral-950 p-3 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-200">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `[Desktop Entry]\nName=NodePulse\nComment=Network Speed & Egress Diagnostics\nExec=google-chrome --app=${window.location.origin}\nIcon=network-transmit-receive\nTerminal=false\nType=Application\nCategories=Network;Utility;`,
                        'desktop-entry'
                      )
                    }
                    className="absolute top-2.5 right-2.5 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] flex items-center gap-1"
                  >
                    {copiedCode === 'desktop-entry' ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>复制配置</span>
                      </>
                    )}
                  </button>
                  <pre className="whitespace-pre overflow-x-auto py-1">
{`[Desktop Entry]
Name=NodePulse
Comment=Network Speed & Egress Diagnostics
Exec=google-chrome --app=${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}
Icon=network-transmit-receive
Terminal=false
Type=Application
Categories=Network;Utility;`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* OFFLINE / ROUTER TAB */}
          {activeTab === 'offline' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">局域网 / 软路由 (OpenWrt / iKuai / Docker) 部署</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/40">
                    全离线运行
                  </span>
                </div>
                <p className="text-neutral-400">
                  在经过 <span className="font-mono text-cyan-300">npm run build</span> 构建后，输出的 <span className="font-mono text-cyan-300">dist/</span> 目录为纯静态资源，具备完整的 Service Worker 离线缓存。可直接挂载至任何 Nginx、Caddy 或 Docker 容器中：
                </p>

                <div className="relative bg-neutral-950 p-3 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-200">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'docker run -d --name nodepulse -p 8080:80 -v $(pwd)/dist:/usr/share/nginx/html:ro nginx:alpine',
                        'docker-cmd'
                      )
                    }
                    className="absolute top-2.5 right-2.5 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] flex items-center gap-1"
                  >
                    {copiedCode === 'docker-cmd' ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>复制 Docker 指令</span>
                      </>
                    )}
                  </button>
                  <pre className="whitespace-pre overflow-x-auto py-1">
{`# 一键 Docker 部署至软路由或本地 NAS:
docker run -d \\
  --name nodepulse-diagnostics \\
  --restart unless-stopped \\
  -p 8080:80 \\
  -v $(pwd)/dist:/usr/share/nginx/html:ro \\
  nginx:alpine`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span>适配 Chromium, Gecko, WebKit 及 Tauri 跨平台引擎规范</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-colors"
          >
            返回测速看板
          </button>
        </div>
      </div>
    </div>
  );
};
