import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, KeyRound, ArrowRight, CheckCircle2, Lock, Zap } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Button, Input } from '../../components/ui/Button.js';

export const SuperAdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await api.superAdminRequestOtp(email);
    setIsLoading(false);

    if (res.success) {
      setStep('otp');
    } else {
      setError(res.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent, customOtp?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    const codeToVerify = customOtp || otp;
    const res = await api.superAdminVerifyOtp(email || 'admin@isp.local', codeToVerify);
    setIsLoading(false);

    if (res.success && res.token) {
      login(res.token, res.user);
      navigate('/superadmin/dashboard');
    } else {
      setError(res.error || 'Invalid OTP code. Please check your registered credentials.');
    }
  };

  const handleOneClickDemo = async () => {
    setEmail('admin@isp.local');
    setOtp('123456');
    setIsLoading(true);
    setError(null);

    const reqRes = await api.superAdminRequestOtp('admin@isp.local');
    const verRes = await api.superAdminVerifyOtp('admin@isp.local', '123456');
    setIsLoading(false);

    if (verRes.success && verRes.token) {
      login(verRes.token, verRes.user);
      navigate('/superadmin/dashboard');
    } else {
      setError(verRes.error || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-100 relative overflow-hidden">
      {/* Background Cyber Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-600 border border-sky-400/40 flex items-center justify-center mx-auto text-white shadow-xl shadow-sky-500/25 mb-4">
          <Shield className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">AI ISP OS Control Plane</h2>
        <p className="text-sm text-sky-400 font-mono mt-1">Super Administrator SaaS Management Console</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0D1527] border border-sky-500/30 py-8 px-6 shadow-2xl shadow-sky-950/60 rounded-2xl sm:px-10 backdrop-blur-xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2.5 font-medium">
              <Lock className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <Input
                label="Super Admin Email or Mobile"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@isp.local"
                icon={Mail}
                autoFocus
              />

              <Button type="submit" className="w-full" isLoading={isLoading} variant="primary">
                <span>Request Dynamic OTP</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleOneClickDemo}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Quick 1-Click SuperAdmin Access (Demo Mode)</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={(e) => handleVerifyOtp(e)} className="space-y-5">
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">One-Time Password Sent</p>
                  <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                    Dev Test Code: <span className="font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">123456</span>
                  </p>
                </div>
              </div>

              <Input
                label="Enter 6-Digit OTP Code"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                icon={KeyRound}
                autoFocus
              />

              <Button type="submit" className="w-full" isLoading={isLoading} variant="success">
                <span>Verify & Launch Mission Deck</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="flex justify-between items-center text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-slate-400 hover:text-white"
                >
                  ← Change Email
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyOtp(undefined, '123456')}
                  className="text-sky-400 hover:underline font-bold"
                >
                  Autofill 123456
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
