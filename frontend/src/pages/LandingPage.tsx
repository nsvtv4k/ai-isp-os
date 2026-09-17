import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Radio,
  Server,
  Zap,
  Building2,
  Users,
  Wrench,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Lock,
  Copy,
  CheckCircle2,
  Sparkles,
  Layers,
  Terminal,
  Wifi,
  ExternalLink,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const acsUrl = 'http://192.168.1.6:7547/tr069/rudra';

  const handleCopyAcs = () => {
    navigator.clipboard.writeText(acsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Telemetry Ticker Bar */}
      <header className="border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md px-6 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent">
                  AI ISP OS
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 uppercase tracking-widest font-semibold">
                  v2.0.1 Carrier NOC
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous Broadband & Optical Fiber Operations Platform</p>
            </div>
          </div>

          {/* System Telemetry HUD */}
          <div className="flex items-center space-x-3 font-mono text-xs">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>CORE PORT 4000: ONLINE</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Activity className="w-3.5 h-3.5" />
              <span>TR-069 ACS: PORT 7547 ACTIVE</span>
            </div>
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              <Cpu className="w-3.5 h-3.5" />
              <span>TEST OTP: 123456</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Mission Control Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 flex flex-col space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Tenant Fiber Broadband Operating System</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Centralized Command for{' '}
            <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
              Fiber ISPs & OLT Networks
            </span>
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Directly connect your Optronix / Syrotech GPON OLT, manage remote customer ONTs, trace fiber cable cuts on GIS maps, and automate billing — all in one unified mission control.
          </p>
        </section>

        {/* 4 Large Mission Control Portal Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Portal 1: Operator NOC */}
          <div className="rounded-2xl bg-gradient-to-b from-[#111827] to-[#0D131F] border border-sky-500/30 p-6 flex flex-col justify-between hover:border-sky-400 transition-all duration-200 hover:shadow-2xl hover:shadow-sky-500/10 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-sky-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-500/20 transition-all"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">Primary ISP NOC</span>
                <h3 className="text-xl font-bold text-white mt-1">Operator NOC & Customer 360</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live OLT status, ONT optical signals (dBm), customer records, fiber GIS map, reboot/Wi-Fi commands, and alerts.
              </p>
            </div>
            <div className="pt-6 space-y-2">
              <Link
                to="/operator/login"
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-lg shadow-sky-600/30 transition-all"
              >
                <span>Launch Operator NOC</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-[11px] text-center text-slate-500 font-mono">Use phone + OTP: 123456</p>
            </div>
          </div>

          {/* Portal 2: Super Admin */}
          <div className="rounded-2xl bg-gradient-to-b from-[#111827] to-[#0D131F] border border-purple-500/30 p-6 flex flex-col justify-between hover:border-purple-400 transition-all duration-200 hover:shadow-2xl hover:shadow-purple-500/10 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Cloud Management</span>
                <h3 className="text-xl font-bold text-white mt-1">Super Admin Console</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multi-tenant cloud controls, create new ISP operators, set SaaS billing plans, view global revenue and system health.
              </p>
            </div>
            <div className="pt-6 space-y-2">
              <Link
                to="/superadmin/login"
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition-all"
              >
                <span>Launch Super Admin</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-[11px] text-center text-slate-500 font-mono">Use email + OTP: 123456</p>
            </div>
          </div>

          {/* Portal 3: Field Tech */}
          <div className="rounded-2xl bg-gradient-to-b from-[#111827] to-[#0D131F] border border-amber-500/30 p-6 flex flex-col justify-between hover:border-amber-400 transition-all duration-200 hover:shadow-2xl hover:shadow-amber-500/10 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Field Operations</span>
                <h3 className="text-xl font-bold text-white mt-1">Technician Mobile App</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Work orders, new customer drop installations, router replacement barcode scanning, and optical cable repair jobs.
              </p>
            </div>
            <div className="pt-6 space-y-2">
              <Link
                to="/tech/login"
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-lg shadow-amber-600/30 transition-all"
              >
                <span>Launch Field App</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-[11px] text-center text-slate-500 font-mono">1-Click Tech Login</p>
            </div>
          </div>

          {/* Portal 4: Customer Portal */}
          <div className="rounded-2xl bg-gradient-to-b from-[#111827] to-[#0D131F] border border-emerald-500/30 p-6 flex flex-col justify-between hover:border-emerald-400 transition-all duration-200 hover:shadow-2xl hover:shadow-emerald-500/10 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Wifi className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Subscriber Portal</span>
                <h3 className="text-xl font-bold text-white mt-1">Customer Self-Service</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Subscriber speed tests, Wi-Fi password management, plan recharges, invoice downloads, and support ticket creation.
              </p>
            </div>
            <div className="pt-6 space-y-2">
              <Link
                to="/customer/login"
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all"
              >
                <span>Launch Customer Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-[11px] text-center text-slate-500 font-mono">1-Click Customer Login</p>
            </div>
          </div>
        </section>

        {/* Live ONT Quick-Connect & Testing Box */}
        <section className="rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#111C35] to-[#0F172A] border-2 border-cyan-500/40 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold tracking-wider">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>LIVE ONT RAPID ONBOARDING BOX</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Want to test your Optronix / Syrotech ONT right now?
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Open your router page at <strong className="text-cyan-300 font-mono">http://192.168.1.1</strong>, go to <strong className="text-white">Management &rarr; TR-069</strong>, and paste the ACS URL below. Your ONT will appear in the NOC instantly!
              </p>

              {/* ACS URL Box */}
              <div className="flex items-center space-x-2 pt-2">
                <div className="flex-1 bg-black/60 border border-cyan-500/40 rounded-xl px-4 py-3 font-mono text-xs md:text-sm text-cyan-300 select-all overflow-x-auto">
                  {acsUrl}
                </div>
                <button
                  onClick={handleCopyAcs}
                  className="px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs font-mono flex items-center space-x-1.5 transition-all shrink-0"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>COPY ACS URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-black/40 border border-slate-800 rounded-xl p-5 space-y-3 font-mono text-xs text-slate-300 min-w-[280px]">
              <div className="text-slate-400 font-bold border-b border-slate-800 pb-2">3-STEP RAPID TEST:</div>
              <div className="flex items-start space-x-2">
                <span className="text-cyan-400 font-bold">1.</span>
                <span>Open <code>192.168.1.1</code> in your browser</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-cyan-400 font-bold">2.</span>
                <span>Enable TR-069 & set Interval to <code>60s</code></span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-cyan-400 font-bold">3.</span>
                <span>Watch ONT appear live in Operator NOC!</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070A12] px-6 py-6 text-center text-xs text-slate-500 font-mono">
        AI ISP OS Enterprise Telecom Platform • Certified for Optronix, Syrotech, Huawei, and ZTE GPON/EPON
      </footer>
    </div>
  );
};
