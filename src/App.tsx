import React, { useState, useEffect, useMemo } from 'react';
import { ConnectionType, ChipsetId, ConsoleMessage, Language } from './types/tv';
import { CHIPSETS } from './constants/chipsets';
import { translations } from './constants/translations';
import { SerialService } from './services/serialService';
import { WifiService } from './services/wifiService';
import { SimulatorService } from './services/simulatorService';
import { audioTestPlayer } from './services/audioTestPlayer';
import { isAppActivated } from './services/activationService';
import { Header } from './components/Header';
import { ConsoleTabs } from './components/ConsoleTabs';
import { ChipsetSelector } from './components/ChipsetSelector';
import { ActionGrid } from './components/ActionGrid';
import { TerminalView } from './components/TerminalView';
import { ConnectionModal } from './components/ConnectionModal';
import { HardwareGuideModal } from './components/HardwareGuideModal';
import { TVRemoteModal } from './components/TVRemoteModal';
import { AppSplashScreen } from './components/AppSplashScreen';
import { ActivationScreen } from './components/ActivationScreen';
import { TesfayeKeygenApp } from './components/TesfayeKeygenApp';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Tv, Sparkles, ShieldCheck } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('am'); // Default to Amharic as requested by user
  
  // Check if private Keygen mode was opened by Tesfaye
  const isKeygenRoute = typeof window !== 'undefined' && (
    window.location.pathname.includes('keygen') ||
    window.location.search.includes('keygen') ||
    window.location.search.includes('admin')
  );

  if (isKeygenRoute) {
    return <TesfayeKeygenApp />;
  }

  // App Startup Splash & Security Activation State
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isActivated, setIsActivated] = useState<boolean>(() => isAppActivated());

  const [connectionType, setConnectionType] = useState<ConnectionType>('simulator');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [activeChipset, setActiveChipset] = useState<ChipsetId>('mstar');
  const [activeConsole, setActiveConsole] = useState<number>(1);
  const [baudRate, setBaudRate] = useState<number>(115200);
  const [wirelessIp, setWirelessIp] = useState<string>('192.168.4.1');
  const [wirelessPort, setWirelessPort] = useState<number>(81);
  const [statusText, setStatusText] = useState<string>('Connecting....Connect');

  // Modals
  const [isConnModalOpen, setIsConnModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isRemoteModalOpen, setIsRemoteModalOpen] = useState(false);

  // 5 Separate Console buffers (CONSOLE 1 to 5)
  const [consolesData, setConsolesData] = useState<Record<number, ConsoleMessage[]>>({
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  });

  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });

  // Services
  const serialService = useMemo(() => new SerialService(), []);
  const wifiService = useMemo(() => new WifiService(), []);
  const simulatorService = useMemo(() => new SimulatorService(), []);

  const activeChipsetInfo = useMemo(() => {
    return CHIPSETS.find((c) => c.id === activeChipset) || CHIPSETS[0];
  }, [activeChipset]);

  const appendToConsole = (
    consoleId: number,
    text: string,
    type: 'rx' | 'tx' | 'system' | 'error' | 'success' = 'rx'
  ) => {
    const time = new Date().toLocaleTimeString();
    const newMsg: ConsoleMessage = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: time,
      type,
      text,
    };

    setConsolesData((prev) => ({
      ...prev,
      [consoleId]: [...(prev[consoleId] || []), newMsg],
    }));

    if (consoleId !== activeConsole) {
      setUnreadCounts((prev) => ({
        ...prev,
        [consoleId]: (prev[consoleId] || 0) + 1,
      }));
    }
  };

  // Wire incoming data from services to the active console
  useEffect(() => {
    if (!isActivated) return;

    const handleData = (text: string) => {
      appendToConsole(activeConsole, text, 'rx');
    };

    serialService.setOnData(handleData);
    wifiService.setOnData(handleData);
    simulatorService.setOnData(handleData);

    serialService.setOnStatusChange((connected, err) => {
      setIsConnected(connected);
      if (connected) {
        setStatusText(`OTG Connected @ ${baudRate}`);
        appendToConsole(activeConsole, `[OTG] Connected to USB Serial @ ${baudRate} baud`, 'system');
      } else {
        setStatusText('Disconnected');
        if (err) appendToConsole(activeConsole, `[OTG Error] ${err}`, 'error');
      }
    });

    wifiService.setOnStatusChange((connected, err) => {
      setIsConnected(connected);
      if (connected) {
        setStatusText(`WiFi Bridge Connected`);
        appendToConsole(activeConsole, `[WiFi] Connected to ${wirelessIp}:${wirelessPort}`, 'system');
      } else {
        setStatusText('Disconnected');
        if (err) appendToConsole(activeConsole, `[WiFi Error] ${err}`, 'error');
      }
    });

    // Start default simulation
    if (connectionType === 'simulator') {
      simulatorService.start(activeChipset);
      setStatusText('Connecting....Connect');
      setTimeout(() => {
        setIsConnected(true);
        setStatusText('Connected (Sim: MStar)');
      }, 800);
    }

    return () => {
      simulatorService.stop();
    };
  }, [activeConsole, activeChipset, baudRate, wirelessIp, wirelessPort, connectionType, isActivated]);

  // Handle switching active console tab
  const handleSelectConsole = (id: number) => {
    setActiveConsole(id);
    setUnreadCounts((prev) => ({ ...prev, [id]: 0 }));
  };

  // Handle chipset change
  const handleSelectChipset = (id: ChipsetId) => {
    setActiveChipset(id);
    const info = CHIPSETS.find((c) => c.id === id);
    if (info) {
      setBaudRate(info.defaultBaudRate);
      appendToConsole(
        activeConsole,
        `[CHIPSET] Switched target to ${info.name} (${info.tagline}). Boot Prompt: "${info.bootPrompt}"`,
        'system'
      );
      if (connectionType === 'simulator') {
        simulatorService.stop();
        simulatorService.start(id);
        setStatusText(`Connected (Sim: ${info.name})`);
      }
    }
  };

  // Handle sending commands
  const handleSendCommand = async (command: string, label?: string) => {
    if (!command.trim()) return;

    // Log TX command to current console
    appendToConsole(activeConsole, command, 'tx');

    // Trigger audio test if action was audio test
    if (command.includes('audio') || command.includes('beep') || command.includes('tone')) {
      audioTestPlayer.playTestTone(1000, 500);
    }

    try {
      if (connectionType === 'otg') {
        await serialService.write(command);
      } else if (connectionType === 'wireless') {
        await wifiService.send(command);
      } else if (connectionType === 'simulator') {
        simulatorService.handleCommand(command);
      }
    } catch (err: any) {
      appendToConsole(activeConsole, `[TX Error] ${err.message}`, 'error');
    }
  };

  // Connect OTG
  const handleConnectOtg = async (selectedBaud: number) => {
    setConnectionType('otg');
    simulatorService.stop();
    setStatusText('Connecting OTG...');
    await serialService.connect(selectedBaud);
  };

  // Connect Wireless
  const handleConnectWireless = async (ip: string, port: number) => {
    setConnectionType('wireless');
    simulatorService.stop();
    setStatusText(`Connecting ${ip}:${port}...`);
    await wifiService.connect(ip, port);
  };

  // Disconnect
  const handleDisconnect = async () => {
    if (connectionType === 'otg') {
      await serialService.disconnect();
    } else if (connectionType === 'wireless') {
      wifiService.disconnect();
    } else if (connectionType === 'simulator') {
      simulatorService.stop();
      setIsConnected(false);
      setStatusText('Disconnected');
    }
  };

  const handleChangeConnectionType = (type: ConnectionType) => {
    setConnectionType(type);
    if (type === 'simulator') {
      simulatorService.start(activeChipset);
      setIsConnected(true);
      setStatusText(`Connected (Sim: ${activeChipsetInfo.name})`);
    } else {
      simulatorService.stop();
      setIsConnected(false);
      setStatusText('Disconnected');
    }
  };

  const handleClearCurrentConsole = () => {
    setConsolesData((prev) => ({
      ...prev,
      [activeConsole]: [],
    }));
  };

  // 1. First: Show App Startup Splash Screen with the uploaded Logo
  if (showSplash) {
    return <AppSplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. Second: If not activated, require Elimagu-style Activation Key
  if (!isActivated) {
    return (
      <ActivationScreen
        onActivated={() => setIsActivated(true)}
        lang={lang}
      />
    );
  }

  // 3. Third: Main Active App Workspace
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans select-none animate-in fade-in duration-300">
      {/* Header with Ethiopian New-Tech Institute Branding & TV Remote button */}
      <Header
        connectionType={connectionType}
        isConnected={isConnected}
        statusText={statusText}
        onOpenConnectionModal={() => setIsConnModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenRemoteModal={() => setIsRemoteModalOpen(true)}
        lang={lang}
        onToggleLang={() => setLang(lang === 'am' ? 'en' : 'am')}
      />

      {/* Top Consoles Tabs (CONSOLE 1, CONSOLE 2, CONSOLE 3, CONSOLE 4, CONSOLE 5) */}
      <ConsoleTabs
        activeConsole={activeConsole}
        onSelectConsole={handleSelectConsole}
        unreadCounts={unreadCounts}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
        {/* Left Column: Chipset Matrix + Action Grid */}
        <div className="lg:col-span-6 flex flex-col gap-3 sm:gap-4">
          {/* Chipset Brand Cards */}
          <ChipsetSelector
            activeChipset={activeChipset}
            onSelectChipset={handleSelectChipset}
            lang={lang}
          />

          {/* Quick TV Remote Banner Button */}
          <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-xs text-amber-300">
                  {lang === 'am' ? 'ሁለንተናዊ የቻይና እና ስማርት ቲቪ ሪሞት' : 'Universal China & Smart TV Remote'}
                </h4>
                <p className="text-[10.5px] text-slate-400 font-mono">
                  {lang === 'am' ? 'ሁሉንም የቻይና ቲቪዎች እና ሰርቪስ ሜኑ ኮዶች ይዟል' : 'Includes all Chinese TV brands & 1-Click service codes'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsRemoteModalOpen(true)}
              className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
            >
              <span>{lang === 'am' ? 'ሪሞቱን ክፈት' : 'Open Remote'}</span>
            </button>
          </div>

          {/* Recovery Actions Grid */}
          <ActionGrid
            currentChipset={activeChipset}
            onSendCommand={handleSendCommand}
            lang={lang}
          />
        </div>

        {/* Right Column: Interactive Terminal Screen */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <TerminalView
            consoleId={activeConsole}
            messages={consolesData[activeConsole] || []}
            onSendCommand={handleSendCommand}
            onClear={handleClearCurrentConsole}
            lang={lang}
            isConnected={isConnected}
            activeChipsetPrompt={activeChipsetInfo.bootPrompt}
          />

          {/* Quick Technician Info Strip & Developer Credit */}
          <div className="bg-[#0b0e14] border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-amber-400 font-bold">Interrupt: </span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                  {activeChipsetInfo.interruptKey}
                </kbd>
              </div>
              <div>
                <span className="text-sky-400 font-bold">Baud: </span>
                <span>{activeChipsetInfo.defaultBaudRate}</span>
              </div>
            </div>

            {/* License & Developer Credit */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>ACTIVATED</span>
              </span>
              <div className="flex items-center gap-1.5 text-amber-400/90 font-semibold text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'am' ? 'በተስፋዬ ሀይሉ ገላው የተሰራ' : 'Developed by Tesfaye Hailu Gellaw'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Connection Modal (OTG & Wireless configuration) */}
      <ConnectionModal
        isOpen={isConnModalOpen}
        onClose={() => setIsConnModalOpen(false)}
        connectionType={connectionType}
        onChangeConnectionType={handleChangeConnectionType}
        onConnectOtg={handleConnectOtg}
        onConnectWireless={handleConnectWireless}
        onDisconnect={handleDisconnect}
        isConnected={isConnected}
        currentBaudRate={baudRate}
        onBaudRateChange={setBaudRate}
        wirelessIp={wirelessIp}
        wirelessPort={wirelessPort}
        onWirelessConfigChange={(ip, port) => {
          setWirelessIp(ip);
          setWirelessPort(port);
        }}
        lang={lang}
      />

      {/* Hardware Pinout Guide Modal */}
      <HardwareGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        lang={lang}
      />

      {/* TV Remote Modal (With all Chinese TV Brands & Chassis) */}
      <TVRemoteModal
        isOpen={isRemoteModalOpen}
        onClose={() => setIsRemoteModalOpen(false)}
        lang={lang}
        onSendCommand={handleSendCommand}
      />

      {/* PWA Offline Indicator */}
      <OfflineIndicator lang={lang} />
    </div>
  );
}
