import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Usb, Search, Cpu, Activity, Terminal,
  RefreshCw, ShieldCheck, AlertTriangle, X,
  Play, Square, Radio, Zap
} from 'lucide-react';

interface UsbDevice {
  deviceId: number;
  vendorId: number;
  productId: number;
  deviceName: string;
  manufacturer: string;
  product: string;
  hasPermission: boolean;
  driver: string;
  portCount: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConnectOtg: (baud: number) => Promise<void>;
  onSendCommand: (command: string, label?: string) => void;
  onScanDevices: () => Promise<{
    devices: UsbDevice[];
    count: number;
  }>;
  onSetBaudRate: (baud: number) => Promise<void>;
  onSendBreak: (duration?: number) => Promise<void>;
  isConnected: boolean;
  bootLog: string;
  lang: 'am' | 'en';
}

const BAUD_RATES = [9600, 19200, 38400, 57600, 115200];

const wait = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const BootloopRecoveryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConnectOtg,
  onSendCommand,
  onScanDevices,
  onSetBaudRate,
  onSendBreak,
  isConnected,
  bootLog,
  lang
}) => {
  const [baud, setBaud] = useState(115200);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [message, setMessage] = useState('');
  const [devices, setDevices] = useState<UsbDevice[]>([]);
  const [cycle, setCycle] = useState(0);
  const [commandCount, setCommandCount] = useState(0);
  const [lastDetectedBaud, setLastDetectedBaud] = useState<number | null>(null);

  const stopRef = useRef(false);
  const bootLogRef = useRef(bootLog);

  useEffect(() => {
    bootLogRef.current = bootLog;
  }, [bootLog]);

  useEffect(() => {
    return () => {
      stopRef.current = true;
    };
  }, []);

  const detected = useMemo(() => {
    const log = bootLog.toLowerCase();

    const profiles = [
      { name: 'Amlogic', patterns: ['amlogic', 'meson', 'gxl', 'g12a', 'sm1', 's905'] },
      { name: 'MediaTek', patterns: ['mediatek', 'mtk', 'mt55', 'mt56', 'mt963'] },
      { name: 'MStar', patterns: ['mstar', 'mst6', 'mst7', 'eagle', 'ursa'] },
      { name: 'Realtek', patterns: ['realtek', 'rtk', 'rtd'] },
      { name: 'Rockchip', patterns: ['rockchip', 'rk30', 'rk32', 'rk33', 'rk35'] },
      { name: 'Novatek', patterns: ['novatek', 'nt726'] },
      { name: 'HiSilicon', patterns: ['hisilicon', 'hi3798', 'hi3751'] }
    ];

    const matches = profiles.filter(profile =>
      profile.patterns.some(pattern => log.includes(pattern))
    );

    if (!log.trim()) return 'Not detected — waiting for boot log';
    return matches.length
      ? matches.map(item => item.name).join(', ')
      : 'Unknown chipset — inspect boot log';
  }, [bootLog]);

  const bootStatus = useMemo(() => {
    const log = bootLog.toLowerCase();

    if (!log.trim()) return 'NO BOOT LOG';
    if (/kernel panic|watchdog|fatal exception/.test(log)) return 'KERNEL ERROR';
    if (/emmc.*(error|fail)|mmc.*(error|fail)/.test(log)) return 'STORAGE ERROR';
    if (/bootloop|boot loop|rebooting|restart/.test(log)) return 'BOOTLOOP DETECTED';
    if (/android init|starting kernel|boot complete/.test(log)) return 'BOOT ACTIVITY FOUND';

    return 'LOG RECEIVED — ANALYZING';
  }, [bootLog]);

  if (!isOpen) return null;

  const connect = async () => {
    setBusy(true);
    setMessage('Connecting USB serial...');
    try {
      await onConnectOtg(baud);
      setMessage(`Connected at ${baud} baud. Power-cycle the TV to capture boot log.`);
    } catch (error: any) {
      setMessage(error?.message || 'USB connection failed.');
    } finally {
      setBusy(false);
    }
  };

  const scanUsb = async () => {
    setScanning(true);
    setMessage('Scanning Android USB devices...');

    try {
      const result = await onScanDevices();
      setDevices(result.devices || []);

      if (!result.count) {
        setMessage('No USB devices found. Check OTG cable and adapter.');
      } else {
        setMessage(`${result.count} USB device(s) detected.`);
      }
    } catch (error: any) {
      setMessage(error?.message || 'USB scan failed.');
    } finally {
      setScanning(false);
    }
  };

  const changeBaud = async (rate: number) => {
    setBaud(rate);

    if (!isConnected) return;

    try {
      await onSetBaudRate(rate);
      setMessage(`UART baud rate changed to ${rate}.`);
    } catch (error: any) {
      setMessage(error?.message || 'Baud rate change failed.');
    }
  };

  const sendBreak = async () => {
    if (!isConnected) return;

    setBusy(true);
    try {
      await onSendBreak(150);
      setMessage(`UART BREAK pulse sent at ${baud} baud.`);
    } catch (error: any) {
      setMessage(error?.message || 'BREAK operation failed.');
    } finally {
      setBusy(false);
    }
  };

  const scanBaudRates = async () => {
    if (!isConnected || scanning || recovering) return;

    setScanning(true);
    setLastDetectedBaud(null);
    setMessage('Starting baud-rate scan...');

    try {
      let found = false;

      for (const rate of BAUD_RATES) {
        if (stopRef.current) break;

        const previousLength = bootLogRef.current.length;

        await onSetBaudRate(rate);
        setBaud(rate);
        setMessage(`Testing ${rate} baud. Waiting for UART data...`);

        await wait(1800);

        if (stopRef.current) break;

        if (bootLogRef.current.length > previousLength) {
          setLastDetectedBaud(rate);
          setMessage(`UART activity detected at ${rate} baud. Verify log readability.`);
          found = true;
          break;
        }
      }

      if (!found && !stopRef.current) {
        setMessage('No new UART data detected. Power-cycle the TV and scan again.');
      }
    } catch (error: any) {
      setMessage(error?.message || 'Baud scan failed.');
    } finally {
      setScanning(false);
    }
  };

  const stopRecovery = () => {
    stopRef.current = true;
    setRecovering(false);
    setScanning(false);
    setBusy(false);
    setMessage('Auto recovery stopped.');
  };

  const startRecovery = async () => {
    if (!isConnected || recovering || scanning) return;

    stopRef.current = false;
    setRecovering(true);
    setCycle(0);
    setCommandCount(0);
    setMessage('Starting safe UART recovery sequence...');

    try {
      for (let i = 0; i < 4; i++) {
        if (stopRef.current) break;

        const rate = BAUD_RATES[i];
        const previousLength = bootLogRef.current.length;

        setCycle(i + 1);
        setMessage(`Recovery cycle ${i + 1}/4 at ${rate} baud`);

        await onSetBaudRate(rate);
        setBaud(rate);
        await wait(400);

        if (stopRef.current) break;

        await onSendBreak(150);
        setCommandCount(count => count + 1);

        setMessage(
          `BREAK pulse sent at ${rate} baud. Waiting for bootloader response...`
        );

        await wait(1800);

        if (stopRef.current) break;

        if (bootLogRef.current.length > previousLength) {
          setLastDetectedBaud(rate);
          setMessage(
            `UART activity detected during cycle ${i + 1}/4 at ${rate} baud.`
          );
          break;
        }
      }

      if (!stopRef.current && !lastDetectedBaud) {
        setMessage(
          'Recovery scan completed. Check UART log and verify the selected baud rate.'
        );
      }
    } catch (error: any) {
      setMessage(error?.message || 'Auto recovery failed.');
    } finally {
      setRecovering(false);
    }
  };

  const am = lang === 'am';

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-3xl max-h-[94vh] overflow-y-auto bg-[#0b0e14] border border-cyan-500/40 rounded-2xl shadow-2xl">

        <div className="sticky top-0 z-10 bg-[#101722] border-b border-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-white tracking-wide">
                NEW TECH BOOTLOOP RECOVERY
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                USB UART • AUTO BAUD • CHIPSET ANALYSIS
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X />
          </button>
        </div>

        <div className="p-4 space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                <Usb className="w-4 h-4" /> USB SERIAL
              </div>
              <div className={`mt-2 font-bold ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isConnected ? 'CONNECTED' : 'NOT CONNECTED'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" /> CHIPSET
              </div>
              <div className="mt-2 text-cyan-300 font-bold text-sm">
                {detected}
              </div>
            </div>
          </div>

          <section className="rounded-xl border border-slate-700 p-3 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              USB AUTO DETECT
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={scanUsb}
                disabled={scanning || busy}
                className="p-3 rounded-lg bg-slate-800 border border-cyan-600 text-cyan-300 text-xs font-bold disabled:opacity-40"
              >
                {scanning ? 'SCANNING...' : 'SCAN USB'}
              </button>

              <button
                onClick={connect}
                disabled={busy || isConnected}
                className="p-3 rounded-lg bg-cyan-600 text-white text-xs font-bold disabled:opacity-40"
              >
                {busy ? 'CONNECTING...' : 'CONNECT OTG'}
              </button>
            </div>

            <div className="space-y-2">
              {devices.map(device => (
                <div
                  key={device.deviceId}
                  className="rounded-lg bg-slate-950 border border-slate-700 p-3 text-[11px] font-mono text-slate-300"
                >
                  <div className="text-cyan-300 font-bold">
                    VID {device.vendorId.toString(16).padStart(4, '0').toUpperCase()}
                    {' / '}
                    PID {device.productId.toString(16).padStart(4, '0').toUpperCase()}
                  </div>
                  <div>Driver: {device.driver}</div>
                  <div>Ports: {device.portCount}</div>
                  <div>Permission: {device.hasPermission ? 'GRANTED' : 'NOT GRANTED'}</div>
                  {device.vendorId === 0x067B && device.productId === 0x2303 && (
                    <div className="text-emerald-400 font-bold mt-1">
                      PL2303 ADAPTER DETECTED
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <select
                value={baud}
                onChange={e => changeBaud(Number(e.target.value))}
                className="flex-1 min-w-0 bg-slate-950 border border-slate-600 rounded-lg p-3 text-white text-sm"
              >
                {BAUD_RATES.map(rate => (
                  <option key={rate} value={rate}>{rate} baud</option>
                ))}
              </select>

              <button
                onClick={scanBaudRates}
                disabled={!isConnected || scanning || recovering}
                className="flex-1 rounded-lg bg-indigo-700 text-white font-bold text-xs px-3 disabled:opacity-40"
              >
                {scanning ? 'SCANNING...' : 'AUTO BAUD SCAN'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={sendBreak}
                disabled={!isConnected || busy || recovering}
                className="p-3 rounded-lg bg-amber-700 text-white text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> BREAK 150ms
              </button>

              <button
                onClick={() => setMessage(
                  `UART log contains ${bootLog.length} characters.`
                )}
                className="p-3 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-bold"
              >
                <Radio className="w-4 h-4 inline mr-1" /> READ LOG
              </button>
            </div>

            {lastDetectedBaud && (
              <div className="text-emerald-400 text-xs font-bold">
                UART ACTIVITY FOUND: {lastDetectedBaud} baud
              </div>
            )}

            {message && (
              <div className="text-xs text-amber-300 break-words bg-slate-950 rounded-lg p-3">
                {message}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-700 p-3 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              BOOTLOOP ANALYSIS
            </h3>

            <div className="bg-slate-950 rounded-lg p-3">
              <div className="text-[10px] text-slate-500">BOOT STATUS</div>
              <div className="text-amber-300 font-bold mt-1">{bootStatus}</div>
              <div className="text-[10px] text-slate-500 mt-3">CHIPSET PROFILE</div>
              <div className="text-cyan-300 font-bold mt-1">{detected}</div>
            </div>

            <div className="max-h-56 overflow-auto bg-black rounded-lg p-3 font-mono text-[10px] text-green-300 whitespace-pre-wrap break-all">
              {bootLog || 'Waiting for UART boot messages...\nConnect TX, RX and GND correctly, then power-cycle the TV.'}
            </div>
          </section>

          <section className="rounded-xl border border-slate-700 p-3 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              AUTO RECOVERY ENGINE
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950 rounded-lg p-2">
                <div className="text-[10px] text-slate-500">CYCLE</div>
                <div className="text-cyan-300 font-bold">{cycle}/4</div>
              </div>
              <div className="bg-slate-950 rounded-lg p-2">
                <div className="text-[10px] text-slate-500">BAUD</div>
                <div className="text-cyan-300 font-bold">{baud}</div>
              </div>
              <div className="bg-slate-950 rounded-lg p-2">
                <div className="text-[10px] text-slate-500">BREAKS</div>
                <div className="text-cyan-300 font-bold">{commandCount}</div>
              </div>
            </div>

            {!recovering ? (
              <button
                onClick={startRecovery}
                disabled={!isConnected || scanning}
                className="w-full p-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> START AUTO RECOVERY
              </button>
            ) : (
              <button
                onClick={stopRecovery}
                className="w-full p-3 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-black flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4" /> STOP AUTO RECOVERY
              </button>
            )}

            <div className="rounded-lg bg-amber-950/30 border border-amber-700/50 p-3 flex gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-[11px] text-amber-200">
                {am
                  ? 'የTV ቦርዱ ትክክለኛ Recovery Protocol ሳይታወቅ Factory Reset, Erase ወይም Flash አትፈጽም።'
                  : 'Do not run Factory Reset, Erase or Flash until the exact board and recovery protocol are verified.'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              SAFE MODE — BREAK ONLY, NO DESTRUCTIVE COMMANDS
            </div>
          </section>

          <button
            onClick={() => setMessage('Power-cycle the TV and capture its UART boot log.')}
            className="w-full p-3 rounded-lg border border-slate-600 text-slate-300 text-xs flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> REFRESH ANALYSIS
          </button>
        </div>
      </div>
    </div>
  );
};
