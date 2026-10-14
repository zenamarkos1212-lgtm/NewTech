import React, { useState } from 'react';
import { ChipsetId, Language } from '../types/tv';
import { translations } from '../constants/translations';
import { getChipsetCommand } from '../constants/chipsets';
import {
  RotateCcw,
  HelpCircle,
  FlipHorizontal,
  Sun,
  HardDrive,
  Radio,
  Volume2,
  Image as ImageIcon,
  Trash2,
  ShieldAlert,
  Zap,
  Flame,
} from 'lucide-react';

interface ActionGridProps {
  currentChipset: ChipsetId;
  onSendCommand: (command: string, label: string) => void;
  lang: Language;
  disabled?: boolean;
}

export const ActionGrid: React.FC<ActionGridProps> = ({
  currentChipset,
  onSendCommand,
  lang,
  disabled = false,
}) => {
  const t = translations[lang];
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    actionId: string;
    cmd: string;
    title: string;
  } | null>(null);

  const handleActionClick = (actionId: string, title: string, requiresConfirm = false) => {
    const cmd = getChipsetCommand(actionId, currentChipset);
    if (requiresConfirm) {
      setConfirmModal({
        open: true,
        actionId,
        cmd,
        title,
      });
      return;
    }
    onSendCommand(cmd, title);
  };

  const handleConfirm = () => {
    if (confirmModal) {
      onSendCommand(confirmModal.cmd, confirmModal.title);
      setConfirmModal(null);
    }
  };

  return (
    <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3 sm:p-4 shadow-lg flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-200 tracking-wide uppercase">
            {t.actions}
          </h2>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Target: <span className="text-amber-400 font-bold uppercase">{currentChipset}</span>
        </span>
      </div>

      {/* Primary Action Button Grid (Modeled on Image 1) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {/* Row 1: RECOVERY 2 | RECOVERY 1 */}
        <button
          disabled={disabled}
          onClick={() => handleActionClick('recovery2', t.action_recovery2, true)}
          className="group relative flex flex-col items-center justify-center p-3 rounded-lg border-2 border-slate-600 bg-[#161a24] text-white hover:bg-red-950/40 hover:border-red-500 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <span className="font-mono font-black text-xs sm:text-sm tracking-wider text-red-400 group-hover:text-red-300">
            {t.action_recovery2}
          </span>
          <span className="text-[9px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]">
            {getChipsetCommand('recovery2', currentChipset)}
          </span>
        </button>

        <button
          disabled={disabled}
          onClick={() => handleActionClick('recovery1', t.action_recovery1)}
          className="group relative flex flex-col items-center justify-center p-3 rounded-lg border-2 border-slate-600 bg-[#161a24] text-white hover:bg-emerald-950/40 hover:border-emerald-500 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <span className="font-mono font-black text-xs sm:text-sm tracking-wider text-emerald-400 group-hover:text-emerald-300">
            {t.action_recovery1}
          </span>
          <span className="text-[9px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]">
            {getChipsetCommand('recovery1', currentChipset)}
          </span>
        </button>
      </div>

      {/* Row 2: REST | HELP | MIRROR ON */}
      <div className="grid grid-cols-3 gap-2">
        <button
          disabled={disabled}
          onClick={() => handleActionClick('reset', t.action_reset)}
          className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-600 bg-[#161a24] text-white hover:bg-slate-800 hover:border-slate-400 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4 text-amber-400 mb-1" />
          <span className="font-mono font-bold text-[11px] sm:text-xs tracking-wider">
            {t.action_reset}
          </span>
        </button>

        <button
          disabled={disabled}
          onClick={() => handleActionClick('help', t.action_help)}
          className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-600 bg-[#161a24] text-white hover:bg-slate-800 hover:border-slate-400 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400 mb-1" />
          <span className="font-mono font-bold text-[11px] sm:text-xs tracking-wider">
            {t.action_help}
          </span>
        </button>

        <button
          disabled={disabled}
          onClick={() => handleActionClick('mirror', t.action_mirror)}
          className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-600 bg-[#161a24] text-white hover:bg-sky-950/50 hover:border-sky-400 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <FlipHorizontal className="w-4 h-4 text-sky-400 mb-1" />
          <span className="font-mono font-bold text-[11px] sm:text-xs tracking-wider">
            {t.action_mirror}
          </span>
        </button>
      </div>

      {/* Row 3: TURN ON BACK LIGHT | BOOT1 BOOT2 SHOW */}
      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={disabled}
          onClick={() => handleActionClick('backlight', t.action_backlight)}
          className="flex items-center justify-center gap-1.5 p-3 rounded-lg border border-slate-600 bg-[#161a24] text-white hover:bg-amber-950/40 hover:border-amber-400 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="font-mono font-bold text-[11px] sm:text-xs tracking-wide">
            {t.action_backlight}
          </span>
        </button>

        <button
          disabled={disabled}
          onClick={() => handleActionClick('bootInfo', t.action_bootInfo)}
          className="flex items-center justify-center gap-1.5 p-3 rounded-lg border border-slate-600 bg-[#161a24] text-white hover:bg-indigo-950/40 hover:border-indigo-400 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <HardDrive className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="font-mono font-bold text-[11px] sm:text-xs tracking-wide">
            {t.action_bootInfo}
          </span>
        </button>
      </div>

      {/* Row 4: UART ON | UART OFF | AUDIO TEST */}
      <div className="grid grid-cols-3 gap-2">
        <button
          disabled={disabled}
          onClick={() => handleActionClick('uartOn', t.action_uartOn)}
          className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-600 bg-[#161a24] text-white hover:bg-emerald-950/50 hover:border-emerald-400 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <Radio className="w-4 h-4 text-emerald-400 mb-1" />
          <span className="font-mono font-bold text-[11px] sm:text-xs">
            {t.action_uartOn}
          </span>
        </button>

        <button
          disabled={disabled}
          onClick={() => handleActionClick('uartOff', t.action_uartOff)}
          className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-600 bg-[#161a24] text-white hover:bg-rose-950/50 hover:border-rose-400 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <Radio className="w-4 h-4 text-rose-400 mb-1 opacity-70" />
          <span className="font-mono font-bold text-[11px] sm:text-xs">
            {t.action_uartOff}
          </span>
        </button>

        <button
          disabled={disabled}
          onClick={() => handleActionClick('audioTest', t.action_audioTest)}
          className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-600 bg-[#161a24] text-white hover:bg-purple-950/50 hover:border-purple-400 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <Volume2 className="w-4 h-4 text-purple-400 mb-1" />
          <span className="font-mono font-bold text-[11px] sm:text-xs">
            {t.action_audioTest}
          </span>
        </button>
      </div>

      {/* Row 5: SHOW LOGO | DELETE LOGO */}
      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={disabled}
          onClick={() => handleActionClick('showLogo', t.action_showLogo)}
          className="flex items-center justify-center gap-1.5 p-3 rounded-lg border border-slate-600 bg-[#161a24] text-white hover:bg-cyan-950/40 hover:border-cyan-400 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <ImageIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="font-mono font-bold text-[11px] sm:text-xs">
            {t.action_showLogo}
          </span>
        </button>

        <button
          disabled={disabled}
          onClick={() => handleActionClick('deleteLogo', t.action_deleteLogo, true)}
          className="flex items-center justify-center gap-1.5 p-3 rounded-lg border border-slate-600 bg-[#161a24] text-white hover:bg-rose-950/40 hover:border-rose-500 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span className="font-mono font-bold text-[11px] sm:text-xs text-rose-300">
            {t.action_deleteLogo}
          </span>
        </button>
      </div>

      {/* Extra Professional Tools */}
      <div className="pt-2 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          disabled={disabled}
          onClick={() => handleActionClick('usbUpdate', t.action_usbUpdate)}
          className="p-2 rounded bg-slate-900 border border-slate-700 hover:border-amber-400 text-[10px] font-mono text-slate-300 flex items-center justify-center gap-1 transition"
        >
          <Zap className="w-3 h-3 text-amber-400" />
          <span>{t.action_usbUpdate}</span>
        </button>

        <button
          disabled={disabled}
          onClick={() => handleActionClick('panelVesa', t.action_panelVesa)}
          className="p-2 rounded bg-slate-900 border border-slate-700 hover:border-sky-400 text-[10px] font-mono text-slate-300 flex items-center justify-center gap-1 transition"
        >
          <span>{t.action_panelVesa}</span>
        </button>

        <button
          disabled={disabled}
          onClick={() => handleActionClick('enterBootloader', t.action_enterBootloader)}
          className="p-2 rounded bg-slate-900 border border-slate-700 hover:border-emerald-400 text-[10px] font-mono text-slate-300 flex items-center justify-center gap-1 transition"
        >
          <Flame className="w-3 h-3 text-emerald-400" />
          <span>{t.action_enterBootloader}</span>
        </button>

        <button
          disabled={disabled}
          onClick={() => handleActionClick('eraseFlash', t.action_eraseFlash, true)}
          className="p-2 rounded bg-red-950/30 border border-red-900/60 hover:border-red-500 text-[10px] font-mono text-red-300 flex items-center justify-center gap-1 transition"
        >
          <ShieldAlert className="w-3 h-3 text-red-400" />
          <span>{t.action_eraseFlash}</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="bg-[#121620] border-2 border-red-500/80 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3 text-red-400 mb-2">
              <ShieldAlert className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-base">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-slate-300 mb-3">{t.confirmActionDesc}</p>
            <div className="bg-black/60 rounded p-2.5 font-mono text-[11px] text-amber-300 border border-slate-800 mb-4 break-all">
              Command: {confirmModal.cmd}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-900/40"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
