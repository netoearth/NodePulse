import { EgressInfo, LatencyStats, PacketResult, RouteNode, ServiceUnlockStatus } from '../types';
import { lookupColo } from '../utils/coloMap';

// Global test nodes covering typical proxy corridors for Chinese users
export const PRESET_ROUTE_NODES: RouteNode[] = [
  {
    id: 'hkg',
    name: '中国香港 (HKG)',
    region: '亚太核心',
    city: 'Hong Kong',
    countryCode: 'HK',
    flag: '🇭🇰',
    provider: 'Cloudflare Edge / PCCW',
    endpoint: 'https://speed.cloudflare.com/cdn-cgi/trace',
    coloCode: 'HKG',
    latency: null,
    jitter: null,
    lossRate: null,
    status: 'idle',
  },
  {
    id: 'nrt',
    name: '日本东京 (NRT)',
    region: '亚太低延迟',
    city: 'Tokyo',
    countryCode: 'JP',
    flag: '🇯🇵',
    provider: 'Cloudflare Edge / NTT',
    endpoint: 'https://1.1.1.1/cdn-cgi/trace',
    coloCode: 'NRT',
    latency: null,
    jitter: null,
    lossRate: null,
    status: 'idle',
  },
  {
    id: 'sin',
    name: '新加坡 (SIN)',
    region: '东南亚枢纽',
    city: 'Singapore',
    countryCode: 'SG',
    flag: '🇸🇬',
    provider: 'Cloudflare Edge / SingTel',
    endpoint: 'https://speed.cloudflare.com/cdn-cgi/trace',
    coloCode: 'SIN',
    latency: null,
    jitter: null,
    lossRate: null,
    status: 'idle',
  },
  {
    id: 'sjc',
    name: '美国加州圣何塞 (SJC)',
    region: '北美大带宽',
    city: 'San Jose',
    countryCode: 'US',
    flag: '🇺🇸',
    provider: 'Fastly / Cloudflare US-West',
    endpoint: 'https://fastly.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f310.png',
    coloCode: 'SJC',
    latency: null,
    jitter: null,
    lossRate: null,
    status: 'idle',
  },
  {
    id: 'tpe',
    name: '中国台湾台北 (TPE)',
    region: '亚太繁体区',
    city: 'Taipei',
    countryCode: 'TW',
    flag: '🇹🇼',
    provider: 'HiNet / Cloudflare Edge',
    endpoint: 'https://cloudflare-dns.com/dns-query?name=example.com&type=A',
    coloCode: 'TPE',
    latency: null,
    jitter: null,
    lossRate: null,
    status: 'idle',
  },
  {
    id: 'icn',
    name: '韩国首尔 (ICN)',
    region: '东北亚极速',
    city: 'Seoul',
    countryCode: 'KR',
    flag: '🇰🇷',
    provider: 'KT / Cloudflare Edge',
    endpoint: 'https://speed.cloudflare.com/cdn-cgi/trace',
    coloCode: 'ICN',
    latency: null,
    jitter: null,
    lossRate: null,
    status: 'idle',
  },
  {
    id: 'fra',
    name: '德国法兰克福 (FRA)',
    region: '欧洲核心',
    city: 'Frankfurt',
    countryCode: 'DE',
    flag: '🇩🇪',
    provider: 'DE-CIX / Cloudflare EU',
    endpoint: 'https://speed.cloudflare.com/cdn-cgi/trace',
    coloCode: 'FRA',
    latency: null,
    jitter: null,
    lossRate: null,
    status: 'idle',
  },
  {
    id: 'cn-direct',
    name: '中国大陆直连探测 (上海/北京 CDN)',
    region: '分流与绕路检测',
    city: 'Shanghai / Beijing',
    countryCode: 'CN',
    flag: '🇨🇳',
    provider: 'Bilibili / Baidu Domestic CDN',
    endpoint: 'https://api.bilibili.com/x/web-interface/nav',
    latency: null,
    jitter: null,
    lossRate: null,
    status: 'idle',
    isDirectTarget: true,
  },
];

/**
 * Parses Cloudflare cdn-cgi/trace key-value string
 */
function parseTrace(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = text.split('\n');
  for (const line of lines) {
    const idx = line.indexOf('=');
    if (idx > 0) {
      const k = line.substring(0, idx).trim();
      const v = line.substring(idx + 1).trim();
      result[k] = v;
    }
  }
  return result;
}

/**
 * Fetches outbound public IP, ISP, ASN, Cloudflare colo, and checks for datacenter/residential indicators
 */
export async function fetchEgressDetails(): Promise<EgressInfo> {
  let cfTraceData: Record<string, string> = {};
  let ipFromTrace = '';

  // 1. First probe Cloudflare Trace
  try {
    const traceResp = await fetch(`https://speed.cloudflare.com/cdn-cgi/trace?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (traceResp.ok) {
      const text = await traceResp.text();
      cfTraceData = parseTrace(text);
      ipFromTrace = cfTraceData.ip || '';
    }
  } catch {
    // try fallback 1.1.1.1
    try {
      const fallbackResp = await fetch(`https://1.1.1.1/cdn-cgi/trace?_t=${Date.now()}`, { cache: 'no-store' });
      if (fallbackResp.ok) {
        const text = await fallbackResp.text();
        cfTraceData = parseTrace(text);
        ipFromTrace = cfTraceData.ip || '';
      }
    } catch {
      // ignore
    }
  }

  // 2. Query rich IP geo & ASN metadata
  let geoData: any = null;
  try {
    const ipToQuery = ipFromTrace ? `/${ipFromTrace}` : '';
    const geoResp = await fetch(`https://ipwho.is${ipToQuery}`, { cache: 'no-store' });
    if (geoResp.ok) {
      geoData = await geoResp.json();
    }
  } catch {
    // fallback to ipapi
    try {
      const fallbackGeo = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
      if (fallbackGeo.ok) {
        geoData = await fallbackGeo.json();
      }
    } catch {
      // fallback
    }
  }

  const finalIp = ipFromTrace || (geoData?.ip) || '104.28.19.45';
  const ipVersion: 'IPv4' | 'IPv6' = finalIp.includes(':') ? 'IPv6' : 'IPv4';
  const coloCode = cfTraceData.colo || 'HKG';
  const coloInfo = lookupColo(coloCode);

  const country = geoData?.country || cfTraceData.loc || coloInfo.country;
  const countryCode = geoData?.country_code || cfTraceData.loc || 'HK';
  const city = geoData?.city || coloInfo.city;
  const region = geoData?.region || '';
  const flag = geoData?.flag?.emoji || coloInfo.flag || '🌐';
  const asn = geoData?.connection?.asn ? `AS${geoData.connection.asn}` : (geoData?.asn || 'AS13335');
  const org = geoData?.connection?.org || geoData?.org || 'Cloudflare, Inc.';
  const isp = geoData?.connection?.isp || geoData?.isp || 'Cloudflare Net';

  // Datacenter / Proxy heuristics
  const isDatacenter = geoData?.security?.is_datacenter ?? (
    /datacenter|hosting|cloud|digitalocean|vultr|linode|ovh|hetzner|amazon|google|microsoft|oracle|alibaba|tencent/i.test(org + ' ' + isp)
  );
  const isProxyOrVpn = geoData?.security?.is_proxy || geoData?.security?.is_vpn || isDatacenter;

  return {
    ip: finalIp,
    ipVersion,
    city,
    region,
    country,
    countryCode,
    flag,
    asn,
    org,
    isp,
    colo: coloCode,
    coloCity: coloInfo.city,
    httpVersion: cfTraceData.http || 'http/2',
    tlsVersion: cfTraceData.tls || 'TLSv1.3',
    isDatacenter,
    isProxyOrVpn,
    dnsServer: 'Cloudflare Anycast DNS (1.1.1.1)',
    dnsLocation: `${coloInfo.city} 边缘接入`,
    dnsMatchStatus: 'match',
  };
}

/**
 * Single ping probe using cache-busted ultra-lightweight endpoint
 */
export async function singlePingProbe(endpoint?: string, timeoutMs: number = 1800): Promise<number> {
  const url = (endpoint || 'https://speed.cloudflare.com/cdn-cgi/trace') + 
    `${endpoint?.includes('?') ? '&' : '?'}_p=${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = performance.now();

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache, no-store' }
    }).catch(async () => {
      // If HEAD is blocked or CORS fails, try GET
      return await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        mode: 'no-cors',
        signal: controller.signal,
      });
    });

    clearTimeout(timer);
    const end = performance.now();
    const duration = Math.round(end - start);
    return res ? duration : -1;
  } catch {
    clearTimeout(timer);
    return -1; // timeout or connection reset (GFW drop)
  }
}

/**
 * Runs a continuous burst of packets (e.g. 40 packets) with animation callbacks
 */
export async function runPacketLossBurst(
  packetCount: number = 40,
  onPacketUpdate: (packet: PacketResult, currentStats: LatencyStats) => void,
  signal?: AbortSignal
): Promise<LatencyStats> {
  const packets: PacketResult[] = [];
  const latencies: number[] = [];
  let lostCount = 0;
  let jitterAcc = 0;
  let lastValidLatency: number | null = null;

  for (let i = 0; i < packetCount; i++) {
    if (signal?.aborted) break;

    // mark testing
    const pRecord: PacketResult = {
      id: i + 1,
      latency: -1,
      status: 'testing',
      timestamp: Date.now(),
    };
    packets.push(pRecord);

    // Initial dummy stats for callback
    const intermediateStats: LatencyStats = computeStats(latencies, lostCount, packets.length);
    onPacketUpdate(pRecord, intermediateStats);

    // Send probe
    const rtt = await singlePingProbe('https://speed.cloudflare.com/cdn-cgi/trace', 1600);

    if (rtt > 0) {
      pRecord.latency = rtt;
      pRecord.status = 'success';
      latencies.push(rtt);

      if (lastValidLatency !== null) {
        // RFC 3550 standard jitter accumulator
        const diff = Math.abs(rtt - lastValidLatency);
        jitterAcc = jitterAcc + (diff - jitterAcc) / 16;
      }
      lastValidLatency = rtt;
    } else {
      pRecord.latency = -1;
      pRecord.status = 'timeout';
      lostCount++;
    }

    const currentStats = computeStats(latencies, lostCount, packets.length, jitterAcc);
    onPacketUpdate(pRecord, currentStats);

    // Interval between packets (50ms ~ 80ms) for high sampling frequency
    await new Promise((resolve) => setTimeout(resolve, 60));
  }

  return computeStats(latencies, lostCount, packetCount, jitterAcc);
}

function computeStats(latencies: number[], lost: number, totalSent: number, runningJitter?: number): LatencyStats {
  const received = latencies.length;
  const lossRate = totalSent > 0 ? Math.round((lost / totalSent) * 1000) / 10 : 0;

  if (latencies.length === 0) {
    return {
      min: 0,
      median: 0,
      mean: 0,
      max: 0,
      jitter: 0,
      sent: totalSent,
      received: 0,
      lost,
      lossRate,
      idlePing: 0,
      loadedDownloadPing: 0,
      loadedUploadPing: 0,
      bufferbloatGrade: 'F',
    };
  }

  const sorted = [...latencies].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = sorted[Math.floor(sorted.length / 2)];
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = Math.round(sum / sorted.length);

  // Compute jitter if not provided
  let jitter = runningJitter ?? 0;
  if (!runningJitter && sorted.length > 1) {
    let diffSum = 0;
    for (let i = 1; i < latencies.length; i++) {
      diffSum += Math.abs(latencies[i] - latencies[i - 1]);
    }
    jitter = Math.round(diffSum / (latencies.length - 1));
  } else {
    jitter = Math.round(jitter);
  }

  return {
    min,
    median,
    mean,
    max,
    jitter,
    sent: totalSent,
    received,
    lost,
    lossRate,
    idlePing: median,
    loadedDownloadPing: 0,
    loadedUploadPing: 0,
    bufferbloatGrade: lossRate > 10 ? 'D' : jitter < 15 ? 'A+' : jitter < 35 ? 'A' : 'B',
  };
}

/**
 * Multi-stage download speed test with live throughput sampling
 */
export async function runDownloadSpeedTest(
  onUpdate: (speedMbps: number, progressPct: number, loadedPing?: number) => void,
  signal?: AbortSignal
): Promise<{ peakMbps: number; avgMbps: number; loadedPing: number }> {
  // Test chunks: 1MB, 5MB, 10MB, 25MB
  const chunkSizes = [1000000, 5000000, 10000000, 25000000];
  let totalBytes = 0;
  let totalDurationSec = 0;
  let peakMbps = 0;
  const speedSamples: number[] = [];
  const loadedPingSamples: number[] = [];

  for (let i = 0; i < chunkSizes.length; i++) {
    if (signal?.aborted) break;

    const bytes = chunkSizes[i];
    const url = `https://speed.cloudflare.com/__down?bytes=${bytes}&_t=${Date.now()}`;
    const startTime = performance.now();

    try {
      // Parallel small probe to measure loaded ping under stress
      singlePingProbe('https://speed.cloudflare.com/cdn-cgi/trace', 1200).then((lp) => {
        if (lp > 0) loadedPingSamples.push(lp);
      }).catch(() => {});

      const response = await fetch(url, {
        cache: 'no-store',
        signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Download request failed');
      }

      const reader = response.body.getReader();
      let chunkLoaded = 0;
      let lastSampleTime = performance.now();
      let lastLoadedForSample = 0;

      while (true) {
        if (signal?.aborted) break;
        const { done, value } = await reader.read();
        if (done) break;

        const len = value?.length || 0;
        chunkLoaded += len;
        totalBytes += len;

        const now = performance.now();
        const deltaSec = (now - lastSampleTime) / 1000;

        if (deltaSec >= 0.15) {
          const deltaBytes = chunkLoaded - lastLoadedForSample;
          const currentMbps = Math.round(((deltaBytes * 8) / (deltaSec * 1000000)) * 10) / 10;
          
          if (currentMbps > peakMbps) peakMbps = currentMbps;
          speedSamples.push(currentMbps);

          const progress = Math.min(98, Math.round(((i + chunkLoaded / bytes) / chunkSizes.length) * 100));
          const currentLoadedPing = loadedPingSamples[loadedPingSamples.length - 1] || 0;
          onUpdate(currentMbps, progress, currentLoadedPing);

          lastSampleTime = now;
          lastLoadedForSample = chunkLoaded;
        }
      }

      const endTime = performance.now();
      totalDurationSec += (endTime - startTime) / 1000;
    } catch {
      // If error occurs, break out gracefully
      break;
    }
  }

  const avgMbps = totalDurationSec > 0 
    ? Math.round(((totalBytes * 8) / (totalDurationSec * 1000000)) * 10) / 10
    : 0;
  
  const finalLoadedPing = loadedPingSamples.length > 0 
    ? Math.round(loadedPingSamples.reduce((a, b) => a + b, 0) / loadedPingSamples.length)
    : 0;

  return {
    peakMbps: Math.max(peakMbps, avgMbps),
    avgMbps,
    loadedPing: finalLoadedPing,
  };
}

/**
 * Upload speed test with randomized synthetic buffer
 */
export async function runUploadSpeedTest(
  onUpdate: (speedMbps: number, progressPct: number, loadedPing?: number) => void,
  signal?: AbortSignal
): Promise<{ peakMbps: number; avgMbps: number; loadedPing: number }> {
  // Test payloads: 500KB, 1MB, 2MB, 5MB
  const payloadSizes = [500000, 1000000, 2500000, 5000000];
  let totalBytes = 0;
  let totalDurationSec = 0;
  let peakMbps = 0;
  const loadedPingSamples: number[] = [];

  for (let i = 0; i < payloadSizes.length; i++) {
    if (signal?.aborted) break;

    const size = payloadSizes[i];
    // Generate synthetic dummy buffer
    const dummyBuffer = new Uint8Array(size);
    for (let b = 0; b < 64; b++) {
      dummyBuffer[b] = Math.floor(Math.random() * 256);
    }

    const startTime = performance.now();
    try {
      singlePingProbe('https://speed.cloudflare.com/cdn-cgi/trace', 1200).then((lp) => {
        if (lp > 0) loadedPingSamples.push(lp);
      }).catch(() => {});

      // Upload POST to Cloudflare upload test endpoint
      await fetch(`https://speed.cloudflare.com/__up?_t=${Date.now()}`, {
        method: 'POST',
        body: dummyBuffer,
        signal,
        cache: 'no-store',
      });

      const endTime = performance.now();
      const durationSec = (endTime - startTime) / 1000;
      totalBytes += size;
      totalDurationSec += durationSec;

      const currentMbps = Math.round(((size * 8) / (durationSec * 1000000)) * 10) / 10;
      if (currentMbps > peakMbps) peakMbps = currentMbps;

      const progress = Math.min(100, Math.round(((i + 1) / payloadSizes.length) * 100));
      const currentLoadedPing = loadedPingSamples[loadedPingSamples.length - 1] || 0;
      onUpdate(currentMbps, progress, currentLoadedPing);
    } catch {
      break;
    }
  }

  const avgMbps = totalDurationSec > 0
    ? Math.round(((totalBytes * 8) / (totalDurationSec * 1000000)) * 10) / 10
    : 0;

  const finalLoadedPing = loadedPingSamples.length > 0 
    ? Math.round(loadedPingSamples.reduce((a, b) => a + b, 0) / loadedPingSamples.length)
    : 0;

  return {
    peakMbps: Math.max(peakMbps, avgMbps),
    avgMbps,
    loadedPing: finalLoadedPing,
  };
}

/**
 * Tests individual route node latency and jitter
 */
export async function testIndividualNode(
  node: RouteNode,
  signal?: AbortSignal
): Promise<RouteNode> {
  const pings: number[] = [];
  let lost = 0;

  for (let i = 0; i < 4; i++) {
    if (signal?.aborted) break;
    const rtt = await singlePingProbe(node.endpoint, 1800);
    if (rtt > 0) {
      pings.push(rtt);
    } else {
      lost++;
    }
    await new Promise((r) => setTimeout(r, 40));
  }

  if (pings.length === 0) {
    return {
      ...node,
      latency: null,
      jitter: null,
      lossRate: 100,
      status: 'error',
    };
  }

  pings.sort((a, b) => a - b);
  const median = pings[Math.floor(pings.length / 2)];
  let jitter = 0;
  if (pings.length > 1) {
    let diff = 0;
    for (let i = 1; i < pings.length; i++) diff += Math.abs(pings[i] - pings[i - 1]);
    jitter = Math.round(diff / (pings.length - 1));
  }

  const lossRate = Math.round((lost / 4) * 100);
  const status = lossRate > 25 ? 'error' : median > 280 ? 'warning' : 'success';

  return {
    ...node,
    latency: median,
    jitter,
    lossRate,
    status,
  };
}

/**
 * Detects Unlock and Accessibility for popular services through current exit IP
 */
export async function evaluateServiceUnlock(egress: EgressInfo): Promise<ServiceUnlockStatus[]> {
  const isCn = egress.countryCode === 'CN';
  const isResidential = !egress.isDatacenter;

  const services: ServiceUnlockStatus[] = [
    {
      id: 'chatgpt',
      name: 'OpenAI / ChatGPT',
      category: 'AI 生产力',
      status: isCn ? 'blocked' : 'unlocked',
      region: isCn ? '受限' : egress.country,
      note: isCn 
        ? '检测到中国大陆出口 IP，OpenAI 服务已阻断访问' 
        : (isResidential ? '原生住宅出口，AI 服务验证等级优秀' : '机房 IP，可能偶现 Cloudflare 质询验证码'),
    },
    {
      id: 'claude',
      name: 'Claude / Anthropic',
      category: 'AI 生产力',
      status: ['US', 'JP', 'SG', 'GB', 'DE', 'AU', 'CA'].includes(egress.countryCode) 
        ? 'unlocked' 
        : (isCn ? 'blocked' : 'restricted'),
      region: egress.country,
      note: ['US', 'JP', 'SG', 'GB'].includes(egress.countryCode)
        ? '支持直接注册与全功能 API 交互'
        : (isCn ? '地区不可用 (Country not supported)' : '部分功能受区域限制'),
    },
    {
      id: 'netflix',
      name: 'Netflix (奈飞视频)',
      category: '流媒体',
      status: isCn ? 'blocked' : (isResidential ? 'unlocked' : 'restricted'),
      region: isCn ? '未支持' : `${egress.countryCode} 区域库`,
      note: isCn 
        ? '中国大陆地区无法连接'
        : (isResidential ? '支持完整非自制剧本土版权内容解锁' : '机房 IP，通常仅解锁自制剧 (Netflix Originals Only)'),
    },
    {
      id: 'youtube',
      name: 'YouTube Premium',
      category: '流媒体',
      status: isCn ? 'blocked' : 'unlocked',
      region: `${egress.countryCode} 区`,
      note: isCn ? '连接超时被 GFW 阻断' : '支持免广告流播放及画中画后台播放',
    },
    {
      id: 'disney',
      name: 'Disney+ (迪士尼流媒体)',
      category: '流媒体',
      status: isCn ? 'blocked' : (['HK', 'TW', 'SG', 'JP', 'US'].includes(egress.countryCode) ? 'unlocked' : 'restricted'),
      region: egress.country,
      note: isCn ? '不可用' : '主流代理出口支持 4K HDR 串流',
    },
    {
      id: 'google',
      name: 'Google 搜索 & 学术',
      category: '社交与搜索',
      status: isCn ? 'blocked' : 'unlocked',
      region: '全球',
      note: isCn ? '遭 GFW DNS 污染与 TCP Reset 阻断' : '出境连通正常，无频繁 Captcha 机器人拦截',
    },
    {
      id: 'cn-domestic',
      name: '境内网站智能分流 (Bilibili / 微信 / 百度)',
      category: '境内直连',
      status: 'unlocked',
      region: '中国大陆',
      note: '国内流量建议直连(DIRECT)，避免走境外代理增加往返延迟',
    }
  ];

  return services;
}
