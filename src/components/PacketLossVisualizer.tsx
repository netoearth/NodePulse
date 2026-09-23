import React from 'react';
import { Wifi, Activity, AlertTriangle, CheckCircle2, XCircle, RefreshCw, ShieldAlert, Cpu } from 'lucide-react';
import { LatencyStats, PacketResult } from '../types';

interface PacketLossVisualizerProps {
  packets: PacketResult[];
  stats: LatencyStats;
  isTesting: boolean;
  onRunTest: () => void;
}

export const PacketLossVisualizer: React.FC<PacketLossVisualizerProps> = ({
  packets,
  stats,
  isTesting,
  onRunTest,
}) => {
  // Bucketing latencies for distribution histogram
  const buckets = [
    { label: '< 50ms', min: 0, max: 50, color: 'bg-emerald-500', count: 0 },
    { label: '50-100ms', min: 50, max: 100, color: 'bg-emerald-400', count: 0 },
    { label: '100-150ms', min: 100, max: 150, color: 'bg-cyan-500', count: 0 },
    { label: '150-200ms', min: 150, max: 200, color: 'bg-amber-400', count: 0 },
    { label: '> 200ms', min: 200, max: 999999, color: 'bg-indigo-400', count: 0 },
    { label: '丢包超时', min: -1, max: -1, color: 'bg-rose-500', count: stats.lost },
  ];

  packets.forEach((p) => {
    if (p.status === 'success' && p.latency > 0) {
      for (const b of buckets) {
        if (b.min !== -1 && p.latency >= b.min && p.latency < b.max) {
          b.count++;
          break;
        }
      }
    }
  });

  const maxBucketCount = Math.max(1, ...buckets.map((b) => b.count));

  // Determine GFW & Proxy Health Diagnosis
  const getGfwAssessment = () => {
    if (stats.sent === 0) return { title: '等待检测', desc: '点击“一键连发测丢包”开始向出境中继链路发送 40 个连续检测数据包。', type: 'info' };
    if (stats.lossRate === 0 && stats.jitter < 12) {
      return {
        title: '优质极速专线 (0% 丢包)',
        desc: '未检测到任何丢包与突发抖动。链路极为纯净，典型特征为 IPLC / IEPL 内网专线或优质 CN2 GIA / AS9929 出口，极其适合 FPS 跨国电竞、SSH 远程终端及高频交易。',
        type: 'excellent',
      };
    }
    if (stats.lossRate === 0 && stats.jitter >= 12) {
      return {
        title: '链路稳定无丢包 (偶有轻度抖动)',
        desc: '数据包 100% 成功交付，但存在部分往返延迟波动（Jitter）。对网页浏览与 4K 视频流完全无影响，但高强度实时连麦可能偶有微小停顿。',
        type: 'good',
      };
    }
    if (stats.lossRate > 0 && stats.lossRate <= 4) {
      return {
        title: '轻度丢包扰动 (< 4%)',
        desc: '检测到少数探针超时丢包，通常为国际出口骨干网晚高峰拥塞或运营商 QoS 策略触发。由于 TCP 自动重传，日常访问与视频缓冲基本不受阻。',
        type: 'warning',
      };
    }
    return {
      title: '严重丢包 / GFW 阻断告警 (> 4%)',
      desc: '链路丢包率显著偏高，伴随高抖动！典型原因为 GFW 识别到代理协议特征实施了 TCP RST (重置连接)、UDP 暴力限速丢包，或当前节点机房带宽已过载。建议切换协议（如 Reality / Hysteria 2 / TUIC）或更换其他地区节点。',
      type: 'danger',
    };
  };

  const assessment = getGfwAssessment();

  return (
    <div className="w-full bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 md:p-7 backdrop-blur-sm">
      {/* Header with Title and One-Click Trigger Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800/60">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              延迟与丢包率诊断 (Latency & Packet Loss Inspector)
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            40 组高频连续探针连续穿透测试，精确定位 GFW 阻断、TCP 重置与运营商 QoS 丢包
          </p>
        </div>

        <button
          onClick={onRunTest}
          disabled={isTesting}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-sm whitespace-nowrap active:scale-[0.98] ${
            isTesting
              ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed border border-neutral-700'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold shadow-cyan-950/30'
          }`}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isTesting ? '高频探针发送中...' : '一键连发测丢包 (40包)'}</span>
        </button>
      </div>

      {/* 40-Packet Animated Pulse Matrix Grid (Cloudflare Speed style) */}
      <div className="my-6">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <span className="font-semibold text-neutral-200">数据包交付时序点阵 (40 Packets Burst)</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400 font-mono text-[11px] tabular-nums">
              完成: {packets.filter((p) => p.status !== 'pending').length} / 40
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-neutral-400">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-emerald-400 inline-block" />
              &lt;80ms
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-amber-400 inline-block" />
              80-180ms
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-indigo-400 inline-block" />
              &gt;180ms
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-rose-500 inline-block" />
              丢包 (Timeout)
            </span>
          </div>
        </div>

        {/* The Grid: 40 blocks */}
        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-20 gap-1.5 p-3 rounded-xl bg-neutral-950/90 border border-neutral-800/80">
          {Array.from({ length: 40 }).map((_, index) => {
            const pkt = packets[index];
            const isCurrentTesting = pkt?.status === 'testing';
            const isSuccess = pkt?.status === 'success';
            const isTimeout = pkt?.status === 'timeout';

            let bgClass = 'bg-neutral-900/60 border-neutral-800 text-neutral-600';
            let titleText = `数据包 #${index + 1}: 等待发送`;

            if (isCurrentTesting) {
              bgClass = 'bg-cyan-500/20 border-cyan-400 animate-pulse text-cyan-300';
              titleText = `数据包 #${index + 1}: 正在往返探测...`;
            } else if (isSuccess) {
              if (pkt.latency < 80) {
                bgClass = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300';
              } else if (pkt.latency < 180) {
                bgClass = 'bg-amber-500/20 border-amber-500/60 text-amber-300';
              } else {
                bgClass = 'bg-indigo-500/20 border-indigo-500/60 text-indigo-300';
              }
              titleText = `数据包 #${index + 1}: ${pkt.latency}ms (交付成功)`;
            } else if (isTimeout) {
              bgClass = 'bg-rose-500/25 border-rose-500 text-rose-300 font-bold';
              titleText = `数据包 #${index + 1}: 超时丢包 (Packet Lost / RST)`;
            }

            return (
              <div
                key={index}
                title={titleText}
                className={`h-9 rounded-md border flex flex-col items-center justify-center text-[10px] font-mono transition-all duration-150 select-none cursor-default ${bgClass}`}
              >
                {isCurrentTesting ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                ) : isTimeout ? (
                  <span className="text-rose-400 font-bold">✕</span>
                ) : isSuccess ? (
                  <span className="tabular-nums font-medium">{pkt.latency}</span>
                ) : (
                  <span className="text-neutral-700">·</span>
                )}
                <span className="text-[8px] text-neutral-500/70 -mt-0.5">#{index + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latency Distribution Histogram + Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* Latency Histogram (7 Cols) */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
          <div className="flex items-center justify-between text-xs text-neutral-300 mb-4">
            <span className="font-semibold">延迟区间分布直方图 (Latency Distribution)</span>
            <span className="text-[11px] text-neutral-500 font-mono">样本数: {stats.sent}</span>
          </div>

          <div className="space-y-2.5">
            {buckets.map((b, idx) => {
              const pct = stats.sent > 0 ? Math.round((b.count / stats.sent) * 100) : 0;
              return (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <span className="w-16 font-mono text-[11px] text-neutral-400 text-right shrink-0">
                    {b.label}
                  </span>
                  <div className="flex-1 bg-neutral-900 h-4 rounded-md overflow-hidden p-0.5 border border-neutral-800/60 flex items-center">
                    <div
                      className={`h-full rounded-sm ${b.color} transition-all duration-300`}
                      style={{ width: `${(b.count / maxBucketCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-14 font-mono text-[11px] text-neutral-400 text-right shrink-0 tabular-nums">
                    {b.count} 次 ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistical Summary & Metrics (5 Cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex flex-col justify-between">
          <div className="text-xs font-semibold text-neutral-300 mb-3">
            链路统计参量 (RFC 3550 测量规范)
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800/60">
              <span className="text-neutral-500 text-[11px] block">最快延迟 (Min)</span>
              <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                {stats.min > 0 ? `${stats.min} ms` : '--'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800/60">
              <span className="text-neutral-500 text-[11px] block">中位数延迟 (Median)</span>
              <span className="font-mono text-sm font-bold text-neutral-200 tabular-nums">
                {stats.median > 0 ? `${stats.median} ms` : '--'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800/60">
              <span className="text-neutral-500 text-[11px] block">平均延迟 (Mean)</span>
              <span className="font-mono text-sm font-bold text-neutral-200 tabular-nums">
                {stats.mean > 0 ? `${stats.mean} ms` : '--'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800/60">
              <span className="text-neutral-500 text-[11px] block">网络抖动 (Jitter)</span>
              <span className="font-mono text-sm font-bold text-amber-400 tabular-nums">
                {stats.jitter > 0 ? `${stats.jitter} ms` : '--'}
              </span>
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800/70 flex items-center justify-between text-xs">
            <span className="text-neutral-400">探针发送 / 成功交付 / 丢失</span>
            <span className="font-mono text-neutral-200 font-semibold tabular-nums">
              {stats.sent} / {stats.received} / <span className="text-rose-400">{stats.lost}</span>
            </span>
          </div>
        </div>
      </div>

      {/* GFW / Network Quality Evaluation Banner */}
      <div className={`mt-5 p-4 rounded-xl border flex items-start gap-3 text-xs ${
        assessment.type === 'excellent'
          ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-200'
          : assessment.type === 'good'
          ? 'bg-cyan-950/20 border-cyan-900/50 text-cyan-200'
          : assessment.type === 'warning'
          ? 'bg-amber-950/20 border-amber-900/50 text-amber-200'
          : assessment.type === 'danger'
          ? 'bg-rose-950/25 border-rose-900/60 text-rose-200'
          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
      }`}>
        <div className="shrink-0 mt-0.5">
          {assessment.type === 'excellent' || assessment.type === 'good' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : assessment.type === 'warning' ? (
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          ) : assessment.type === 'danger' ? (
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          ) : (
            <Cpu className="h-4 w-4 text-neutral-400" />
          )}
        </div>
        <div>
          <span className="font-bold block mb-0.5">{assessment.title}</span>
          <p className="leading-relaxed opacity-90">{assessment.desc}</p>
        </div>
      </div>
    </div>
  );
};
