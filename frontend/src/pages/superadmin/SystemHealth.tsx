import React, { useEffect, useState } from 'react';
import { Activity, Server, Database, Radio, Bot, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Shell } from '../../components/layout/Shell.js';
import { StateWrapper } from '../../components/ui/StateWrapper.js';
import { Badge } from '../../components/ui/Badge.js';
import { api } from '../../services/api.js';

export const SystemHealth: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealth = async () => {
    setIsLoading(true);
    const res = await api.getSuperAdminDashboard();
    setIsLoading(false);
    if (res.success) setData(res);
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const health = data?.platformHealth || {};

  return (
    <Shell portalType="superadmin" title="Platform Health & Microservices Telemetry" breadcrumbs={[{ label: 'System Health' }]}>
      <StateWrapper isLoading={isLoading}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-[#0E172A] border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                  <Server className="w-4 h-4 text-sky-400" />
                  <span>REST API Gateway</span>
                </div>
                <Badge variant="success" dot>Healthy</Badge>
              </div>
              <p className="text-2xl font-bold text-white">{health.api?.latencyMs || 14} ms</p>
              <p className="text-xs text-slate-400">Uptime: {health.api?.uptime || '99.99%'}</p>
            </div>

            <div className="p-5 bg-[#0E172A] border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>TR-069 / ACS Engine</span>
                </div>
                <Badge variant="success" dot>Healthy</Badge>
              </div>
              <p className="text-2xl font-bold text-white">{health.acs?.activeSessions || 42}</p>
              <p className="text-xs text-slate-400">Active CPE CWMP Sessions</p>
            </div>

            <div className="p-5 bg-[#0E172A] border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                  <Bot className="w-4 h-4 text-[#6D28D9]" />
                  <span>AI Inference Pipeline</span>
                </div>
                <Badge variant="purple" dot>Online</Badge>
              </div>
              <p className="text-2xl font-bold text-white">{health.aiEngine?.avgInferenceMs || 140} ms</p>
              <p className="text-xs text-slate-400">Average Diagnostic Latency</p>
            </div>
          </div>
        </div>
      </StateWrapper>
    </Shell>
  );
};
