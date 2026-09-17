import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, Smartphone, Activity, HelpCircle, Bot, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { MobileShell } from '../../components/layout/MobileShell.js';
import { StateWrapper } from '../../components/ui/StateWrapper.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { api } from '../../services/api.js';

export const CustomerHome: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchHome = async () => {
    setIsLoading(true);
    setError(null);
    const res = await api.getCustomerHome();
    setIsLoading(false);
    if (res.success) {
      setData(res);
    } else {
      setError(res.error || 'Failed to load subscriber portal');
    }
  };

  useEffect(() => {
    fetchHome();
  }, []);

  const conn = data?.connection || {};
  const cust = data?.customer || {};

  return (
    <MobileShell portalType="customer" title="Apex Fiber Home">
      <StateWrapper isLoading={isLoading} error={error} onRetry={fetchHome}>
        <div className="space-y-4">
          {/* Main Status Hero Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-400">Welcome,</span>
                <h2 className="text-lg font-bold text-white">{cust.name || 'Arjun Sharma'}</h2>
                <p className="text-[11px] font-mono text-sky-400 mt-0.5">{cust.accountNumber}</p>
              </div>
              <Badge variant={conn.status === 'online' ? 'success' : 'danger'} dot>
                {conn.status === 'online' ? 'Connected' : 'Offline'}
              </Badge>
            </div>

            <div className="p-4 bg-[#060913] border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{cust.plan?.name || '100 Mbps Unlimited'}</p>
                  <p className="text-[11px] text-slate-400">Optical Signal: {conn.opticalPowerDbm || -21.4} dBm (Optimal)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <button
                onClick={() => navigate('/customer/wifi')}
                className="p-3 bg-[#060913] hover:bg-[#F1F5F9] border border-slate-800 rounded-xl text-left transition"
              >
                <Wifi className="w-4 h-4 text-sky-400 mb-1" />
                <p className="font-semibold text-slate-100">Wi-Fi Settings</p>
                <span className="text-[10px] text-slate-400">Change password</span>
              </button>

              <button
                onClick={() => navigate('/customer/devices')}
                className="p-3 bg-[#060913] hover:bg-[#F1F5F9] border border-slate-800 rounded-xl text-left transition"
              >
                <Smartphone className="w-4 h-4 text-[#6D28D9] mb-1" />
                <p className="font-semibold text-slate-100">Connected Devices</p>
                <span className="text-[10px] text-slate-400">{data?.connectedDevicesCount || 3} active clients</span>
              </button>
            </div>
          </div>

          {/* AI Self-Troubleshooting Banner */}
          <div
            onClick={() => navigate('/customer/support')}
            className="p-4 bg-[#0E172A] hover:bg-[#0E172A] border border-sky-500/30 rounded-2xl flex items-center justify-between cursor-pointer transition shadow-md"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">AI Self-Troubleshooting Assistant</h3>
                <p className="text-[11px] text-slate-400">Diagnose slow speed or connection drops instantly</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </div>
        </div>
      </StateWrapper>
    </MobileShell>
  );
};
