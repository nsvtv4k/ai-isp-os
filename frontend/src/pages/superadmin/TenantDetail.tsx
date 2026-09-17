import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Shield, Users, Radio, Wrench, AlertTriangle, CheckCircle2, ArrowLeft, ExternalLink, Power } from 'lucide-react';
import { Shell } from '../../components/layout/Shell.js';
import { StateWrapper } from '../../components/ui/StateWrapper.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const TenantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { impersonateTenant } = useAuth();

  const fetchDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    const res = await api.getTenantDetail(id);
    setIsLoading(false);
    if (res.success) {
      setData(res);
    } else {
      setError(res.error || 'Failed to fetch tenant detail');
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const toggleStatus = async () => {
    if (!id || !data?.tenant) return;
    const nextStatus = data.tenant.status === 'active' ? 'suspended' : 'active';
    const res = await api.updateTenantStatus(id, nextStatus);
    if (res.success) {
      fetchDetail();
    } else {
      alert(res.error || 'Failed to update status');
    }
  };

  const tenant = data?.tenant;
  const usage = data?.usage || {};

  return (
    <Shell
      portalType="superadmin"
      title={tenant ? `${tenant.displayName} Control Profile` : 'Tenant Detail'}
      breadcrumbs={[{ label: 'Tenants', href: '/superadmin/tenants' }, { label: tenant?.displayName || 'Detail' }]}
      primaryAction={
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (tenant) {
                impersonateTenant(tenant);
                navigate('/operator/dashboard');
              }
            }}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1" />
            <span>Impersonate NOC</span>
          </Button>
          <Button
            variant={tenant?.status === 'active' ? 'danger' : 'success'}
            size="sm"
            onClick={toggleStatus}
          >
            <Power className="w-3.5 h-3.5 mr-1" />
            <span>{tenant?.status === 'active' ? 'Suspend Tenant' : 'Activate Tenant'}</span>
          </Button>
        </div>
      }
    >
      <StateWrapper isLoading={isLoading} error={error} onRetry={fetchDetail}>
        {tenant && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center font-bold text-sky-400 text-xl">
                  {tenant.displayName?.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-white">{tenant.displayName}</h2>
                    <Badge variant={tenant.status === 'active' ? 'success' : 'warning'} dot>
                      {tenant.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-1">https://{tenant.subdomain}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Plan Tier</span>
                  <p className="font-semibold text-slate-100">{tenant.plan?.name || 'Enterprise'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Monthly Billing</span>
                  <p className="font-semibold text-slate-100">₹{(tenant.plan?.monthlyFee || 4999).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-400">Owner Contact</span>
                  <p className="font-semibold text-slate-100">{tenant.owner?.email}</p>
                </div>
              </div>
            </div>

            {/* Plan Usage Bars */}
            <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Subscription Quotas & Fleet Capacity</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customers Bar */}
                <div className="p-4 bg-[#060913] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Subscribers</span>
                    <span className="font-semibold text-slate-100">
                      {usage.customers?.current || 0} / {usage.customers?.limit || 5000}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          ((usage.customers?.current || 0) / (usage.customers?.limit || 5000)) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Devices Bar */}
                <div className="p-4 bg-[#060913] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">ONT Devices</span>
                    <span className="font-semibold text-slate-100">
                      {usage.devices?.current || 0} / {usage.devices?.limit || 5000}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          ((usage.devices?.current || 0) / (usage.devices?.limit || 5000)) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Technicians Bar */}
                <div className="p-4 bg-[#060913] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Field Technicians</span>
                    <span className="font-semibold text-slate-100">
                      {usage.technicians?.current || 0} / {usage.technicians?.limit || 20}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          ((usage.technicians?.current || 0) / (usage.technicians?.limit || 20)) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* CWMP ACS Provisioning Config */}
            <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>TR-069 CWMP & ACS Gateway Endpoint</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Configure this direct URL on customer ONT / CPE hardware for cloud management</p>
                </div>
                <Badge variant="success" dot>Live Gateway</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 bg-[#060913] border border-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[11px] mb-1 font-sans font-bold">Direct TR-069 ACS URL (Customer ONT Config)</span>
                  <span className="text-emerald-400 font-bold select-all text-sm">{`http://${window.location.hostname || '31.42.125.25'}/tr069/${tenant.slug || 'rudra'}`}</span>
                </div>
                <div className="p-3.5 bg-[#060913] border border-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[11px] mb-1 font-sans font-bold">Operator Key (Auth Token)</span>
                  <span className="text-sky-400 font-bold select-all text-sm">{tenant.operatorKey}</span>
                </div>
              </div>
            </div>

            {/* Audit Trail for this Tenant */}
            <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white">Recent Security & Governance Audits</h3>
              <div className="space-y-2 text-xs">
                {(data?.recentAuditLogs || []).map((log: any) => (
                  <div
                    key={log._id}
                    className="p-3 bg-[#060913] border border-slate-800 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono text-sky-400">{log.action}</span>
                      <p className="text-slate-400 mt-0.5">By {log.actorEmail}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={log.result === 'SUCCESS' ? 'success' : 'danger'}>{log.result}</Badge>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </StateWrapper>
    </Shell>
  );
};
