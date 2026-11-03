import React, { useState, useEffect } from 'react';
import { NewTechLogo } from './NewTechLogo';
import { generateKeyForDevice } from '../services/activationService';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Sparkles,
  User,
  Phone,
  History,
  Trash2,
  Tv,
  ArrowRight,
  Send
} from 'lucide-react';

interface KeyRecord {
  id: string;
  name: string;
  phone: string;
  deviceId: string;
  key: string;
  date: string;
}

const STORAGE_KEYGEN_HISTORY = 'newtech_keygen_history';

export const TesfayeKeygenApp: React.FC = () => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [techName, setTechName] = useState('');
  const [techPhone, setTechPhone] = useState('');
  const [targetDeviceId, setTargetDeviceId] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<KeyRecord[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYGEN_HISTORY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1147' || pin === '2580' || pin.toLowerCase() === 'tesfaye') {
      setIsAuthenticated(true);
    } else {
      alert('የተሳሳተ የገንቢ ፒን (Incorrect Developer PIN)!');
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = targetDeviceId.trim().toUpperCase();
    if (!cleanId) {
      alert('እባክዎ የደንበኛውን Device ID ያስገቡ!');
      return;
    }

    const key = generateKeyForDevice(cleanId);
    setGeneratedKey(key);

    const newRecord: KeyRecord = {
      id: Date.now().toString(),
      name: techName.trim() || 'ባለሙያ (Technician)',
      phone: techPhone.trim() || '-',
      deviceId: cleanId,
      key,
      date: new Date().toLocaleDateString('am-ET', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updated = [newRecord, ...history];
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEYGEN_HISTORY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `ሰላም ${techName || 'ባለሙያ'}፣ የኒው-ቴክ ቲቪ ሪከቨሪ ማግበሪያ ቁልፍዎ፦\n\n🔑 Key: ${generatedKey}\n\nመለያ: ${targetDeviceId}\n\nገንቢ፦ ተስፋዬ ሀይሉ ገላው`
    );
    window.open(`https://t.me/share/url?url=&text=${text}`, '_blank');
  };

  const handleClearHistory = () => {
    if (window.confirm('የተመዘገቡ ቁልፎች ታሪክ በሙሉ ይሰረዝ?')) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEYGEN_HISTORY);
    }
  };

  // If not logged in with developer PIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#0e121b] border-2 border-amber-500 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4">
          <NewTechLogo size={90} glow={true} />

          <div>
            <h2 className="text-xl font-black text-amber-400">
              የኪይ ጀነሬተር ማዕከል (Keygen Studio)
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              ለገንቢ ተስፋዬ ሀይሉ ገላው ብቻ የተፈቀደ
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-3 pt-2">
            <div className="text-left space-y-1">
              <label className="text-xs font-bold text-slate-300">
                የገንቢ ሚስጥር ፒን (Developer PIN) አስገባ፦
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN (e.g. 1147)"
                className="w-full bg-[#07090e] border-2 border-slate-700 focus:border-amber-400 rounded-xl p-3 text-center text-lg font-mono text-amber-300 font-bold outline-none"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>ግባ (Login to Keygen)</span>
            </button>
          </form>

          <a
            href="/"
            className="text-xs text-slate-500 hover:text-amber-400 flex items-center gap-1 font-mono pt-2 transition"
          >
            <span>ወደ ዋናው አፕሊኬሽን ተመለስ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Developer Keygen Studio Dashboard
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#0b0d13] border-b border-amber-500/40 p-4 sticky top-0 z-30 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NewTechLogo size={46} glow={true} />
            <div>
              <h1 className="text-base font-black text-amber-400 flex items-center gap-1.5">
                <span>የኒው-ቴክ ኪይ ጀነሬተር ማዕከል</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  MASTER
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                ገንቢ፦ ተስፋዬ ሀይሉ ገላው (Tesfaye Hailu Gellaw)
              </p>
            </div>
          </div>

          <a
            href="/"
            className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Tv className="w-4 h-4" />
            <span className="hidden sm:inline">ወደ ቲቪ አፑ ሂድ</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Generator Form */}
        <div className="md:col-span-7 bg-[#0e121b] border-2 border-amber-500/60 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-black text-sm pb-2 border-b border-slate-800">
            <KeyRound className="w-4 h-4" />
            <span>አዲስ የማግበሪያ ቁልፍ ማመንጫ (Generate New Key)</span>
          </div>

          <form onSubmit={handleGenerate} className="space-y-3.5">
            {/* Device ID Input (Required) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>የደንበኛው የመሳሪያ መለያ (Device ID) *</span>
                <span className="text-[10px] font-mono text-amber-400">ግዴታ ነው</span>
              </label>
              <input
                type="text"
                value={targetDeviceId}
                onChange={(e) => setTargetDeviceId(e.target.value)}
                placeholder="NT-XXXX-YYYY-ZZZZ"
                className="w-full bg-[#07090e] border-2 border-slate-700 focus:border-amber-400 rounded-xl p-3 text-sm font-mono text-amber-300 font-bold outline-none uppercase tracking-wider"
                required
              />
            </div>

            {/* Technician Name (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>የባለሙያው ስም (አማራጭ)</span>
                </label>
                <input
                  type="text"
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  placeholder="ለምሳሌ፡ ዮናስ ኤሌክትሮኒክስ"
                  className="w-full bg-[#07090e] border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                />
              </div>

              {/* Phone (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>ስልክ ቁጥር (አማራጭ)</span>
                </label>
                <input
                  type="text"
                  value={techPhone}
                  onChange={(e) => setTechPhone(e.target.value)}
                  placeholder="09..."
                  className="w-full bg-[#07090e] border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-xs text-slate-200 outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-98 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>የማግበሪያ ቁልፍ አውጣ (Generate Key)</span>
            </button>
          </form>

          {/* Generated Key Output Box */}
          {generatedKey && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-black to-black border-2 border-emerald-500/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ትክክለኛ ቁልፍ ተፈጥሯል (Valid Key Generated)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">New-Tech Standard</span>
              </div>

              <div className="bg-[#07090e] p-3 rounded-xl border border-slate-700 text-center select-all">
                <span className="font-mono text-lg font-black text-amber-300 tracking-widest break-all">
                  {generatedKey}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'ተቀድቷል!' : 'ቁልፉን ቅዳ (Copy)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareTelegram}
                  className="py-2 px-3 rounded-xl bg-[#229ED9] hover:bg-[#1e8bc0] active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  title="Share to Telegram"
                >
                  <Send className="w-4 h-4" />
                  <span>በቴሌግራም ላክ</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: History & Customers Log */}
        <div className="md:col-span-5 bg-[#0e121b] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 flex flex-col max-h-[600px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
              <History className="w-4 h-4 text-amber-400" />
              <span>የተሰጡ ቁልፎች ታሪክ ({history.length})</span>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                title="Clear history"
              >
                <Trash2 className="w-3 h-3" />
                <span>አጽዳ</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar text-xs">
            {history.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p>እስካሁን የወጣ ቁልፍ የለም።</p>
                <p className="text-[10px] mt-1">የደንበኛ Device ID አስገብተው ቁልፍ ሲያወጡ እዚህ ይመዘገባል!</p>
              </div>
            ) : (
              history.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-[#07090e] border border-slate-800 hover:border-amber-500/40 rounded-xl p-3 space-y-1.5 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs">
                      {rec.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {rec.date}
                    </span>
                  </div>

                  <div className="text-[10.5px] font-mono text-slate-400">
                    ID: <span className="text-slate-300">{rec.deviceId}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="font-mono text-[11px] text-emerald-400 font-bold select-all">
                      {rec.key}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(rec.key);
                        alert(`ቁልፉ ተቀድቷል፦ ${rec.key}`);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-amber-300"
                      title="Copy Key"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
