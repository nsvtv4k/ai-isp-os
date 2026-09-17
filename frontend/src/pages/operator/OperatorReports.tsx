import React, { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, Users, Radio, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Shell } from '../../components/layout/Shell.js';
import { StateWrapper } from '../../components/ui/StateWrapper.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const OperatorReports: React.FC = () => {
  const { tenant } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    const res = await api.getOperatorReports();
    setIsLoading(false);
    if (res.success) {
      setData(res);
    } else {
      setError(res.error || 'Failed to load operator analytics report');
    }
  };

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const exportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value,Status\n"
      + `Active Subscribers,${data?.metrics?.activeSubscribers || 0},Real Count\n`
      + `Total ONT Fleet,${data?.metrics?.totalOnts || 0},Fleet Total\n`
      + `Online ONT Fleet,${data?.metrics?.onlineOnts || 0},${data?.metrics?.onlineRatio || 0}%\n`
      + `Optical Margin Alarms,${data?.metrics?.atRiskOnts || 0},Rx < -27 dBm\n`
      + `SLA Resolved Incidents,${data?.reports?.support?.resolvedIncidents || 0},Real Operations\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `noc_performance_report_${tenant?.slug || 'tenant'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalOnts = data?.metrics?.totalOnts || 0;
  const onlineOnts = data?.metrics?.onlineOnts || 0;
  const onlineRatio = data?.metrics?.onlineRatio ?? (totalOnts > 0 ? ((onlineOnts / totalOnts) * 100).toFixed(1) : 100);
  const activeSubs = data?.metrics?.activeSubscribers || 0;
  const atRisk = data?.metrics?.atRiskOnts || 0;
  const resolvedIncidents = data?.reports?.support?.resolvedIncidents || 0;
  const totalIncidents = (data?.reports?.support?.resolvedIncidents || 0) + (data?.reports?.support?.activeIncidents || 0);
  const slaCompliance = totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 100;

  return (
    <Shell
      portalType="operator"
      title="NOC Reports & Telemetry Analytics"
      breadcrumbs={[{ label: 'Reports & Analytics' }]}
      primaryAction={
        <div className="flex items-center space-x-2">
          <Button onClick={exportCsv} variant="primary" size="sm" className="font-bold">
            <Download className="w-4 h-4 mr-1.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      }
    >
      <StateWrapper isLoading={isLoading} error={error} onRetry={fetchReports}>
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0E172A] border border-slate-700/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Active Subscribers</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-bold text-white mt-2 font-mono">
                {activeSubs}
              </p>
              <div className="flex items-center space-x-1.5 mt-2 text-[11px] text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Real-Time Subscriber DB</span>
              </div>
            </div>

            <div className="bg-[#0E172A] border border-slate-700/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Fleet Availability</span>
                <Radio className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white mt-2 font-mono">{onlineRatio}%</p>
              <div className="flex items-center space-x-1.5 mt-2 text-[11px] text-slate-400 font-mono">
                <span>{onlineOnts} / {totalOnts} ONTs Online</span>
              </div>
            </div>

            <div className="bg-[#0E172A] border border-slate-700/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>SLA Resolution Rate</span>
                <ShieldCheck className="w-4 h-4 text-[#6D28D9]" />
              </div>
              <p className="text-2xl font-bold text-white mt-2 font-mono">{slaCompliance}%</p>
              <div className="flex items-center space-x-1.5 mt-2 text-[11px] text-emerald-400 font-medium">
                <span>{resolvedIncidents} Resolved / {totalIncidents} Total</span>
              </div>
            </div>

            <div className="bg-[#0E172A] border border-slate-700/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Optical Margin Drift</span>
                <AlertTriangle className="w-4 h-4 text-[#B45309]" />
              </div>
              <p className={`text-2xl font-bold mt-2 font-mono ${atRisk > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {atRisk} At-Risk
              </p>
              <div className="flex items-center space-x-1.5 mt-2 text-[11px] text-slate-400">
                <span>Rx Power &lt; -27.0 dBm threshold</span>
              </div>
            </div>
          </div>

          {/* Operational Quality Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0E172A] border border-slate-700/80 rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Optical Power Health Distribution</span>
                <Badge variant="success">TR-069 Real Ingest</Badge>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1 font-semibold">
                    <span>Healthy Margin (&gt; -24.5 dBm)</span>
                    <span className="font-bold text-emerald-400 font-mono">{Math.max(0, totalOnts - atRisk)} ONTs</span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: totalOnts > 0 ? `${((Math.max(0, totalOnts - atRisk) / totalOnts) * 100)}%` : '100%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1 font-semibold">
                    <span>Critical Loss (&lt; -27.0 dBm)</span>
                    <span className="font-bold text-rose-400 font-mono">{atRisk} ONTs</span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: totalOnts > 0 ? `${((atRisk / totalOnts) * 100)}%` : '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0E172A] border border-slate-700/80 rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-white">Real-Time Incident & Field Statistics</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#060913] border border-slate-700/80 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Total Logged Incidents</p>
                    <p className="text-[11px] text-slate-400">Platform automated alarms and fiber cuts</p>
                  </div>
                  <Badge variant="neutral">{totalIncidents} Incidents</Badge>
                </div>

                <div className="p-3 bg-[#060913] border border-slate-700/80 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Open Support Tickets</p>
                    <p className="text-[11px] text-slate-400">Active customer tickets pending technician</p>
                  </div>
                  <Badge variant={data?.metrics?.openTickets > 0 ? 'warning' : 'success'}>
                    {data?.metrics?.openTickets || 0} Open
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </StateWrapper>
    </Shell>
  );
};
