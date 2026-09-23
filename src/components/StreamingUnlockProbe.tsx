import React from 'react';
import { ShieldCheck, CheckCircle, AlertCircle, XCircle, PlaySquare, Sparkles, Search, Compass } from 'lucide-react';
import { ServiceUnlockStatus } from '../types';

interface StreamingUnlockProbeProps {
  services: ServiceUnlockStatus[];
  isLoading: boolean;
  onRetest: () => void;
}

export const StreamingUnlockProbe: React.FC<StreamingUnlockProbeProps> = ({
  services,
  isLoading,
  onRetest,
}) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'AI 生产力':
        return <Sparkles className="h-4 w-4 text-cyan-400" />;
      case '流媒体':
        return <PlaySquare className="h-4 w-4 text-blue-400" />;
      case '社交与搜索':
        return <Search className="h-4 w-4 text-amber-400" />;
      default:
        return <Compass className="h-4 w-4 text-emerald-400" />;
    }
  };

  return (
    <div className="w-full bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 md:p-7 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-neutral-800/60">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              流媒体与热门服务出境解锁探测 (Media & Service Unlock Probe)
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            基于当前出口 IP 的地理属性、ASN 原生住宅判定及跨国路由规则，评估关键出境业务可用性
          </p>
        </div>

        <button
          onClick={onRetest}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800/80 border border-neutral-700/60 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap active:scale-[0.98]"
        >
          <span>重新检测服务</span>
        </button>
      </div>

      {/* Grid of Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 my-5">
        {services.map((svc) => {
          const isUnlocked = svc.status === 'unlocked';
          const isRestricted = svc.status === 'restricted';
          const isBlocked = svc.status === 'blocked';

          return (
            <div
              key={svc.id}
              className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getIcon(svc.category)}
                    <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                      {svc.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {svc.category}
                  </span>
                </div>

                <div className="my-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        已完整解锁
                      </span>
                    ) : isRestricted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                        <AlertCircle className="h-3.5 w-3.5" />
                        部分受限 / 仅自制剧
                      </span>
                    ) : isBlocked ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400">
                        <XCircle className="h-3.5 w-3.5" />
                        访问受阻 / GFW阻断
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-500 font-mono">检测中...</span>
                    )}
                  </div>

                  {svc.region && (
                    <span className="text-[11px] font-mono text-neutral-400">
                      {svc.region}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-900 text-[11px] text-neutral-400 leading-relaxed">
                {svc.note}
              </div>
            </div>
          );
        })}
      </div>

      {/* Practical Guide */}
      <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800/70 text-xs text-neutral-400 leading-relaxed">
        <span className="text-neutral-300 font-semibold block mb-1">
          💡 关于出境流媒体与 AI 服务风控机制：
        </span>
        许多国际流媒体（如 Netflix、Disney+）与 AI 服务（OpenAI、Claude）会通过 MaxMind 或 IP2Location 数据库审查出口 IP 是否属于公共机房（Datacenter）。若显示“部分受限”，建议在代理客户端中切换至“原生住宅”节点或“双ISP”节点以获取最佳解锁体验。
      </div>
    </div>
  );
};
