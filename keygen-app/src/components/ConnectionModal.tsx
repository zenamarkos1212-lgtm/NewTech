import React, { useState } from 'react';
import { ConnectionType, Language } from '../types/tv';
import { translations } from '../constants/translations';
import { SerialService } from '../services/serialService';
import {
  Usb,
  Wifi,
  Cpu,
  X,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sliders,
} from 'lucide-react';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionType: ConnectionType;
  onChangeConnectionType: (type: ConnectionType) => void;
  onConnectOtg: (baudRate: number) => Promise<void>;
  onConnectWireless: (ip: string, port: number) => Promise<void>;
  onDisconnect: () => Promise<void>;
  isConnected: boolean;
  currentBaudRate: number;
  onBaudRateChange: (baud: number) => void;
  wirelessIp: string;
  wirelessPort: number;
  onWirelessConfigChange: (ip: string, port: number) => void;
  lang: Language;
  onToggleSignals?: (dtr: boolean, rts: boolean) => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  connectionType,
  onChangeConnectionType,
  onConnectOtg,
  onConnectWireless,
  onDisconnect,
  isConnected,
  currentBaudRate,
  onBaudRateChange,
  wirelessIp,
  wirelessPort,
  onWirelessConfigChange,
  lang,
  onToggleSignals,
}) => {
  const t = translations[lang];
  const [ipInput, setIpInput] = useState(wirelessIp);
  const [portInput, setPortInput] = useState(wirelessPort.toString());
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isSerialSupported = SerialService.isSupported();

  if (!isOpen) return null;

  const handleConnect = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (connectionType === 'otg') {
        await onConnectOtg(currentBaudRate);
      } else if (connectionType === 'wireless') {
        const port = parseInt(portInput, 10) || 81;
        onWirelessConfigChange(ipInput, port);
        await onConnectWireless(ipInput, port);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const baudRates = [9600, 19200, 38400, 57600, 115200, 230400, 921600, 1500000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="bg-[#10141e] border border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl text-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-slate-100">
              {t.connectionMode}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2">
          {/* OTG Mode */}
          <button
            onClick={() => onChangeConnectionType('otg')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
              connectionType === 'otg'
                ? 'bg-amber-500/10 border-amber-400 text-amber-400 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Usb className="w-5 h-5" />
            <span className="text-xs">{t.otgUsb}</span>
          </button>

          {/* Wireless Mode */}
          <button
            onClick={() => onChangeConnectionType('wireless')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
              connectionType === 'wireless'
                ? 'bg-amber-500/10 border-amber-400 text-amber-400 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Wifi className="w-5 h-5" />
            <span className="text-xs">{t.wirelessEsp}</span>
          </button>

          {/* Simulator Mode */}
          <button
            onClick={() => onChangeConnectionType('simulator')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
              connectionType === 'simulator'
                ? 'bg-amber-500/10 border-amber-400 text-amber-400 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Cpu className="w-5 h-5" />
            <span className="text-xs">{t.simulator}</span>
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* OTG Mode Settings */}
        {connectionType === 'otg' && (
          <div className="space-y-3 bg-[#0a0d14] p-3.5 rounded-xl border border-slate-800/80">
            {!isSerialSupported && (
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Web Serial API Not Detected</p>
                  <p className="text-[11px] text-amber-400/90 mt-0.5">
                    For direct USB-OTG, open Chrome on Android or PC. Alternatively, use the <b>Wireless / WiFi</b> mode!
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-300 font-semibold mb-1 block">
                {t.baudRate} (Standard TV: 115200)
              </label>
              <select
                value={currentBaudRate}
                onChange={(e) => onBaudRateChange(Number(e.target.value))}
                className="w-full bg-[#121622] border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-100 focus:border-amber-400"
              >
                {baudRates.map((b) => (
                  <option key={b} value={b}>
                    {b} baud {b === 115200 ? '(Default - MStar / MTK / RTK)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <p className="font-bold text-slate-300">OTG Cable Instructions:</p>
              <p>1. Connect Phone to OTG Adapter (Type-C / Micro-USB).</p>
              <p>2. Plug CH340 / CP2102 / FTDI USB-TTL into the OTG cable.</p>
              <p>3. Tap "Connect OTG" and allow USB serial permission.</p>
            </div>
          </div>
        )}

        {/* Wireless Mode Settings */}
        {connectionType === 'wireless' && (
          <div className="space-y-3 bg-[#0a0d14] p-3.5 rounded-xl border border-slate-800/80">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-xs text-slate-300 font-semibold mb-1 block">
                  {lang === 'am' ? 'የዋይፋይ አይፒ አድራሻ (IP Address)' : 'WiFi Bridge IP Address'}
                </label>
                <input
                  type="text"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  placeholder="192.168.4.1"
                  className="w-full bg-[#121622] border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-100 focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">
                  Port
                </label>
                <input
                  type="text"
                  value={portInput}
                  onChange={(e) => setPortInput(e.target.value)}
                  placeholder="81"
                  className="w-full bg-[#121622] border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-100 focus:border-amber-400"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <p className="font-bold text-slate-300">{lang === 'am' ? 'የዋይፋይ ግንኙነት መመሪያ፦' : 'WiFi Connection Instructions:'}</p>
              <p>1. {lang === 'am' ? 'ስልክዎን ከዋይፋይ ኔትወርኩ ጋር ያገናኙ።' : 'Connect your phone or PC to the WiFi network.'}</p>
              <p>2. {lang === 'am' ? 'ነባሪውን IP (192.168.4.1) እና Port (81) በማረጋገጥ አገናኝ የሚለውን ይጫኑ።' : 'Verify IP and Port (default 192.168.4.1 / 81) and tap Connect.'}</p>
            </div>
          </div>
        )}

        {/* Simulator Mode Settings */}
        {connectionType === 'simulator' && (
          <div className="bg-[#0a0d14] p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulator Mode Active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              In Simulator Mode, you do not need physical cables. You can test and inspect real U-Boot bootloader sequences and TV recovery commands (MStar, MediaTek, Realtek, HiSilicon, Amlogic) directly in the console!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          {isConnected ? (
            <button
              onClick={async () => {
                await onDisconnect();
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading || (connectionType === 'otg' && !isSerialSupported)}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs transition shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
