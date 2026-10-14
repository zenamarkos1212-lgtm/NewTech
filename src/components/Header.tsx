import React, { useState } from 'react';
import { ConnectionType, Language } from '../types/tv';
import { translations } from '../constants/translations';
import { NewTechLogo } from './NewTechLogo';
import {
  Usb,
  Wifi,
  Cpu,
  BookOpen,
  Globe,
  Circle,
  Tv,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  connectionType: ConnectionType;
  isConnected: boolean;
  statusText: string;
  onOpenConnectionModal: () => void;
  onOpenGuideModal: () => void;
  onOpenRemoteModal: () => void;
  lang: Language;
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  connectionType,
  isConnected,
  statusText,
  onOpenConnectionModal,
  onOpenGuideModal,
  onOpenRemoteModal,
  lang,
  onToggleLang,
}) => {
  const t = translations[lang];
  const [showAbout, setShowAbout] = useState(false);

  return (
    <header className="bg-[#0b0d13] border-b border-slate-800/80 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        {/* Left: Official Ethiopian New-Tech Institute Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAbout(true)}
            className="flex items-center gap-2 text-left group cursor-pointer focus:outline-hidden"
            title="About New-Tech Institute"
          >
            <NewTechLogo size={42} glow={isConnected} />
            <div className="flex flex-col">
              <span className="text-amber-400 font-extrabold text-xs sm:text-sm tracking-wide leading-tight group-hover:text-amber-300 transition">
                ኒው-ቴክ ኢንስቲትዩት
              </span>
              <span className="text-slate-400 text-[9.5px] sm:text-[10.5px] font-mono tracking-tight leading-none mt-0.5">
                {lang === 'am' ? 'በተስፋዬ ሀይሉ ገላው የተሰራ' : 'Developed by Tesfaye Hailu Gellaw'}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Live Status Indicator */}
        <div className="flex items-center">
          <button
            onClick={onOpenConnectionModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-bold tracking-tight transition cursor-pointer ${
              isConnected
                ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-400/80'
            }`}
          >
            <Circle
              className={`w-2.5 h-2.5 fill-current ${
                isConnected ? 'text-emerald-400' : 'text-amber-400'
              }`}
            />
            <span className="truncate max-w-[120px] sm:max-w-none">
              {statusText}
            </span>
          </button>
        </div>

        {/* Right: Controls & Tools */}
        <div className="flex items-center gap-1.5">
          {/* TV Remote Modal Trigger Button (NEW) */}
          <button
            onClick={onOpenRemoteModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 px-3 py-1.5 text-xs font-black text-black shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-yellow-300 transition active:scale-95 cursor-pointer"
            title={lang === 'am' ? 'የቲቪ ሪሞት ክፈት' : 'Open TV Remote'}
          >
            <Tv className="w-4 h-4 text-black stroke-[2.5]" />
            <span>{lang === 'am' ? 'ቲቪ ሪሞት' : 'TV Remote'}</span>
          </button>

          {/* Connection Mode Quick Badge */}
          <button
            onClick={onOpenConnectionModal}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-1 transition"
            title="Configure Connection (OTG / WiFi)"
          >
            {connectionType === 'otg' && <Usb className="w-3.5 h-3.5 text-amber-400" />}
            {connectionType === 'wireless' && <Wifi className="w-3.5 h-3.5 text-sky-400" />}
            {connectionType === 'simulator' && <Cpu className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden md:inline font-mono text-[11px] uppercase">
              {connectionType === 'wireless' ? 'WiFi' : connectionType}
            </span>
          </button>

          {/* Pinout Guide Button */}
          <button
            onClick={onOpenGuideModal}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 transition"
            title={t.help}
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>

          {/* Language Toggle Button */}
          <button
            onClick={onToggleLang}
            className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-200 flex items-center gap-1 transition"
            title="Switch Language"
          >
            <Globe className="w-3 h-3 text-amber-400" />
            <span>{lang === 'am' ? 'አማርኛ' : 'EN'}</span>
          </button>
        </div>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="bg-[#121622] border border-amber-500/50 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-slate-100 flex flex-col items-center text-center">
            <NewTechLogo size={88} glow={true} />
            <h3 className="mt-3 text-lg font-bold text-amber-400">
              ኒው-ቴክ ኢንስቲትዩት
            </h3>
            <p className="text-xs text-slate-300 font-semibold mt-0.5">
              የኤሌክትሮኒክስ ጥገና ማዕከል
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Developed by Tesfaye Hailu Gellaw</span>
            </div>
            <div className="my-3 w-full border-t border-slate-800" />
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'am'
                ? 'የስማርት ቲቪ ማዘርቦርድ ሪከቨሪ እና ሁለንተናዊ የቲቪ ሪሞት መተግበሪያ። በተስፋዬ ሀይሉ ገላው (Tesfaye Hailu Gellaw) የተዘጋጀ።'
                : 'Universal Smart TV Recovery & Console Tool with Built-in TV Remote. Developed by Tesfaye Hailu Gellaw.'}
            </p>
            <button
              onClick={() => setShowAbout(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-black text-xs transition cursor-pointer"
            >
              ዝጋ (Close)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
