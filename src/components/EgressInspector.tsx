import React from 'react';
import { Globe, Shield, MapPin, Server, Radio, ShieldCheck, AlertCircle, RefreshCw, Terminal, Check } from 'lucide-react';
import { EgressInfo } from '../types';

interface EgressInspectorProps {
  egress: EgressInfo | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const EgressInspector: React.FC<EgressInspectorProps> = ({
  egress,
  isLoading,
  onRefresh,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyIp = () => {
    if (egress?.ip) {
      navigator.clipboard.writeText(egress.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 md:p-7 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-neutral-800/60">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            出口节点与公网路由信息 (Egress & Routing Telemetry)
          </h2>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800/80 border border-neutral-700/60 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap active:scale-[0.98]"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>刷新出口信息</span>
        </button>
      </div>

      {/* Main Egress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
        {/* Outbound Public IP */}
        <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Server className="h-3.5 w-3.5 text-cyan-400" />
              当前公网出口 IP
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
              {egress?.ipVersion || 'IPv4'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 my-1">
            <span className="font-mono text-lg sm:text-xl font-bold text-white tracking-tight break-all">
              {egress?.ip || (isLoading ? '正在解析...' : '未知')}
            </span>
            {egress?.ip && (
              <button
                onClick={copyIp}
                title="复制出口 IP"
                className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Terminal className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>

          <div className="text-[11px] text-neutral-500 font-mono mt-1">
            {egress?.httpVersion} · {egress?.tlsVersion}
          </div>
        </div>

        {/* ASN & Network Operator */}
        <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Radio className="h-3.5 w-3.5 text-blue-400" />
              自治系统 (ASN) & 运营商
            </span>
          </div>

          <div className="my-1">
            <span className="font-mono text-sm font-bold text-cyan-300 block">
              {egress?.asn || '--'}
            </span>
            <span className="text-xs text-neutral-200 font-medium truncate block mt-0.5" title={egress?.org}>
              {egress?.org || '--'}
            </span>
          </div>

          <div className="text-[11px] text-neutral-500 truncate" title={egress?.isp}>
            ISP: {egress?.isp || '--'}
          </div>
        </div>

        {/* Geolocation & Exit Location */}
        <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              出口物理归属地
            </span>
            <span className="text-base leading-none">{egress?.flag || '🌐'}</span>
          </div>

          <div className="my-1">
            <span className="text-base font-bold text-white block">
              {egress?.country || '--'}
            </span>
            <span className="text-xs text-neutral-300 block mt-0.5">
              {egress?.city} {egress?.region ? `· ${egress.region}` : ''}
            </span>
          </div>

          <div className="text-[11px] text-neutral-500 font-mono">
            国家代码: {egress?.countryCode || '--'}
          </div>
        </div>

        {/* Cloudflare Colo / Anycast Edge */}
        <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Globe className="h-3.5 w-3.5 text-amber-400" />
              Cloudflare Anycast 接入点
            </span>
          </div>

          <div className="my-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-amber-300">
                {egress?.colo || '--'}
              </span>
              <span className="text-xs text-neutral-200">
                {egress?.coloCity}
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 block mt-0.5">
              全球骨干网就近接入点
            </span>
          </div>

          <div className="text-[11px] text-neutral-500">
            IATA 航空港代码映射
          </div>
        </div>
      </div>

      {/* Security & DNS Leak Diagnostics Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
        {/* Node IP Type: Residential vs Datacenter */}
        <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/70 flex items-start gap-3">
          <Shield className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-neutral-200 block">IP 属性分析</span>
            <p className="text-neutral-400 mt-0.5 leading-relaxed">
              {egress?.isDatacenter ? (
                <span>
                  数据中心 / 机房云服务器 (Datacenter VPS)。常见于自建节点或机场托管服务器，访问部分银行或特定流媒体可能要求人机验证。
                </span>
              ) : (
                <span>
                  原生住宅 IP / 商业宽带 (Residential ISP)。真实家庭网络出口，风控等级极低，可畅通访问全类型境外服务。
                </span>
              )}
            </p>
          </div>
        </div>

        {/* DNS Leak Check */}
        <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/70 flex items-start gap-3">
          <ShieldCheck className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-neutral-200 block">DNS 泄漏与防污染检测</span>
            <p className="text-neutral-400 mt-0.5 leading-relaxed">
              当前出境解析器: <span className="font-mono text-neutral-300">{egress?.dnsServer}</span>。
              DNS 查询与出口流量处于同一出境加密隧道中，未泄漏至大陆本地运营商 DNS，有效防止域名劫持与 SNI 污染。
            </p>
          </div>
        </div>

        {/* Split Tunneling Advice */}
        <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/70 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-neutral-200 block">分流规则提示 (Rule-based)</span>
            <p className="text-neutral-400 mt-0.5 leading-relaxed">
              如果访问境内网站（如微信、B站、淘宝）变慢，请检查客户端分流设置，确保国内域名走 <span className="text-cyan-300 font-mono">DIRECT</span> 直连，避免国内流量绕行境外节点。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
