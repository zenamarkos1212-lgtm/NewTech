import React, { useState, useEffect } from 'react';
import { NewTechLogo } from './NewTechLogo';
import {
  getOrCreateDeviceId,
  activateApp,
} from '../services/activationService';
import { Language } from '../types/tv';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Sparkles,
  Phone,
  AlertCircle
} from 'lucide-react';

interface ActivationScreenProps {
  onActivated: () => void;
  lang: Language;
}

export const ActivationScreen: React.FC<ActivationScreenProps> = ({
  onActivated,
  lang,
}) => {
  const [deviceId, setDeviceId] = useState<string>('');
  const [inputKey, setInputKey] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);
  }, []);

  const handleCopyDeviceId = () => {
    navigator.clipboard.writeText(deviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = activateApp(inputKey);
    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        onActivated();
      }, 1200);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090e] p-3 sm:p-4 overflow-y-auto select-none">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0f131d] border-2 border-amber-500/60 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-slate-100 flex flex-col items-center text-center space-y-4 my-auto">
        {/* Emblem Header */}
        <div className="transition-transform">
          <NewTechLogo size={105} glow={true} />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-400 tracking-wide">
            ኒው-ቴክ ኢንስቲትዩት
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            የኤሌክትሮኒክስ ጥገና ማዕከል • Smart TV Tool
          </p>
          <div className="mt-1.5 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Developed by Tesfaye Hailu Gellaw</span>
          </div>
        </div>

        {/* Lock Notice Card */}
        <div className="w-full bg-[#151a27] border border-amber-500/30 rounded-2xl p-4 text-left space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>
              {lang === 'am' ? 'የአፕሊኬሽን ማግበሪያ (Activation Required)' : 'Device License Required'}
            </span>
          </div>

          <p className="text-[11.5px] text-slate-300 leading-relaxed">
            {lang === 'am'
              ? 'ይህ መተግበሪያ የተቆለፈ ነው። እባክዎ ከታች ያለውን የእርስዎን ልዩ የመሳሪያ መለያ (Device ID) ወደ ገንቢው ተስፋዬ ሀይሉ ገላው በመላክ የማግበሪያ ቁልፍ (Activation Key) ይቀበሉ።'
              : 'This device is locked. Please send your unique Device Hardware ID to the developer Tesfaye Hailu Gellaw to receive your Activation Key.'}
          </p>

          {/* Unique Hardware Device ID Box */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono font-bold text-slate-400">
              {lang === 'am' ? 'የእርስዎ የመሳሪያ መለያ (Your Device ID)' : 'Your Device ID'}
            </label>
            <div className="flex items-center gap-2 bg-[#090b10] border border-slate-700 rounded-xl px-3 py-2">
              <span className="font-mono text-xs sm:text-sm text-amber-300 font-black tracking-wider flex-1 select-all">
                {deviceId || 'NT-GENERATING...'}
              </span>
              <button
                type="button"
                onClick={handleCopyDeviceId}
                className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                title="Copy Device ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="text-[10px]">{copied ? 'ተቀድቷል' : 'ቅዳ'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Activation Key Input Form */}
        <form onSubmit={handleActivate} className="w-full space-y-3">
          <div className="text-left space-y-1">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'am' ? 'የማግበሪያ ቁልፍ አስገባ (Enter Activation Key)' : 'Enter Activation Key'}</span>
            </label>
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="ACT-XXXX-YYYY-ZZZZ"
              className="w-full bg-[#0a0d14] border-2 border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm font-mono text-center text-amber-300 tracking-wider placeholder:text-slate-600 outline-none uppercase font-bold"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2 text-left animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 text-left animate-in fade-in">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-98 transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />
            <span>{lang === 'am' ? 'አግብር (Activate Now)' : 'Activate Application'}</span>
          </button>
        </form>

        {/* Contact Developer Links */}
        <div className="pt-2 w-full border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>ገንቢ፦ ተስፋዬ ሀይሉ ገላው</span>
          <span className="text-amber-400 font-bold">ኒው-ቴክ ኢንስቲትዩት</span>
        </div>
      </div>
    </div>
  );
};
