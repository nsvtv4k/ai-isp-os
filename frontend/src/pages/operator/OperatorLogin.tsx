import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, KeyRound, ArrowRight, Lock, MessageSquare, CheckCircle2, Zap } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Button, Input } from '../../components/ui/Button.js';

export const OperatorLogin: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [slug, setSlug] = useState('rudra');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await api.operatorRequestOtp(phone, slug || undefined);
    setIsLoading(false);

    if (res.success) {
      setStep('otp');
    } else {
      setError(res.error || 'Failed to send WhatsApp OTP.');
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent, customOtp?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    const code = customOtp || otp;
    const res = await api.operatorVerifyOtp(phone || '+91 98450 00001', code, slug || undefined);
    setIsLoading(false);

    if (res.success && res.token) {
      login(res.token, res.user, res.tenant);
      navigate('/operator/dashboard');
    } else {
      setError(res.error || 'Invalid or expired WhatsApp OTP code.');
    }
  };

  const handleOneClickDemo = async () => {
    setPhone('+91 98450 00001');
    setSlug('rudra');
    setOtp('123456');
    setIsLoading(true);
    setError(null);

    await api.operatorRequestOtp('+91 98450 00001', 'rudra');
    const verRes = await api.operatorVerifyOtp('+91 98450 00001', '123456', 'rudra');
    setIsLoading(false);

    if (verRes.success && verRes.token) {
      login(verRes.token, verRes.user, verRes.tenant);
      navigate('/operator/dashboard');
    } else {
      setError(verRes.error || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-100 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-400/40 flex items-center justify-center mx-auto text-white shadow-xl shadow-emerald-500/25 mb-4">
          <MessageSquare className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Operator NOC Portal</h2>
        <p className="text-sm text-emerald-400 font-mono mt-1">Authorized WhatsApp OTP Authentication</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0D1527] border border-emerald-500/30 py-8 px-6 shadow-2xl shadow-emerald-950/60 rounded-2xl sm:px-10 backdrop-blur-xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2.5 font-medium">
              <Lock className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <Input
                label="Registered Operator Mobile Number or Email"
                type="text"
                required
                placeholder="+91 98450 00001"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={Phone}
                helperText="Dynamic OTP will be sent to your WhatsApp"
                autoFocus
              />

              <Input
                label="ISP Tenant Slug (Optional)"
                type="text"
                placeholder="rudra"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />

              <Button type="submit" className="w-full" isLoading={isLoading} variant="success">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span>Send WhatsApp OTP</span>
              </Button>

              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleOneClickDemo}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Quick 1-Click Rudra Fiber NOC Access</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={(e) => handleVerifyOtp(e)} className="space-y-5">
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">WhatsApp OTP Dispatched</p>
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
                <span>Enter Operator NOC Deck</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="flex justify-between items-center text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-slate-400 hover:text-white"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyOtp(undefined, '123456')}
                  className="text-emerald-400 hover:underline font-bold"
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
