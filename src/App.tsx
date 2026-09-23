import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HeroTelemetry } from './components/HeroTelemetry';
import { PacketLossVisualizer } from './components/PacketLossVisualizer';
import { EgressInspector } from './components/EgressInspector';
import { RouteNodeMatrix } from './components/RouteNodeMatrix';
import { StreamingUnlockProbe } from './components/StreamingUnlockProbe';
import { DiagnosticReportModal } from './components/DiagnosticReportModal';
import { CustomTargetModal } from './components/CustomTargetModal';
import {
  DiagnosticMode,
  EgressInfo,
  LatencyStats,
  PacketResult,
  RouteNode,
  ServiceUnlockStatus,
  SpeedDataPoint,
} from './types';
import {
  PRESET_ROUTE_NODES,
  fetchEgressDetails,
  runPacketLossBurst,
  runDownloadSpeedTest,
  runUploadSpeedTest,
  testIndividualNode,
  evaluateServiceUnlock,
} from './services/networkProbes';

export default function App() {
  const [currentMode, setCurrentMode] = useState<DiagnosticMode>('full');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState<
    'idle' | 'egress' | 'ping' | 'download' | 'upload' | 'routes' | 'unlock' | 'finished'
  >('idle');
  const [progress, setProgress] = useState(0);

  // Egress state
  const [egress, setEgress] = useState<EgressInfo | null>(null);
  const [isEgressLoading, setIsEgressLoading] = useState(false);

  // Speed telemetry
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [peakDownload, setPeakDownload] = useState(0);
  const [peakUpload, setPeakUpload] = useState(0);
  const [speedHistory, setSpeedHistory] = useState<SpeedDataPoint[]>([]);

  // Latency & Packet Loss
  const [packets, setPackets] = useState<PacketResult[]>(() =>
    Array.from({ length: 40 }).map((_, i) => ({
      id: i + 1,
      latency: -1,
      status: 'pending',
      timestamp: 0,
    }))
  );

  const [latencyStats, setLatencyStats] = useState<LatencyStats>({
    min: 0,
    median: 0,
    mean: 0,
    max: 0,
    jitter: 0,
    sent: 0,
    received: 0,
    lost: 0,
    lossRate: 0,
    idlePing: 0,
    loadedDownloadPing: 0,
    loadedUploadPing: 0,
    bufferbloatGrade: 'A',
  });

  // Route nodes matrix
  const [routeNodes, setRouteNodes] = useState<RouteNode[]>(PRESET_ROUTE_NODES);
  const [isTestingRoutes, setIsTestingRoutes] = useState(false);

  // Service unlock
  const [services, setServices] = useState<ServiceUnlockStatus[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);

  // Modals
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isCustomTargetOpen, setIsCustomTargetOpen] = useState(false);

  // Abort controller reference for stopping tests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initial load: Fetch Egress info and evaluate initial services
  useEffect(() => {
    loadEgressData();
  }, []);

  const loadEgressData = async () => {
    setIsEgressLoading(true);
    try {
      const data = await fetchEgressDetails();
      setEgress(data);
      const initialServices = await evaluateServiceUnlock(data);
      setServices(initialServices);
    } catch (e) {
      console.error('Failed to load egress info', e);
    } finally {
      setIsEgressLoading(false);
    }
  };

  // Stop running tests
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRunning(false);
    setCurrentStage('finished');
  };

  // Run 40-packet burst specifically
  const handleRunPacketBurst = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setCurrentStage('ping');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Reset packets
    const newPackets: PacketResult[] = Array.from({ length: 40 }).map((_, i) => ({
      id: i + 1,
      latency: -1,
      status: 'pending',
      timestamp: 0,
    }));
    setPackets(newPackets);

    try {
      const finalStats = await runPacketLossBurst(
        40,
        (pkt, stats) => {
          setPackets((prev) => {
            const next = [...prev];
            next[pkt.id - 1] = pkt;
            return next;
          });
          setLatencyStats(stats);
        },
        controller.signal
      );
      setLatencyStats(finalStats);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
      setCurrentStage('finished');
      abortControllerRef.current = null;
    }
  };

  // Full comprehensive test suite
  const handleStartFullDiagnostic = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setProgress(2);
    setSpeedHistory([]);
    setDownloadSpeed(0);
    setUploadSpeed(0);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    try {
      // Step 1: Egress check
      setCurrentStage('egress');
      setProgress(5);
      const egressData = await fetchEgressDetails();
      setEgress(egressData);
      setProgress(15);
      if (signal.aborted) return;

      // Step 2: Ping & Loss burst
      setCurrentStage('ping');
      const resetPackets: PacketResult[] = Array.from({ length: 40 }).map((_, i) => ({
        id: i + 1,
        latency: -1,
        status: 'pending',
        timestamp: 0,
      }));
      setPackets(resetPackets);

      const pingStats = await runPacketLossBurst(
        40,
        (pkt, stats) => {
          setPackets((prev) => {
            const copy = [...prev];
            copy[pkt.id - 1] = pkt;
            return copy;
          });
          setLatencyStats(stats);
          setProgress(15 + Math.round((pkt.id / 40) * 20)); // up to 35%
        },
        signal
      );
      if (signal.aborted) return;

      // Step 3: Download speed test
      setCurrentStage('download');
      let currentHistory: SpeedDataPoint[] = [];
      const dlResult = await runDownloadSpeedTest((speedMbps, dlProgress, loadedPing) => {
        setDownloadSpeed(speedMbps);
        setPeakDownload((prev) => Math.max(prev, speedMbps));
        setProgress(35 + Math.round((dlProgress / 100) * 30)); // 35% - 65%

        const timeSec = currentHistory.length * 0.15;
        currentHistory = [...currentHistory, { time: timeSec, speed: speedMbps, stage: 'download' }];
        setSpeedHistory(currentHistory);

        if (loadedPing && loadedPing > 0) {
          setLatencyStats((prev) => ({
            ...prev,
            loadedDownloadPing: loadedPing,
          }));
        }
      }, signal);
      setDownloadSpeed(dlResult.avgMbps);
      setPeakDownload(dlResult.peakMbps);
      if (signal.aborted) return;

      // Step 4: Upload speed test
      setCurrentStage('upload');
      const ulResult = await runUploadSpeedTest((speedMbps, ulProgress, loadedPing) => {
        setUploadSpeed(speedMbps);
        setPeakUpload((prev) => Math.max(prev, speedMbps));
        setProgress(65 + Math.round((ulProgress / 100) * 20)); // 65% - 85%

        const timeSec = currentHistory.length * 0.15;
        currentHistory = [...currentHistory, { time: timeSec, speed: speedMbps, stage: 'upload' }];
        setSpeedHistory(currentHistory);

        if (loadedPing && loadedPing > 0) {
          setLatencyStats((prev) => ({
            ...prev,
            loadedUploadPing: loadedPing,
          }));
        }
      }, signal);
      setUploadSpeed(ulResult.avgMbps);
      setPeakUpload(ulResult.peakMbps);
      if (signal.aborted) return;

      // Calculate Bufferbloat Grade
      const idle = pingStats.median || 50;
      const dlPing = dlResult.loadedPing || idle;
      const pingIncrease = dlPing - idle;
      let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
      if (pingStats.lossRate > 15) grade = 'F';
      else if (pingStats.lossRate > 5 || pingIncrease > 120) grade = 'D';
      else if (pingIncrease > 60) grade = 'C';
      else if (pingIncrease > 25) grade = 'B';
      else if (pingIncrease > 8) grade = 'A';
      else grade = 'A+';

      setLatencyStats((prev) => ({
        ...prev,
        bufferbloatGrade: grade,
      }));

      // Step 5: Routes matrix quick sample
      setCurrentStage('routes');
      setProgress(88);
      for (let i = 0; i < Math.min(4, routeNodes.length); i++) {
        if (signal.aborted) break;
        const node = routeNodes[i];
        setRouteNodes((prev) =>
          prev.map((n) => (n.id === node.id ? { ...n, status: 'testing' } : n))
        );
        const updated = await testIndividualNode(node, signal);
        setRouteNodes((prev) => prev.map((n) => (n.id === node.id ? updated : n)));
      }
      setProgress(95);
      if (signal.aborted) return;

      // Step 6: Service unlock evaluation
      setCurrentStage('unlock');
      const updatedServices = await evaluateServiceUnlock(egressData);
      setServices(updatedServices);
      setProgress(100);

      setCurrentStage('finished');
    } catch (e) {
      console.error('Error during diagnostic run', e);
      setCurrentStage('finished');
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  // Test individual route node
  const handleTestRouteNode = async (nodeId: string) => {
    const target = routeNodes.find((n) => n.id === nodeId);
    if (!target) return;

    setRouteNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, status: 'testing' } : n))
    );

    const result = await testIndividualNode(target);
    setRouteNodes((prev) => prev.map((n) => (n.id === nodeId ? result : n)));
  };

  // Test all route nodes
  const handleTestAllRoutes = async () => {
    if (isTestingRoutes) return;
    setIsTestingRoutes(true);

    for (const node of routeNodes) {
      setRouteNodes((prev) =>
        prev.map((n) => (n.id === node.id ? { ...n, status: 'testing' } : n))
      );
      const res = await testIndividualNode(node);
      setRouteNodes((prev) => prev.map((n) => (n.id === node.id ? res : n)));
      await new Promise((r) => setTimeout(r, 40));
    }

    setIsTestingRoutes(false);
  };

  // Add custom target to route nodes
  const handleAddCustomTarget = (name: string, endpoint: string) => {
    const newNode: RouteNode = {
      id: `custom_${Date.now()}`,
      name,
      region: '自定义目标',
      city: 'Custom',
      countryCode: '🌐',
      flag: '🎯',
      endpoint,
      provider: '用户自定义',
      latency: null,
      jitter: null,
      lossRate: null,
      status: 'idle',
    };
    setRouteNodes((prev) => [newNode, ...prev]);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200 font-sans">
      {/* Top Header */}
      <Header
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        isRunning={isRunning}
        onStart={handleStartFullDiagnostic}
        onStop={handleStop}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Cloudflare Speed style Hero Telemetry (Always visible or in Full mode) */}
        {(currentMode === 'full' || currentMode === 'quick-ping') && (
          <HeroTelemetry
            downloadSpeed={downloadSpeed}
            uploadSpeed={uploadSpeed}
            peakDownload={peakDownload}
            peakUpload={peakUpload}
            latencyStats={latencyStats}
            currentStage={currentStage}
            progress={progress}
            speedHistory={speedHistory}
          />
        )}

        {/* Latency & Packet Loss Visualizer (Highlighted by user: 一键检测延迟与丢包率并支持动画显示) */}
        {(currentMode === 'full' || currentMode === 'quick-ping') && (
          <PacketLossVisualizer
            packets={packets}
            stats={latencyStats}
            isTesting={isRunning && currentStage === 'ping'}
            onRunTest={handleRunPacketBurst}
          />
        )}

        {/* Egress IP, ASN & Routing Telemetry */}
        {(currentMode === 'full' || currentMode === 'unlock') && (
          <EgressInspector
            egress={egress}
            isLoading={isEgressLoading}
            onRefresh={loadEgressData}
          />
        )}

        {/* Global Route Node Matrix */}
        {(currentMode === 'full' || currentMode === 'routes') && (
          <RouteNodeMatrix
            nodes={routeNodes}
            isTestingAll={isTestingRoutes}
            onTestAll={handleTestAllRoutes}
            onTestNode={handleTestRouteNode}
            onOpenCustomTarget={() => setIsCustomTargetOpen(true)}
          />
        )}

        {/* Streaming and Service Unlock Probe */}
        {(currentMode === 'full' || currentMode === 'unlock') && (
          <StreamingUnlockProbe
            services={services}
            isLoading={isServicesLoading}
            onRetest={async () => {
              setIsServicesLoading(true);
              if (egress) {
                const s = await evaluateServiceUnlock(egress);
                setServices(s);
              }
              setIsServicesLoading(false);
            }}
          />
        )}

        {/* Diagnostic Guide & Troubleshooting for GFW Users */}
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/60 text-xs text-neutral-400 space-y-2">
          <div className="font-semibold text-neutral-300 text-sm flex items-center gap-2">
            <span>🛡️ 应对中国大陆 GFW 网络波动的诊断建议</span>
          </div>
          <p className="leading-relaxed">
            1. <strong className="text-neutral-200">丢包率持续高于 5%</strong>：通常为晚高峰国际骨干网 QoS 拥塞、或 GFW 识别到 TLS 握手特征实施了 TCP RST 干扰。建议在代理软件中启用 <span className="font-mono text-cyan-300">Hysteria 2</span>、<span className="font-mono text-cyan-300">TUIC v5</span> (基于 UDP/QUIC 强抗拥塞丢包) 或 <span className="font-mono text-cyan-300">VLESS-Reality</span> 协议。
          </p>
          <p className="leading-relaxed">
            2. <strong className="text-neutral-200">国内网站变慢或打不开</strong>：请检查客户端是否开启了“全局代理 (Global)”。推荐切换为“规则分流 (Rule)”，将中国大陆域名及 IP 段加入直连列表 (DIRECT)，避免国内流量无谓绕行境外节点造成严重延迟损耗。
          </p>
          <p className="leading-relaxed">
            3. <strong className="text-neutral-200">流媒体或 ChatGPT 提示不可用</strong>：大多数公共 VPS 机房 IP 已被列入风控黑名单。可选择带有“原生住宅 IP”或“原生双 ISP”标签的节点以实现全绿解锁。
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-800/80 py-5 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NodePulse · 代理网络与全球出口链路高精度诊断平台</span>
          <span className="font-mono text-[11px] text-neutral-600">
            Telemetry Protocol RFC 3550 Compliant · Inspired by speed.cloudflare.com
          </span>
        </div>
      </footer>

      {/* Modals */}
      <DiagnosticReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        egress={egress}
        stats={latencyStats}
        downloadSpeed={downloadSpeed}
        uploadSpeed={uploadSpeed}
        peakDownload={peakDownload}
        peakUpload={peakUpload}
        routes={routeNodes}
        services={services}
      />

      <CustomTargetModal
        isOpen={isCustomTargetOpen}
        onClose={() => setIsCustomTargetOpen(false)}
        onAddPreset={handleAddCustomTarget}
      />
    </div>
  );
}
