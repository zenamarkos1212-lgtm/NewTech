import React, { useState } from 'react';
import { Language } from '../types/tv';
import { translations } from '../constants/translations';
import { ESP8266_ARDUINO_SKETCH } from '../constants/esp8266Sketch';
import { X, Copy, Check, Download, Code2, Sparkles } from 'lucide-react';

interface ESP8266FirmwareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ESP8266FirmwareModal: React.FC<ESP8266FirmwareModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(ESP8266_ARDUINO_SKETCH);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([ESP8266_ARDUINO_SKETCH], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NewTech_ESP8266_TV_Bridge.ino';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
      <div className="bg-[#10141e] border border-slate-800 rounded-2xl max-w-3xl w-full p-5 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm sm:text-base text-slate-100">
              {t.firmwareTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between gap-2 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Arduino IDE • ESP8266WiFi &amp; WebSocketsServer</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{t.codeCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.copyCode}</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.downloadCode}</span>
            </button>
          </div>
        </div>

        {/* Code viewer */}
        <div className="flex-1 overflow-y-auto bg-[#05070b] border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 custom-scrollbar select-text leading-relaxed">
          <pre>{ESP8266_ARDUINO_SKETCH}</pre>
        </div>

        {/* Footer instructions */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <p>
            1. Install "WebSockets" by Markus Sattler in Arduino Library Manager.
            <br />
            2. Flash sketch to NodeMCU / Wemos D1 Mini at 115200 baud.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs ml-2 flex-shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
