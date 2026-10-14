import React, { useState } from 'react';
import { Language } from '../types/tv';
import {
  Power,
  Volume2,
  VolumeX,
  Volume1,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  CornerDownLeft,
  Menu,
  X,
  Tv,
  Radio,
  Sparkles,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';

interface TVRemoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSendCommand: (cmd: string, label?: string) => void;
}

// All Chinese TV Brands & Universal Motherboards
export const CHINA_TV_BRANDS = [
  { id: 'china_universal', name: 'Universal China', desc: 'TP.MS338 / TP.MT5510 / CV338' },
  { id: 'tcl', name: 'TCL / Thomson', desc: 'TCL, iFFALCON, Thomson' },
  { id: 'hisense', name: 'Hisense / Vidda', desc: 'Hisense, Toshiba China' },
  { id: 'changhong', name: 'Changhong / CHiQ', desc: 'Changhong, CHiQ Smart' },
  { id: 'skyworth', name: 'Skyworth / Coocaa', desc: 'Skyworth, Coocaa, Metz' },
  { id: 'konka', name: 'Konka TV', desc: 'Konka Android / DLED' },
  { id: 'xiaomi', name: 'Xiaomi / Redmi', desc: 'Mi TV, Redmi TV Android' },
  { id: 'haier', name: 'Haier Smart', desc: 'Haier Android TV' },
  { id: 'starx_nikai', name: 'Star-X / Nikai', desc: 'Star-X, Super General, Geepas, Evvoli' },
  { id: 'samsung', name: 'Samsung', desc: 'Tizen / Universal' },
  { id: 'lg', name: 'LG', desc: 'webOS / Netcast' },
  { id: 'sony', name: 'Sony', desc: 'Bravia / Android TV' },
];

export const CHINA_SERVICE_CODES = [
  {
    name: 'MStar China (1147)',
    keys: ['KEY_MENU', 'KEY_1', 'KEY_1', 'KEY_4', 'KEY_7'],
    brand: 'All China MStar Boards',
    codeText: 'MENU + 1147',
    color: 'border-amber-500/60 text-amber-300'
  },
  {
    name: 'MTK / MediaTek (2580)',
    keys: ['KEY_SOURCE', 'KEY_2', 'KEY_5', 'KEY_8', 'KEY_0'],
    brand: 'MediaTek China Boards',
    codeText: 'SOURCE + 2580',
    color: 'border-emerald-500/60 text-emerald-300'
  },
  {
    name: 'Realtek (815)',
    keys: ['KEY_MENU', 'KEY_8', 'KEY_1', 'KEY_5'],
    brand: 'Realtek Smart Boards',
    codeText: 'MENU + 815',
    color: 'border-sky-500/60 text-sky-300'
  },
  {
    name: 'TCL Smart (3138)',
    keys: ['KEY_SOURCE', 'KEY_3', 'KEY_1', 'KEY_3', 'KEY_8'],
    brand: 'TCL & Thomson TVs',
    codeText: 'SOURCE + 3138',
    color: 'border-red-500/60 text-red-300'
  },
  {
    name: 'Hisense (0816)',
    keys: ['KEY_MENU', 'KEY_0', 'KEY_8', 'KEY_1', 'KEY_6'],
    brand: 'Hisense Smart TVs',
    codeText: 'MENU + 0816',
    color: 'border-teal-500/60 text-teal-300'
  },
  {
    name: 'Skyworth / Coocaa (2008)',
    keys: ['KEY_SOURCE', 'KEY_2', 'KEY_0', 'KEY_0', 'KEY_8'],
    brand: 'Skyworth, Coocaa',
    codeText: 'SOURCE + 2008',
    color: 'border-indigo-500/60 text-indigo-300'
  },
  {
    name: 'Changhong / CHiQ (8202)',
    keys: ['KEY_MENU', 'KEY_8', 'KEY_2', 'KEY_0', 'KEY_2'],
    brand: 'Changhong, CHiQ',
    codeText: 'MENU + 8202',
    color: 'border-purple-500/60 text-purple-300'
  },
  {
    name: 'Konka (8893)',
    keys: ['KEY_SOURCE', 'KEY_8', 'KEY_8', 'KEY_9', 'KEY_3'],
    brand: 'Konka Smart TVs',
    codeText: 'INPUT + 8893',
    color: 'border-yellow-500/60 text-yellow-300'
  },
  {
    name: 'Haier (9527)',
    keys: ['KEY_MENU', 'KEY_9', 'KEY_5', 'KEY_2', 'KEY_7'],
    brand: 'Haier Smart TVs',
    codeText: 'MENU + 9527',
    color: 'border-blue-500/60 text-blue-300'
  },
  {
    name: 'Star-X / Super Gen (1147)',
    keys: ['KEY_MENU', 'KEY_1', 'KEY_1', 'KEY_4', 'KEY_7'],
    brand: 'Star-X, Nikai, Geepas',
    codeText: 'MENU + 1147',
    color: 'border-orange-500/60 text-orange-300'
  },
  {
    name: 'Samsung Service (182)',
    keys: ['KEY_MUTE', 'KEY_1', 'KEY_8', 'KEY_2', 'KEY_POWER'],
    brand: 'Samsung Service Menu',
    codeText: 'MUTE 1 8 2 POWER',
    color: 'border-blue-400/60 text-blue-300'
  },
  {
    name: 'Universal China (2580)',
    keys: ['KEY_MENU', 'KEY_2', 'KEY_5', 'KEY_8', 'KEY_0'],
    brand: 'Universal Chassis',
    codeText: 'MENU + 2580',
    color: 'border-lime-500/60 text-lime-300'
  },
];

export const TVRemoteModal: React.FC<TVRemoteModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSendCommand,
}) => {
  const [activeBrand, setActiveBrand] = useState<string>('china_universal');
  const [lastAction, setLastAction] = useState<string>('READY');
  const [isEmitting, setIsEmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'remote' | 'service_codes'>('remote');

  if (!isOpen) return null;

  // Synthesized click tone for tactile feel
  const playClick = (freq = 900, duration = 0.03) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext unavailable
    }
  };

  const handlePress = (cmd: string, label: string, freq = 900) => {
    playClick(freq);
    setLastAction(label);
    setIsEmitting(true);
    setTimeout(() => setIsEmitting(false), 220);

    const fullCmd = `ir_send ${activeBrand.toUpperCase()} ${cmd}`;
    onSendCommand(fullCmd, `[REMOTE] ${label}`);
  };

  // Factory / Service Menu sequences
  const handleServiceCode = async (codeName: string, keys: string[]) => {
    setLastAction(`FACTORY: ${codeName}`);
    setIsEmitting(true);

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      playClick(1000 + i * 150, 0.04);
      onSendCommand(`send_key ${k}`, `[SERVICE] ${k}`);
      await new Promise((r) => setTimeout(r, 260));
    }

    setTimeout(() => setIsEmitting(false), 300);
  };

  const currentBrandObj = CHINA_TV_BRANDS.find((b) => b.id === activeBrand) || CHINA_TV_BRANDS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-xs">
      <div className="bg-[#0e121b] border-2 border-slate-800 rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl text-slate-100 flex flex-col max-h-[96vh] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-black text-sm text-white tracking-wide">
                {lang === 'am' ? 'ሁለንተናዊ የቻይና እና ስማርት ቲቪ ሪሞት' : 'Universal China & Smart TV Remote'}
              </h3>
              <p className="text-[10px] text-amber-400 font-mono">
                {lang === 'am' ? 'በተስፋዬ ሀይሉ ገላው የተሰራ' : 'Developed by Tesfaye Hailu Gellaw'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher: Handset Remote vs Service Codes */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 rounded-xl border border-slate-800 my-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('remote')}
            className={`py-1.5 rounded-lg transition ${
              activeTab === 'remote'
                ? 'bg-amber-500 text-black font-black shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'am' ? 'የቲቪ ሪሞት (Remote)' : 'TV Remote Handset'}
          </button>
          <button
            onClick={() => setActiveTab('service_codes')}
            className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'service_codes'
                ? 'bg-amber-500 text-black font-black shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'am' ? 'የቻይና ሰርቪስ ሜኑ (Codes)' : 'China Service Codes'}</span>
          </button>
        </div>

        {/* Brand / Chinese TV Model Dropdown Selector */}
        <div className="space-y-1 pb-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>{lang === 'am' ? 'የቻይና ቲቪ ሞዴል ምረጥ፦' : 'Select Chinese TV Model / Board:'}</span>
            <span className="text-amber-400 font-bold">{currentBrandObj.desc}</span>
          </div>
          <select
            value={activeBrand}
            onChange={(e) => setActiveBrand(e.target.value)}
            className="w-full bg-[#141824] border border-amber-500/40 rounded-xl p-2 text-xs font-bold text-amber-300 focus:outline-hidden"
          >
            {CHINA_TV_BRANDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.desc})
              </option>
            ))}
          </select>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto pr-0.5 custom-scrollbar space-y-3 py-1">
          {activeTab === 'remote' ? (
            /* Remote Handset Body */
            <div className="bg-gradient-to-b from-[#141824] via-[#10141f] to-[#0a0d14] rounded-3xl p-4 border border-slate-700/60 shadow-inner space-y-3.5 relative">
              {/* Top IR Emitter Node */}
              <div className="flex items-center justify-between px-2 pt-0.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  IR / SERIAL TX
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-slate-400 uppercase">
                    {isEmitting ? 'TRANSMITTING' : 'READY'}
                  </span>
                  <div
                    className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                      isEmitting
                        ? 'bg-amber-400 border-amber-300 shadow-[0_0_12px_#f59e0b] scale-125 animate-ping'
                        : 'bg-red-950/70 border-red-900/60'
                    }`}
                  />
                </div>
              </div>

              {/* LCD Digital Feedback Strip */}
              <div className="bg-[#05070a] border border-amber-500/30 rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-300 truncate max-w-[200px] font-bold">
                  {lastAction}
                </span>
                <span className="text-amber-400 font-bold uppercase text-[10px]">
                  {currentBrandObj.name.split('/')[0]}
                </span>
              </div>

              {/* Top Function Row: Power, Source, Mute */}
              <div className="flex items-center justify-between px-1">
                {/* Power Button */}
                <button
                  onClick={() => handlePress('KEY_POWER', 'POWER', 600)}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-900/40 border border-red-500/50 cursor-pointer"
                  title="Power ON / OFF"
                >
                  <Power className="w-5 h-5" />
                </button>

                {/* Source / Input */}
                <button
                  onClick={() => handlePress('KEY_SOURCE', 'SOURCE', 850)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 text-xs font-bold border border-slate-700 flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Input Source (HDMI/AV)"
                >
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  <span>SOURCE</span>
                </button>

                {/* Mute Button */}
                <button
                  onClick={() => handlePress('KEY_MUTE', 'MUTE', 950)}
                  className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 flex items-center justify-center shadow-xs border border-slate-700 cursor-pointer"
                  title="Mute Audio"
                >
                  <VolumeX className="w-5 h-5 text-amber-400" />
                </button>
              </div>

              {/* Quick Input Bar (HDMI 1, HDMI 2, AV, USB) */}
              <div className="grid grid-cols-4 gap-1.5 pt-0.5 text-[10px] font-mono">
                {['HDMI 1', 'HDMI 2', 'AV', 'USB'].map((input) => (
                  <button
                    key={input}
                    onClick={() => handlePress(`KEY_${input.replace(' ', '')}`, input, 800)}
                    className="py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 active:scale-95 text-slate-300 border border-slate-800 font-bold"
                  >
                    {input}
                  </button>
                ))}
              </div>

              {/* Center Circular D-PAD Controller */}
              <div className="flex justify-center py-1">
                <div className="relative w-44 h-44 rounded-full bg-gradient-to-b from-[#1b2234] via-[#151b2a] to-[#0d121c] p-2.5 shadow-2xl border-2 border-slate-700/80 flex items-center justify-center">
                  {/* UP */}
                  <button
                    onClick={() => handlePress('KEY_UP', 'UP', 1000)}
                    className="absolute top-2 w-12 h-10 flex items-center justify-center text-slate-300 hover:text-amber-400 active:scale-95 transition"
                    title="Up"
                  >
                    <ChevronUp className="w-7 h-7" />
                  </button>

                  {/* DOWN */}
                  <button
                    onClick={() => handlePress('KEY_DOWN', 'DOWN', 1000)}
                    className="absolute bottom-2 w-12 h-10 flex items-center justify-center text-slate-300 hover:text-amber-400 active:scale-95 transition"
                    title="Down"
                  >
                    <ChevronDown className="w-7 h-7" />
                  </button>

                  {/* LEFT */}
                  <button
                    onClick={() => handlePress('KEY_LEFT', 'LEFT', 1000)}
                    className="absolute left-2 w-10 h-12 flex items-center justify-center text-slate-300 hover:text-amber-400 active:scale-95 transition"
                    title="Left"
                  >
                    <ChevronLeft className="w-7 h-7" />
                  </button>

                  {/* RIGHT */}
                  <button
                    onClick={() => handlePress('KEY_RIGHT', 'RIGHT', 1000)}
                    className="absolute right-2 w-10 h-12 flex items-center justify-center text-slate-300 hover:text-amber-400 active:scale-95 transition"
                    title="Right"
                  >
                    <ChevronRight className="w-7 h-7" />
                  </button>

                  {/* Central OK Button */}
                  <button
                    onClick={() => handlePress('KEY_ENTER', 'OK', 1150)}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-90 text-black font-black text-sm flex items-center justify-center shadow-lg shadow-amber-500/30 border border-amber-300 cursor-pointer"
                    title="OK / Enter"
                  >
                    OK
                  </button>
                </div>
              </div>

              {/* Navigation 4 Buttons: Back, Home, Menu, Exit */}
              <div className="grid grid-cols-4 gap-2 px-1">
                <button
                  onClick={() => handlePress('KEY_BACK', 'BACK', 900)}
                  className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-800 text-slate-300 flex flex-col items-center gap-1 text-[10px] font-bold"
                  title="Back / Return"
                >
                  <CornerDownLeft className="w-4 h-4 text-amber-400" />
                  <span>BACK</span>
                </button>

                <button
                  onClick={() => handlePress('KEY_HOME', 'HOME', 900)}
                  className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-800 text-slate-300 flex flex-col items-center gap-1 text-[10px] font-bold"
                  title="Home Dashboard"
                >
                  <Home className="w-4 h-4 text-sky-400" />
                  <span>HOME</span>
                </button>

                <button
                  onClick={() => handlePress('KEY_MENU', 'MENU', 900)}
                  className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-800 text-slate-300 flex flex-col items-center gap-1 text-[10px] font-bold"
                  title="Main Menu"
                >
                  <Menu className="w-4 h-4 text-emerald-400" />
                  <span>MENU</span>
                </button>

                <button
                  onClick={() => handlePress('KEY_EXIT', 'EXIT', 900)}
                  className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-800 text-slate-300 flex flex-col items-center gap-1 text-[10px] font-bold"
                  title="Exit"
                >
                  <X className="w-4 h-4 text-rose-400" />
                  <span>EXIT</span>
                </button>
              </div>

              {/* Dual Rockers: Volume & Channel */}
              <div className="grid grid-cols-2 gap-4 px-2 pt-0.5">
                {/* Volume Rocker */}
                <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-1 flex flex-col items-center">
                  <button
                    onClick={() => handlePress('KEY_VOLUMEUP', 'VOL +', 1100)}
                    className="w-full py-2.5 rounded-xl hover:bg-slate-800 active:scale-95 text-slate-200 flex items-center justify-center font-black text-sm"
                    title="Volume Up"
                  >
                    +
                  </button>
                  <span className="text-[10px] font-mono text-slate-400 py-0.5 font-bold">
                    VOL
                  </span>
                  <button
                    onClick={() => handlePress('KEY_VOLUMEDOWN', 'VOL -', 950)}
                    className="w-full py-2.5 rounded-xl hover:bg-slate-800 active:scale-95 text-slate-200 flex items-center justify-center font-black text-sm"
                    title="Volume Down"
                  >
                    -
                  </button>
                </div>

                {/* Channel Rocker */}
                <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-1 flex flex-col items-center">
                  <button
                    onClick={() => handlePress('KEY_CHANNELUP', 'CH +', 1100)}
                    className="w-full py-2.5 rounded-xl hover:bg-slate-800 active:scale-95 text-slate-200 flex items-center justify-center font-black text-sm"
                    title="Channel Up"
                  >
                    ▲
                  </button>
                  <span className="text-[10px] font-mono text-slate-400 py-0.5 font-bold">
                    CH
                  </span>
                  <button
                    onClick={() => handlePress('KEY_CHANNELDOWN', 'CH -', 950)}
                    className="w-full py-2.5 rounded-xl hover:bg-slate-800 active:scale-95 text-slate-200 flex items-center justify-center font-black text-sm"
                    title="Channel Down"
                  >
                    ▼
                  </button>
                </div>
              </div>

              {/* Color Buttons */}
              <div className="grid grid-cols-4 gap-2 px-1">
                <button
                  onClick={() => handlePress('KEY_RED', 'RED (A)', 700)}
                  className="h-3 rounded-full bg-red-600 hover:bg-red-500 active:scale-90 shadow-sm"
                />
                <button
                  onClick={() => handlePress('KEY_GREEN', 'GREEN (B)', 800)}
                  className="h-3 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-90 shadow-sm"
                />
                <button
                  onClick={() => handlePress('KEY_YELLOW', 'YELLOW (C)', 900)}
                  className="h-3 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-90 shadow-sm"
                />
                <button
                  onClick={() => handlePress('KEY_BLUE', 'BLUE (D)', 1000)}
                  className="h-3 rounded-full bg-sky-600 hover:bg-sky-500 active:scale-90 shadow-sm"
                />
              </div>

              {/* Numeric Keypad (0-9) */}
              <div className="space-y-1.5 pt-0.5">
                <div className="grid grid-cols-3 gap-2 px-2 text-xs font-bold font-mono">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => handlePress(`KEY_${num}`, `${num}`, 800 + num * 30)}
                      className="py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-slate-800/80 text-slate-200 text-center"
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 px-2 text-xs font-bold font-mono">
                  <button
                    onClick={() => handlePress('KEY_INFO', 'INFO', 850)}
                    className="py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-slate-800/80 text-slate-400 text-[10px]"
                  >
                    INFO
                  </button>
                  <button
                    onClick={() => handlePress('KEY_0', '0', 800)}
                    className="py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-slate-800/80 text-slate-200 text-center"
                  >
                    0
                  </button>
                  <button
                    onClick={() => handlePress('KEY_GUIDE', 'EPG', 850)}
                    className="py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-slate-800/80 text-slate-400 text-[10px]"
                  >
                    EPG
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* All Chinese TV Factory / Service Menu Codes */
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'am' ? 'የቻይና ቲቪዎች ሰርቪስ ሜኑ ኮዶች (1-ክሊክ)' : '1-Click Chinese TV Factory Codes'}</span>
                </p>
                <p className="text-[11px] text-slate-300 mt-1">
                  {lang === 'am'
                    ? 'ከታች ካሉት የቲቪዎን ሞዴል ይምረጡ፤ አፑ ኮዱን በቅደም ተከተል ለቲቪው ወዲያውኑ ይልካል፦'
                    : 'Tap any code below to automatically send the service sequence to the TV:'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {CHINA_SERVICE_CODES.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleServiceCode(item.name, item.keys)}
                    className={`p-3 rounded-xl bg-[#141824] hover:bg-[#1b2234] border ${item.color} text-left transition active:scale-98 shadow-md cursor-pointer`}
                  >
                    <div className="font-black text-sm">{item.name}</div>
                    <div className="text-slate-400 text-[10.5px] mt-0.5">{item.brand}</div>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 font-mono text-[11px] font-bold text-amber-300 border border-slate-800">
                      <span>{item.codeText}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
