import React from 'react';
import { ArrowDown, ArrowUp, Activity, Gauge, Wifi, Layers } from 'lucide-react';
import { LatencyStats, SpeedDataPoint } from '../types';

interface HeroTelemetryProps {
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  peakDownload: number;
  peakUpload: number;
  latencyStats: LatencyStats;
  currentStage: 'idle' | 'egress' | 'ping' | 'download' | 'upload' | 'routes' | 'unlock' | 'finished';
  progress: number;
  speedHistory: SpeedDataPoint[];
}

export const HeroTelemetry: React.FC<HeroTelemetryProps> = ({
  downloadSpeed,
  uploadSpeed,
  peakDownload,
  peakUpload,
  latencyStats,
  currentStage,
  progress,
  speedHistory,
}) => {
  // Stage description
  const stageLabels: Record<string, string> = {
    idle: '就绪 - 点击开始全面测试',
    egress: '正在探测公网出口与运营商 ASN 信息...',
    ping: '正在高频采样延迟、抖动与丢包率...',
    download: '正在进行多阶梯分块下载测速...',
    upload: '正在进行反向载荷上传吞吐测速...',
    routes: '正在对全球核心中继节点进行路由矩阵测试...',
    unlock: '正在探测流行服务出境访问权限...',
    finished: '诊断完成 - 所有指标已刷新',
  };

  // Generate SVG curve points from speedHistory
  const svgWidth = 720;
  const svgHeight = 120;
  const maxRecordedSpeed = Math.max(10, peakDownload, peakUpload, ...speedHistory.map((d) => d.speed));

  const points = speedHistory.map((d, index) => {
    const x = speedHistory.length <= 1 ? 0 : (index / (speedHistory.length - 1)) * svgWidth;
    const y = svgHeight - (d.speed / maxRecordedSpeed) * (svgHeight - 16) - 8;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = points
    ? `0,${svgHeight} ${points} ${svgWidth},${svgHeight}`
    : `0,${svgHeight} ${svgWidth},${svgHeight}`;

  return (
    <div className="w-full bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 md:p-7 relative overflow-hidden backdrop-blur-sm">
      {/* Glow background accent */}
      <div className="absolute top-0 right-1/4 w-96 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Progress & Stage Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-neutral-800/60">
        <div className="flex items-center gap-2.5">
          <div className={`h-2.5 w-2.5 rounded-full ${
            currentStage === 'idle'
              ? 'bg-neutral-600'
              : currentStage === 'finished'
              ? 'bg-emerald-400'
              : 'bg-cyan-400 animate-ping'
          }`} />
          <span className="text-sm font-medium text-neutral-200">
            {stageLabels[currentStage] || '测试进行中...'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-32 sm:w-48 bg-neutral-950/80 h-2 rounded-full overflow-hidden border border-neutral-800">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-200 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-mono text-neutral-400 w-10 text-right tabular-nums">
            {progress}%
          </span>
        </div>
      </div>

      {/* Main Metric Cards Grid (Cloudflare Speed Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 my-6">
        {/* Download Speed */}
        <div className="col-span-1 lg:col-span-1 p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <ArrowDown className="h-3.5 w-3.5 text-cyan-400" />
              下载速率
            </span>
            <span className="text-neutral-500 font-mono text-[11px] tabular-nums">
              峰值: {peakDownload.toFixed(1)}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-bold font-mono text-white tabular-nums tracking-tight">
              {downloadSpeed.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-neutral-400">Mbps</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            {downloadSpeed > 100 ? '4K/8K 极致流畅' : downloadSpeed > 30 ? '1080P 高清无卡顿' : downloadSpeed > 0 ? '满足基础网页浏览' : '等待测速'}
          </div>
        </div>

        {/* Upload Speed */}
        <div className="col-span-1 lg:col-span-1 p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <ArrowUp className="h-3.5 w-3.5 text-blue-400" />
              上传速率
            </span>
            <span className="text-neutral-500 font-mono text-[11px] tabular-nums">
              峰值: {peakUpload.toFixed(1)}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-bold font-mono text-white tabular-nums tracking-tight">
              {uploadSpeed.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-neutral-400">Mbps</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            {uploadSpeed > 30 ? '视频会议/云备份优良' : uploadSpeed > 10 ? '满足日常上行交互' : '上行带宽储备'}
          </div>
        </div>

        {/* Ping / Latency */}
        <div className="col-span-1 lg:col-span-1 p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
              往返延迟 (Ping)
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-bold font-mono text-emerald-400 tabular-nums tracking-tight">
              {latencyStats.median > 0 ? latencyStats.median : '--'}
            </span>
            <span className="text-xs font-medium text-neutral-400">ms</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 font-mono tabular-nums">
            <span>最快: {latencyStats.min || '--'}ms</span>
            <span>最高: {latencyStats.max || '--'}ms</span>
          </div>
        </div>

        {/* Jitter (抖动) */}
        <div className="col-span-1 lg:col-span-1 p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="h-3.5 w-3.5 text-amber-400" />
              网络抖动 (Jitter)
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-bold font-mono text-white tabular-nums tracking-tight">
              {latencyStats.jitter > 0 ? latencyStats.jitter : '--'}
            </span>
            <span className="text-xs font-medium text-neutral-400">ms</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            {latencyStats.jitter > 0 && latencyStats.jitter < 15
              ? '线路平稳，无剧烈波动'
              : latencyStats.jitter >= 15
              ? '存在突发延迟跳动'
              : '延迟波动偏差'}
          </div>
        </div>

        {/* Packet Loss (丢包率) */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Gauge className="h-3.5 w-3.5 text-rose-400" />
              丢包率 (Packet Loss)
            </span>
            <span className="text-[11px] text-neutral-500 font-mono tabular-nums">
              {latencyStats.lost}/{latencyStats.sent} 包
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight ${
              latencyStats.lossRate === 0
                ? 'text-emerald-400'
                : latencyStats.lossRate < 5
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}>
              {latencyStats.sent > 0 ? `${latencyStats.lossRate.toFixed(1)}%` : '--'}
            </span>
          </div>
          <div className="mt-2 text-[11px]">
            {latencyStats.sent === 0 ? (
              <span className="text-neutral-500">采样待启动</span>
            ) : latencyStats.lossRate === 0 ? (
              <span className="text-emerald-400/90 font-medium">0 丢包 · 极佳链路</span>
            ) : latencyStats.lossRate <= 3 ? (
              <span className="text-amber-400/90 font-medium">轻微丢包 · 偶发扰动</span>
            ) : (
              <span className="text-rose-400/90 font-medium">严重丢包 · GFW/QoS 阻断</span>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Bandwidth Waveform / Speed Curve Canvas (Cloudflare Speed style) */}
      <div className="mt-4 p-4 rounded-xl bg-neutral-950/90 border border-neutral-800/80">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-semibold text-neutral-300">吞吐量时序曲线 (Bandwidth Waveform)</span>
            <span className="text-neutral-600">·</span>
            <span className="text-[11px] text-neutral-500">实时采样 (Mbps)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400 inline-block" />
              下载阶段
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-400 inline-block" />
              上传阶段
            </span>
          </div>
        </div>

        <div className="h-28 w-full relative flex items-end">
          {speedHistory.length > 1 ? (
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="speedCurveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid baseline lines */}
              <line x1="0" y1="30" x2={svgWidth} y2="30" stroke="#262626" strokeDasharray="3 3" />
              <line x1="0" y1="65" x2={svgWidth} y2="65" stroke="#262626" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2={svgWidth} y2="100" stroke="#262626" strokeDasharray="3 3" />

              {/* Area fill */}
              <polygon points={areaPoints} fill="url(#speedCurveGrad)" />

              {/* Curve line */}
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600 font-mono">
              点击“开始全面测速”后将实时绘制带宽吞吐时序波形
            </div>
          )}
        </div>
      </div>

      {/* Bufferbloat (Loaded Latency) Sub-banner */}
      <div className="mt-4 pt-4 border-t border-neutral-800/70 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-neutral-300">
          <Layers className="h-4 w-4 text-cyan-400" />
          <span className="font-medium">缓冲区膨胀与载荷延迟 (Bufferbloat):</span>
          <span className="text-neutral-400">
            空闲 Ping <span className="font-mono text-neutral-200">{latencyStats.idlePing || '--'}ms</span>
            {' / '}
            载荷下载 Ping <span className="font-mono text-neutral-200">{latencyStats.loadedDownloadPing || '--'}ms</span>
            {' / '}
            载荷上传 Ping <span className="font-mono text-neutral-200">{latencyStats.loadedUploadPing || '--'}ms</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-400">综合缓冲评级:</span>
          <span className="font-mono font-bold px-2 py-0.5 rounded bg-neutral-800 text-cyan-300 border border-neutral-700 text-xs">
            {latencyStats.bufferbloatGrade || 'A'}
          </span>
          <span className="text-[11px] text-neutral-500">
            {latencyStats.bufferbloatGrade === 'A+' || latencyStats.bufferbloatGrade === 'A'
              ? '(边下边玩游戏/通话不卡顿)'
              : '(满速下载时可能导致游戏跳ping)'}
          </span>
        </div>
      </div>
    </div>
  );
};
