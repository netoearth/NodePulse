import React from 'react';
import { Globe, RefreshCw, Plus, CheckCircle, AlertTriangle, XCircle, ArrowUpRight, Zap } from 'lucide-react';
import { RouteNode } from '../types';

interface RouteNodeMatrixProps {
  nodes: RouteNode[];
  isTestingAll: boolean;
  onTestAll: () => void;
  onTestNode: (nodeId: string) => void;
  onOpenCustomTarget: () => void;
}

export const RouteNodeMatrix: React.FC<RouteNodeMatrixProps> = ({
  nodes,
  isTestingAll,
  onTestAll,
  onTestNode,
  onOpenCustomTarget,
}) => {
  return (
    <div className="w-full bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 md:p-7 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-neutral-800/60">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              全球主要路由节点延迟矩阵 (Global Transit Route Matrix)
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            横向比对中国大陆至亚太主流出境枢纽及欧美核心数据中心的中继往返时延与丢包表现
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCustomTarget}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800/80 border border-neutral-700/60 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5 text-neutral-400" />
            <span>自定义节点</span>
          </button>

          <button
            onClick={onTestAll}
            disabled={isTestingAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <RefreshCw className={`h-3 w-3 ${isTestingAll ? 'animate-spin' : ''}`} />
            <span>{isTestingAll ? '批量测速中...' : '测试全部路由'}</span>
          </button>
        </div>
      </div>

      {/* Nodes Table / Cards Grid */}
      <div className="mt-5 space-y-2.5">
        {nodes.map((node) => {
          const isNodeTesting = node.status === 'testing';
          const isSuccess = node.status === 'success';
          const isWarning = node.status === 'warning';
          const isError = node.status === 'error';

          // Visual bar calculation (0 - 400ms scale)
          const barPct = node.latency ? Math.min(100, Math.max(5, (node.latency / 400) * 100)) : 0;

          return (
            <div
              key={node.id}
              className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/70 hover:border-neutral-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              {/* Region and Location Info */}
              <div className="flex items-center gap-3 min-w-[240px]">
                <span className="text-xl leading-none">{node.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                      {node.name}
                    </span>
                    {node.isDirectTarget && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-300">
                        国内分流
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                    <span>{node.provider}</span>
                    <span>·</span>
                    <span>{node.region}</span>
                  </div>
                </div>
              </div>

              {/* Visual Latency Bar & Metrics */}
              <div className="flex-1 max-w-md mx-0 md:mx-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 text-[11px]">延迟:</span>
                    <span className="font-mono font-bold text-sm text-white tabular-nums">
                      {node.latency !== null ? `${node.latency} ms` : isNodeTesting ? '测试中...' : '--'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400 tabular-nums">
                    <span>
                      抖动: {node.jitter !== null ? `${node.jitter}ms` : '--'}
                    </span>
                    <span>
                      丢包:{' '}
                      <span className={node.lossRate && node.lossRate > 0 ? 'text-rose-400 font-bold' : ''}>
                        {node.lossRate !== null ? `${node.lossRate}%` : '--'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Latency Progress bar */}
                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isError
                        ? 'bg-rose-500'
                        : node.latency && node.latency < 90
                        ? 'bg-emerald-400'
                        : node.latency && node.latency < 180
                        ? 'bg-cyan-400'
                        : node.latency && node.latency < 280
                        ? 'bg-amber-400'
                        : 'bg-indigo-400'
                    }`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              </div>

              {/* Status and Action button */}
              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                <div className="text-right">
                  {isNodeTesting ? (
                    <span className="text-xs text-cyan-400 flex items-center gap-1 font-mono">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      探针发送
                    </span>
                  ) : isSuccess ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      连接极佳
                    </span>
                  ) : isWarning ? (
                    <span className="text-xs text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      延迟偏高
                    </span>
                  ) : isError ? (
                    <span className="text-xs text-rose-400 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      请求超时
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-500 font-mono">未测试</span>
                  )}
                </div>

                <button
                  onClick={() => onTestNode(node.id)}
                  disabled={isNodeTesting}
                  className="px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-md transition-colors whitespace-nowrap active:scale-95"
                >
                  重测
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
