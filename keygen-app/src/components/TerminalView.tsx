import React, { useState, useEffect, useRef } from 'react';
import { ConsoleMessage, Language } from '../types/tv';
import { translations } from '../constants/translations';
import {
  Terminal as TerminalIcon,
  Send,
  Trash2,
  Download,
  Search,
  ArrowDown,
  CornerDownLeft,
} from 'lucide-react';

interface TerminalViewProps {
  consoleId: number;
  messages: ConsoleMessage[];
  onSendCommand: (cmd: string) => void;
  onClear: () => void;
  lang: Language;
  isConnected: boolean;
  activeChipsetPrompt: string;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  consoleId,
  messages,
  onSendCommand,
  onClear,
  lang,
  isConnected,
  activeChipsetPrompt,
}) => {
  const t = translations[lang];
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const cmd = inputText;
    onSendCommand(cmd);
    setCommandHistory((prev) => [cmd, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(nextIndex);
        setInputText(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputText(commandHistory[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputText('');
      }
    }
  };

  const handleExportLog = () => {
    const content = messages
      .map((m) => `[${m.timestamp}] [${m.type.toUpperCase()}] ${m.text}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TV_CONSOLE_${consoleId}_LOG_${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMessages = searchQuery
    ? messages.filter((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="bg-[#07090e] border border-slate-800 rounded-xl flex flex-col h-[380px] sm:h-[440px] shadow-2xl overflow-hidden font-mono">
      {/* Terminal Toolbar */}
      <div className="bg-[#10141e] border-b border-slate-800 px-3 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">
            CONSOLE {consoleId}
          </span>
          <span className="text-[10px] text-slate-500">
            ({messages.length} lines)
          </span>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
          <div className="relative w-full">
            <Search className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-[#0a0d14] border border-slate-800 rounded pl-7 pr-2 py-1 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-amber-400"
            />
          </div>
        </div>

        {/* Terminal Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded text-[10px] flex items-center gap-1 border transition ${
              autoScroll
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Toggle Auto-Scroll"
          >
            <ArrowDown className="w-3 h-3" />
            <span className="hidden sm:inline">{t.autoScroll}</span>
          </button>

          <button
            onClick={handleExportLog}
            className="p-1.5 rounded text-[10px] flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            title="Download Log"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">{t.export}</span>
          </button>

          <button
            onClick={onClear}
            className="p-1.5 rounded text-[10px] flex items-center gap-1 bg-slate-900 hover:bg-rose-950 text-rose-400 border border-slate-800 hover:border-rose-800 transition"
            title="Clear Console"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">{t.clear}</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Screen */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-1 text-xs select-text bg-[#030508] custom-scrollbar"
      >
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
            <span className="text-2xl opacity-40">💻</span>
            <p className="text-xs">No UART data received on Console {consoleId} yet.</p>
            <p className="text-[11px] text-slate-500">
              Connect via OTG or WiFi Bridge, or send commands below.
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            let color = 'text-emerald-400';
            if (msg.type === 'tx') color = 'text-amber-300 font-bold';
            if (msg.type === 'system') color = 'text-cyan-400';
            if (msg.type === 'error') color = 'text-rose-400';
            if (msg.type === 'success') color = 'text-lime-300';

            return (
              <div key={msg.id} className="leading-relaxed break-words whitespace-pre-wrap font-mono">
                <span className="text-[10px] text-slate-600 mr-2 select-none">
                  [{msg.timestamp}]
                </span>
                {msg.type === 'tx' && (
                  <span className="text-amber-500 font-bold mr-1 select-none">&gt;&gt;</span>
                )}
                <span className={color}>{msg.text}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Signal Interrupters (Ctrl+C, Enter, ESC, Space) */}
      <div className="bg-[#0b0e14] border-t border-slate-800/80 px-2 py-1 flex items-center gap-1 overflow-x-auto text-[10px]">
        <span className="text-slate-500 font-bold text-[9px] uppercase px-1">Quick Keys:</span>
        <button
          onClick={() => onSendCommand('\x03')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-800"
          title="Send ASCII 0x03 (SIGINT / Break)"
        >
          Ctrl+C (Break)
        </button>
        <button
          onClick={() => onSendCommand('\r\n')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800"
          title="Send Carriage Return"
        >
          Enter
        </button>
        <button
          onClick={() => onSendCommand('\x1b')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-800"
          title="Send Escape key"
        >
          ESC
        </button>
        <button
          onClick={() => onSendCommand(' ')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          title="Send Space key"
        >
          Space
        </button>
        <button
          onClick={() => onSendCommand('c')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-yellow-300 border border-slate-800"
          title="Send MediaTek halt key 'c'"
        >
          'c' (MTK Halt)
        </button>
      </div>

      {/* Command Input Bar */}
      <form
        onSubmit={handleSend}
        className="bg-[#0f131d] border-t border-slate-800 p-2 flex items-center gap-2"
      >
        <div className="text-emerald-400 font-bold text-xs pl-1 select-none flex-shrink-0">
          {activeChipsetPrompt}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.commandPlaceholder}
          className="flex-1 bg-black/60 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-amber-400 font-mono"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1 shadow transition active:scale-95 flex-shrink-0"
        >
          <Send className="w-3 h-3" />
          <span className="hidden sm:inline">{t.send}</span>
        </button>
      </form>
    </div>
  );
};
