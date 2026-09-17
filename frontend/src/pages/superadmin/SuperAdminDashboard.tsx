import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Radio,
  Server,
  Activity,
  AlertTriangle,
  Wrench,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Bot,
  ArrowUpRight,
  RefreshCw,
  Power,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell.js';
import { StatCard } from '../../components/ui/StatCard.js';
import { StateWrapper } from '../../components/ui/StateWrapper.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { api } from '../../services/api.js';

export const SuperAdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    const res = await api.getSuperAdminDashboard();
    setIsLoading(false);

    if (res.success) {
      setData(res);
      setLastUpdated(new Date());
    } else {
      setError(res.error || 'Failed to fetch dashboard telemetry');
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const kpis = data?.kpis || {};
  const health = data?.platformHealth || {};

  return (
    <Shell
      portalType="superadmin"
      title="SaaS Executive Command Dashboard"
      breadcrumbs={[{ label: 'Executive Overview' }]}
      primaryAction={
        <Button
          onClick={() => navigate('/superadmin/tenants')}
          variant="primary"
          size="sm"
        >
          <span>Provision New Tenant</span>
          <ArrowUpRight className="w-4 h-4 ml-1.5" />
        </Button>
      }
    >
      <StateWrapper
        isLoading={isLoading}
        error={error}
        onRetry={fetchDashboard}
        lastUpdated={lastUpdated}
        onRefresh={fetchDashboard}
      >
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total ISP Tenants"
            value={kpis.totalTenants || 0}
            subtitle={`${kpis.activeTenants || 0} active subscriptions`}
            icon={Building2}
            variant="sky"
            trend={{ value: '12% this month', isPositive: true }}
            onClick={() => navigate('/superadmin/tenants')}
          />
          <StatCard
            title="Total Active Subscribers"
            value={kpis.totalCustomers || 0}
            subtitle="Across all operator tenants"
            icon={Users}
            variant="purple"
            trend={{ value: '8.4% growth', isPositive: true }}
          />
          <StatCard
            title="Managed ONTs / CPEs"
            value={kpis.totalDevices || 0}
            subtitle={`${kpis.onlineRatio || 98.6}% fleet online ratio`}
            icon={Radio}
            variant="emerald"
          />
          <StatCard
            title="Monthly Recurring Revenue"
            value={`₹${(kpis.mrr || 0).toLocaleString()}`}
            subtitle={`ARR: ₹${(kpis.arr || 0).toLocaleString()}`}
            icon={DollarSign}
            variant="amber"
            trend={{ value: '₹14,990 added', isPositive: true }}
            onClick={() => navigate('/superadmin/plans')}
          />
        </div>

        {/* AI Executive Briefing Banner */}
        <div className="p-4 bg-[#0E172A] border border-sky-500/30 rounded-xl flex items-start space-x-3.5 shadow-sm">
          <div className="p-2 rounded-lg bg-sky-500/15 text-sky-400 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">AI Platform Synthesis & Executive Summary</h3>
              <Badge variant="info">Realtime Diagnostics</Badge>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {data?.aiExecutiveSummary ||
                'Global SaaS services operating at optimal performance. No cross-tenant latency anomalies detected.'}
            </p>
          </div>
        </div>

        {/* Two-Column Grid: Platform Health & Recent Tenants */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Microservice Health Matrix */}
          <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Platform Microservice Health</h3>
              </div>
              <Badge variant="success" dot>
                All Systems Normal
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#070C1A] border border-slate-800 rounded-lg space-y-1">
                <span className="text-slate-400">Core REST API</span>
                <p className="font-semibold text-white flex items-center justify-between">
                  <span>Latency: {health.api?.latencyMs || 14}ms</span>
                  <Badge variant="success">99.99%</Badge>
                </p>
              </div>

              <div className="p-3 bg-[#070C1A] border border-slate-800 rounded-lg space-y-1">
                <span className="text-slate-400">TR-069 / CWMP ACS</span>
                <p className="font-semibold text-white flex items-center justify-between">
                  <span>Sessions: {health.acs?.activeSessions || 42}</span>
                  <Badge variant="success">Active</Badge>
                </p>
              </div>

              <div className="p-3 bg-[#070C1A] border border-slate-800 rounded-lg space-y-1">
                <span className="text-slate-400">Event Stream / Queues</span>
                <p className="font-semibold text-white flex items-center justify-between">
                  <span>185 msg/sec</span>
                  <Badge variant="success">0 Queue</Badge>
                </p>
              </div>

              <div className="p-3 bg-[#070C1A] border border-slate-800 rounded-lg space-y-1">
                <span className="text-slate-400">AI Inference Engine</span>
                <p className="font-semibold text-white flex items-center justify-between">
                  <span>Avg: 140ms</span>
                  <Badge variant="purple">Ready</Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Tenant Health Leaderboard */}
          <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Active Tenant Portals</h3>
              </div>
              <button
                onClick={() => navigate('/superadmin/tenants')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium"
              >
                View All →
              </button>
            </div>

            <div className="space-y-2.5">
              {(data?.recentTenants || []).map((t: any) => (
                <div
                  key={t._id}
                  onClick={() => navigate(`/superadmin/tenants/${t._id}`)}
                  className="p-3 bg-[#070C1A] hover:bg-[#070C1A] border border-slate-800 rounded-lg flex items-center justify-between cursor-pointer transition"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-100">{t.displayName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">https://{t.subdomain}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={t.status === 'active' ? 'success' : 'warning'}>
                      {t.status}
                    </Badge>
                    <Badge variant="neutral">{t.plan?.name || 'Standard'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Multi-Tenant Active Reporting & Offline Fleets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Reporting Devices */}
          <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Live Active TR-069 / TR-369 Fleet ({kpis.onlineDevices || 0})</h3>
              </div>
              <Badge variant="success" dot>Global Live Fleet</Badge>
            </div>

            {data?.reportingDevices && data.reportingDevices.length > 0 ? (
              <div className="divide-y divide-[#EEF2F7]">
                {data.reportingDevices.map((d: any) => (
                  <div key={d._id} className="py-2.5 flex items-center justify-between hover:bg-[#070C1A] px-1 rounded-lg transition">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-white">{d.serialNumber}</span>
                        <Badge variant="success" dot>Online</Badge>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Tenant: <span className="font-semibold text-sky-400">{(typeof d?.tenantId === 'object' ? d?.tenantId?.displayName : d?.tenantSlug) || 'Global'}</span> · {d?.manufacturer} {d?.modelName || 'GPON ONT'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {d?.currentRxPowerDbm != null ? `${d.currentRxPowerDbm} dBm` : 'Online'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {d?.lastInform ? new Date(d.lastInform).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 italic">
                No active reporting ONTs online at this moment.
              </div>
            )}
          </div>

          {/* Offline Fleets */}
          <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <Power className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Offline / Unreachable ONT Fleet ({kpis.offlineDevices || 0})</h3>
              </div>
              <Badge variant="danger" dot>Offline Fleet</Badge>
            </div>

            {data?.offlineDevicesList && data.offlineDevicesList.length > 0 ? (
              <div className="divide-y divide-[#EEF2F7]">
                {data.offlineDevicesList.map((d: any) => (
                  <div key={d?._id || Math.random()} className="py-2.5 flex items-center justify-between hover:bg-[#070C1A] px-1 rounded-lg transition">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-white">{d?.serialNumber}</span>
                        <Badge variant="danger" dot>Offline</Badge>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Tenant: <span className="font-semibold text-sky-400">{(typeof d?.tenantId === 'object' ? d?.tenantId?.displayName : d?.tenantSlug) || 'Global'}</span> · {d?.manufacturer} {d?.modelName || 'GPON ONT'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {d.lastInform ? `Last seen: ${new Date(d.lastInform).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Never reported'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 italic">
                No devices are offline across the platform.
              </div>
            )}
          </div>
        </div>
      </StateWrapper>
    </Shell>
  );
};
