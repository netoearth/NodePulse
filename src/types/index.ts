export interface EgressInfo {
  ip: string;
  ipVersion: 'IPv4' | 'IPv6';
  city: string;
  region: string;
  country: string;
  countryCode: string;
  flag: string;
  asn: string;
  org: string;
  isp: string;
  colo: string;
  coloCity: string;
  httpVersion?: string;
  tlsVersion?: string;
  isDatacenter: boolean;
  isProxyOrVpn: boolean;
  dnsServer?: string;
  dnsLocation?: string;
  dnsMatchStatus: 'match' | 'leak' | 'checking' | 'unknown';
}

export interface PacketResult {
  id: number;
  latency: number; // in ms, -1 if lost/timeout
  status: 'pending' | 'testing' | 'success' | 'timeout';
  timestamp: number;
}

export interface LatencyStats {
  min: number;
  median: number;
  mean: number;
  max: number;
  jitter: number;
  sent: number;
  received: number;
  lost: number;
  lossRate: number; // 0 to 100
  idlePing: number;
  loadedDownloadPing: number;
  loadedUploadPing: number;
  bufferbloatGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface SpeedDataPoint {
  time: number; // seconds from start
  speed: number; // Mbps
  stage: 'download' | 'upload';
}

export interface RouteNode {
  id: string;
  name: string;
  region: string;
  city: string;
  countryCode: string;
  flag: string;
  endpoint: string;
  provider: string;
  coloCode?: string;
  latency: number | null;
  jitter: number | null;
  lossRate: number | null;
  status: 'idle' | 'testing' | 'success' | 'warning' | 'error';
  isDirectTarget?: boolean;
}

export interface ServiceUnlockStatus {
  id: string;
  name: string;
  category: 'AI 生产力' | '流媒体' | '社交与搜索' | '境内直连';
  status: 'checking' | 'unlocked' | 'restricted' | 'blocked' | 'unknown';
  region?: string;
  note: string;
  checkUrl?: string;
}

export type DiagnosticMode = 'full' | 'quick-ping' | 'routes' | 'unlock';
