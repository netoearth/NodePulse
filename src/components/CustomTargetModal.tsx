import React, { useState } from 'react';
import { X, Play, RefreshCw, CheckCircle, AlertTriangle, XCircle, Globe } from 'lucide-react';
import { singlePingProbe } from '../services/networkProbes';

interface CustomTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPreset?: (name: string, endpoint: string) => void;
}

export const CustomTargetModal: React.FC<CustomTargetModalProps> = ({
  isOpen,
  onClose,
  onAddPreset,
}) => {
  const [targetUrl, setTargetUrl] = useState('https://github.com');
  const [customName, setCustomName] = useState('GitHub 国际节点');
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    pings: number[];
    lost: number;
    median: number;
    jitter: number;
    finished: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const runTest = async () => {
    if (!targetUrl) return;
    setIsTesting(true);
    setTestResults({ pings: [], lost: 0, median: 0, jitter: 0, finished: false });

    const pings: number[] = [];
    let lost = 0;
    const count = 10;

    for (let i = 0; i < count; i++) {
      const rtt = await singlePingProbe(targetUrl, 2000);
      if (rtt > 0) {
        pings.push(rtt);
      } else {
        lost++;
      }

      setTestResults({
        pings: [...pings],
        lost,
        median: pings.length > 0 ? [...pings].sort((a, b) => a - b)[Math.floor(pings.length / 2)] : 0,
        jitter: 0,
        finished: false,
      });

      await new Promise((r) => setTimeout(r, 60));
    }

    let jitter = 0;
    if (pings.length > 1) {
      let diff = 0;
      for (let i = 1; i < pings.length; i++) diff += Math.abs(pings[i] - pings[i - 1]);
      jitter = Math.round(diff / (pings.length - 1));
    }

    setTestResults({
      pings,
      lost,
      median: pings.length > 0 ? [...pings].sort((a, b) => a - b)[Math.floor(pings.length / 2)] : 0,
      jitter,
      finished: true,
    });
    setIsTesting(false);
  };

  const handleAddAndClose = () => {
    if (onAddPreset && targetUrl) {
      onAddPreset(customName || targetUrl, targetUrl);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-cyan-400" />
            <span className="font-bold text-sm text-white">自定义节点延迟与丢包探测</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Input Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              节点名称 / 备注
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="例如: 我的新加坡 VPS / 战地美服"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              目标 HTTPS 地址或接口 (支持任意公网端点)
            </label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <span className="text-[11px] text-neutral-500 mt-1 block">
              注意：基于浏览器安全策略，请填写支持 HTTPS 的域名或可访问的公网网关。
            </span>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1.5">常用快捷预设：</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'GitHub', url: 'https://github.com' },
                { name: 'OpenAI API', url: 'https://api.openai.com' },
                { name: 'Google', url: 'https://www.google.com' },
                { name: 'Steam 商店', url: 'https://store.steampowered.com' },
                { name: 'Bilibili 国内', url: 'https://api.bilibili.com/x/web-interface/nav' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCustomName(p.name);
                    setTargetUrl(p.url);
                  }}
                  className="px-2 py-1 text-[11px] bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-neutral-800 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Test results preview */}
          {testResults && (
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-neutral-300">探针测量结果 (10 发探针)</span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {testResults.finished ? '测试完成' : '探针发送中...'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center my-2">
                <div className="p-2 rounded bg-neutral-950 border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-500 block">往返中位数</span>
                  <span className="font-mono font-bold text-sm text-cyan-400">
                    {testResults.median > 0 ? `${testResults.median}ms` : '--'}
                  </span>
                </div>
                <div className="p-2 rounded bg-neutral-950 border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-500 block">抖动 (Jitter)</span>
                  <span className="font-mono font-bold text-sm text-amber-400">
                    {testResults.jitter > 0 ? `${testResults.jitter}ms` : '--'}
                  </span>
                </div>
                <div className="p-2 rounded bg-neutral-950 border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-500 block">丢包率</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      testResults.lost === 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {Math.round((testResults.lost / 10) * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex gap-1 mt-2">
                {Array.from({ length: 10 }).map((_, i) => {
                  const val = testResults.pings[i];
                  const isLost = i < testResults.pings.length + testResults.lost && val === undefined;
                  return (
                    <div
                      key={i}
                      className={`flex-1 h-3 rounded-sm border ${
                        val ? 'bg-emerald-500/30 border-emerald-500' : isLost ? 'bg-rose-500/40 border-rose-500' : 'bg-neutral-800 border-neutral-700'
                      }`}
                      title={val ? `${val}ms` : isLost ? '丢包超时' : '未发送'}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-end gap-2 text-xs">
          <button
            onClick={runTest}
            disabled={isTesting}
            className="px-3.5 py-2 font-semibold text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? '探测中...' : '测试该目标'}</span>
          </button>

          <button
            onClick={handleAddAndClose}
            className="px-4 py-2 font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
          >
            加入路由矩阵
          </button>
        </div>
      </div>
    </div>
  );
};
