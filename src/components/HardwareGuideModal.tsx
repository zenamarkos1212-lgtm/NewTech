import React from 'react';
import { Language } from '../types/tv';
import { translations } from '../constants/translations';
import { X, ShieldAlert, Cpu, Cable, AlertTriangle, BookOpen } from 'lucide-react';

interface HardwareGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const HardwareGuideModal: React.FC<HardwareGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
      <div className="bg-[#10141e] border border-slate-800 rounded-2xl max-w-2xl w-full p-5 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm sm:text-base text-slate-100">
              {t.guideTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-xs text-slate-300">
          {/* CRITICAL WARNING */}
          <div className="p-3 rounded-xl bg-red-950/40 border-2 border-red-800/80 text-red-200 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-red-300 uppercase">
                {lang === 'am' ? 'ጠቃሚ ጥንቃቄ (SAFETY WARNING)' : 'SAFETY & VOLTAGE WARNING'}
              </p>
              <p className="mt-1 leading-relaxed text-[11px] text-red-200">
                {lang === 'am'
                  ? 'የቲቪ ማዘርቦርድ UART ቮልቴጅ 3.3V Logic Level ነው። የቲቪውን 12V ወይም 5V ፓወር ከስልኩ ወይም ከኮምፒውተሩ ጋር በቀጥታ እንዳያገናኙ! ሁልጊዜ የጋራ GND (Ground) ማገናኘት ግዴታ ነው።'
                  : 'TV Mainboard UART logic level is 3.3V TTL. NEVER connect 12V or 5V VCC to the serial pins! You MUST share a common GND.'}
              </p>
            </div>
          </div>

          {/* Diagram Pinout Card */}
          <div className="bg-[#090b10] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
              <Cpu className="w-4 h-4" />
              <span>
                {lang === 'am' ? 'የገመዶች አያያዝ ንድፍ' : 'UART & TV Motherboard Pinout'}
              </span>
            </div>

            <div className="font-mono text-[11px] bg-black/60 p-3 rounded-lg border border-slate-800 text-slate-200 space-y-1.5 leading-relaxed">
              <div className="text-amber-400 font-bold">USB-TTL (CH340 / CP2102) &lt;---&gt; TV MAINBOARD</div>
              <div className="text-emerald-400">GND (Ground)  -----------&gt; TV GND (Common Shield/Tuner ground)</div>
              <div className="text-cyan-400">TX  (Transmit) -----------&gt; TV RX  (Receive input)</div>
              <div className="text-yellow-300">RX  (Receive)  -----------&gt; TV TX  (Transmit output)</div>
              <div className="text-slate-400">VCC (Optional) -----------&gt; Leave Unconnected (Only GND, TX, RX required)</div>
            </div>
          </div>

          {/* How to find TV UART pins */}
          <div className="bg-[#090b10] p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase">
              <Cable className="w-4 h-4" />
              <span>
                {lang === 'am'
                  ? 'በቲቪ ማዘርቦርድ ላይ የ UART ፒኖችን የት እናገኛለን?'
                  : 'How to Locate UART Pins on Smart TV Boards'}
              </span>
            </div>

            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="font-bold text-amber-300">1. VGA Port (D-Sub 15 pin):</span>
                <p className="mt-0.5 text-slate-400">
                  Most MStar (MSD338, etc.) and MediaTek boards map UART to VGA:
                  <br />
                  <b>Pin 12</b> = TX | <b>Pin 15</b> = RX | <b>Pin 5 &amp; 10</b> = GND.
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="font-bold text-sky-300">2. Service 3.5mm Headphone Jack:</span>
                <p className="mt-0.5 text-slate-400">
                  Many Samsung/LG/Generic Smart TVs route UART through a 3.5mm jack labeled "SERVICE":
                  <br />
                  <b>Tip</b> = TX | <b>Ring</b> = RX | <b>Sleeve</b> = GND.
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="font-bold text-emerald-300">3. Motherboard PCB Header / Test Pads:</span>
                <p className="mt-0.5 text-slate-400">
                  Look near the main SoC or eMMC for 3-4 unpopulated pins silkscreened with <b>TX</b>, <b>RX</b>, <b>GND</b>, or <b>DEBUG</b>.
                </p>
              </div>
            </div>
          </div>

          {/* Step-by-Step TV Recovery Procedure */}
          <div className="bg-[#090b10] p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-amber-400 text-xs uppercase block">
              {lang === 'am' ? 'የቲቪ ሪከቨሪ አሰራር ቅደም ተከተል' : 'Standard TV Recovery Workflow'}
            </span>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
              <li>Connect TV GND, TX, RX to USB-OTG or Serial Adapter.</li>
              <li>Open this New-Tech TV Recovery Tool app and tap <b>Connect</b>.</li>
              <li>Select your TV chipset brand (e.g., MStar, MediaTek, Realtek).</li>
              <li>Power off the TV, then tap <b>INTERRUPT BOOT</b> while turning on the TV AC power.</li>
              <li>The TV bootloader will halt and show the console prompt (e.g. <code>mstar #</code>).</li>
              <li>Tap <b>RECOVERY 1</b> or <b>RECOVERY 2</b> to unbrick and restore the TV!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs"
          >
            {lang === 'am' ? 'ገባኝ (Close)' : 'Close Guide'}
          </button>
        </div>
      </div>
    </div>
  );
};
