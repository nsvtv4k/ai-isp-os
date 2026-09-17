import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Server,
  Radio,
  MapPin,
  AlertTriangle,
  Ticket,
  Wrench,
  BarChart3,
  Bot,
  Settings,
  Bell,
  LogOut,
  Building2,
  Shield,
  Activity,
  ChevronRight,
  Menu,
  X,
  CheckSquare,
  Package,
  Zap,
  Eye,
  ArrowLeft,
  Sparkles,
  CalendarClock,
  CreditCard,
  TrendingUp,
  Layers,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../ui/Button.js';

export interface ShellProps {
  children: React.ReactNode;
  portalType: 'superadmin' | 'operator' | 'customer' | 'technician';
  title: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  primaryAction?: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  children,
  portalType,
  title,
  breadcrumbs = [],
  primaryAction,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, tenant, isImpersonating, exitImpersonation, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const superAdminNav = [
    { label: 'Executive Dashboard', path: '/superadmin/dashboard', icon: LayoutDashboard },
    { label: 'Pending Operator Mapping', path: '/superadmin/pending-mappings', icon: Radio },
    { label: 'Tenant Management', path: '/superadmin/tenants', icon: Building2 },
    { label: 'Users & Global Roles', path: '/superadmin/users', icon: Users },
    { label: 'Plans & Revenue', path: '/superadmin/plans', icon: BarChart3 },
    { label: 'System Health & Queues', path: '/superadmin/health', icon: Activity },
    { label: 'Global Incidents', path: '/superadmin/incidents', icon: AlertTriangle },
    { label: 'Audit Log Explorer', path: '/superadmin/audit', icon: Shield },
    { label: 'Platform Settings', path: '/superadmin/settings', icon: Settings },
  ];

  const operatorNav = [
    { label: 'NOC Dashboard', path: '/operator/dashboard', icon: LayoutDashboard },
    { label: 'Customer Directory', path: '/operator/customers', icon: Users },
    { label: 'ONT / CPE Fleet', path: '/operator/devices', icon: Radio },
    { label: 'Pending Map ONTs', path: '/operator/pending-mappings', icon: Sparkles },
    { label: 'OLT & PON Ports', path: '/operator/network', icon: Server },
    { label: 'Fiber GIS Map', path: '/operator/gis', icon: MapPin },
    { label: 'Plan & Expiry Hub', path: '/operator/plans', icon: CalendarClock },
    { label: 'Payment Gateways', path: '/operator/payments/gateways', icon: CreditCard },
    { label: 'Reconciliation', path: '/operator/payments/reconciliation', icon: CreditCard },
    { label: 'WhatsApp Live Chat', path: '/operator/whatsapp-chat', icon: MessageSquare },
    { label: 'Warehouse Spares', path: '/operator/inventory/warehouse', icon: Layers },
    { label: 'Approvals Gate', path: '/operator/approvals', icon: CheckSquare },
    { label: 'Automation Rules', path: '/operator/automation', icon: Zap },
    { label: 'Alerts & Incidents', path: '/operator/incidents', icon: AlertTriangle },
    { label: 'Support Tickets', path: '/operator/tickets', icon: Ticket },
    { label: 'Field Technicians', path: '/operator/technicians', icon: Wrench },
    { label: 'AI Command Center', path: '/operator/ai', icon: Bot },
    { label: 'Executive Analytics', path: '/operator/analytics', icon: TrendingUp },
    { label: 'Operator Settings', path: '/operator/settings', icon: Settings },
  ];

  const customerNav = [
    { label: 'My Fiber Home', path: '/customer/home', icon: LayoutDashboard },
    { label: 'My Billing & Invoices', path: '/customer/billing', icon: CreditCard },
    { label: 'Wi-Fi Settings', path: '/customer/wifi', icon: Radio },
    { label: 'Connected Devices', path: '/customer/devices', icon: Users },
    { label: 'Helpdesk & Tickets', path: '/customer/support', icon: Ticket },
  ];

  const navItems = portalType === 'superadmin' ? superAdminNav : portalType === 'customer' ? customerNav : operatorNav;

  const handleLogout = () => {
    logout();
    navigate(portalType === 'superadmin' ? '/superadmin/login' : portalType === 'customer' ? '/customer/login' : '/operator/login');
  };

  const handleExitImpersonation = () => {
    exitImpersonation();
    navigate('/superadmin/tenants');
  };

  return (
    <div className="flex flex-col h-screen bg-[#070A12] text-slate-100 overflow-hidden font-sans">
      {/* Super Admin Active Impersonation Top Banner */}
      {isImpersonating && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-xs z-50 shrink-0 border-b border-amber-600">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-white animate-pulse" />
            <span>
              <strong>Super Admin Impersonation Active:</strong> Viewing tenant{' '}
              <span className="font-bold underline">{tenant?.displayName || 'Tenant'}</span> (Slug:{' '}
              <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-white">{tenant?.slug}</code>). All operations are executed within this tenant scope.
            </span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white text-slate-900 hover:bg-slate-50 font-bold text-xs py-1 px-3 shadow-xs flex items-center space-x-1 border-0"
            onClick={handleExitImpersonation}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Exit Impersonation</span>
          </Button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - White Enterprise */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0B0F19] border-r border-slate-800/90 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isImpersonating ? 'top-[37px]' : ''}`}
        >
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-[#0B0F19]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-500 shadow-md shadow-sky-500/20 flex items-center justify-center font-black text-white text-sm shadow-xs">
                {portalType === 'superadmin' ? 'SA' : 'OS'}
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white leading-tight">
                  {portalType === 'superadmin' ? 'AI ISP OS Control' : tenant?.displayName || 'Apex Fiber'}
                </h2>
                <p className="text-[10px] uppercase font-bold tracking-wider text-sky-400">
                  {portalType === 'superadmin' ? 'Super Admin SaaS' : 'Operations Portal'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto bg-[#0B0F19]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#EFF6FF] text-sky-400 font-semibold shadow-xs'
                      : 'text-[#475569] hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Footer Profile */}
          <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#E2E8F0] border border-[#CBD5E1] flex items-center justify-center font-bold text-xs text-[#334155]">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'Operator'}</p>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {isImpersonating ? 'Super Admin (Impersonating)' : user?.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-[#F1F5F9] rounded-lg transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Workspace Shell */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          {/* Top Navbar */}
          <header className="h-14 border-b border-[#E2E8F0] bg-white px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 text-slate-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumbs */}
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Link to={portalType === 'superadmin' ? '/superadmin/dashboard' : '/operator/dashboard'} className="hover:text-sky-400 font-medium">
                  {portalType === 'superadmin' ? 'Control Plane' : 'NOC'}
                </Link>
                {breadcrumbs.map((b, i) => (
                  <React.Fragment key={i}>
                    <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                    {b.href ? (
                      <Link to={b.href} className="hover:text-sky-400 font-medium">
                        {b.label}
                      </Link>
                    ) : (
                      <span className="text-white font-semibold">{b.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => navigate(portalType === 'superadmin' ? '/superadmin/incidents' : '/operator/incidents')}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition relative border border-transparent hover:border-[#E2E8F0]"
                  title="Active Alarms"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
                </button>
              </div>
            </div>
          </header>

          {/* Page Content Container */}
          <main className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-4">
                <div>
                  <h1 className="text-xl font-bold text-white">{title}</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tenant: <span className="font-mono text-sky-400 font-medium">{tenant?.slug || 'global-plane'}</span> | Role: <span className="capitalize">{user?.role?.replace('_', ' ')}</span>
                  </p>
                </div>
                {primaryAction && <div>{primaryAction}</div>}
              </div>

              {/* Page Body */}
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
