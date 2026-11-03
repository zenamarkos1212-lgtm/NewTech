import React from 'react';

interface ConsoleTabsProps {
  activeConsole: number;
  onSelectConsole: (id: number) => void;
  unreadCounts: Record<number, number>;
}

export const ConsoleTabs: React.FC<ConsoleTabsProps> = ({
  activeConsole,
  onSelectConsole,
  unreadCounts,
}) => {
  // Styles directly inspired by Image 1:
  // Console 1: Orange/Coral
  // Console 2: Sky Blue
  // Console 3: Mint Green
  // Console 4: Emerald Green
  // Console 5: Purple
  const consoles = [
    {
      id: 1,
      name: 'CONSOLE 1',
      bgClass: 'bg-[#ff5722]',
      borderClass: 'border-[#ff7043]',
      activeGlow: 'ring-2 ring-white shadow-[0_0_12px_rgba(255,87,34,0.7)]',
      textClass: 'text-white',
    },
    {
      id: 2,
      name: 'CONSOLE 2',
      bgClass: 'bg-[#03a9f4]',
      borderClass: 'border-[#29b6f6]',
      activeGlow: 'ring-2 ring-white shadow-[0_0_12px_rgba(3,169,244,0.7)]',
      textClass: 'text-white',
    },
    {
      id: 3,
      name: 'CONSOLE 3',
      bgClass: 'bg-[#4caf50]',
      borderClass: 'border-[#66bb6a]',
      activeGlow: 'ring-2 ring-white shadow-[0_0_12px_rgba(76,175,80,0.7)]',
      textClass: 'text-white',
    },
    {
      id: 4,
      name: 'CONSOLE 4',
      bgClass: 'bg-[#2e7d32]',
      borderClass: 'border-[#43a047]',
      activeGlow: 'ring-2 ring-white shadow-[0_0_12px_rgba(46,125,50,0.7)]',
      textClass: 'text-white',
    },
    {
      id: 5,
      name: 'CONSOLE 5',
      bgClass: 'bg-[#673ab7]',
      borderClass: 'border-[#7e57c2]',
      activeGlow: 'ring-2 ring-white shadow-[0_0_12px_rgba(103,58,183,0.7)]',
      textClass: 'text-white',
    },
  ];

  return (
    <div className="w-full bg-[#12151e] border-y border-slate-800/80 px-2 py-2">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {consoles.map((c) => {
          const isActive = activeConsole === c.id;
          const unread = unreadCounts[c.id] || 0;

          return (
            <button
              key={c.id}
              onClick={() => onSelectConsole(c.id)}
              className={`relative flex-1 min-w-[76px] sm:min-w-[96px] py-2 px-1 text-center font-black tracking-tight text-xs uppercase rounded-md transition-all duration-150 select-none ${
                c.bgClass
              } ${c.textClass} ${
                isActive
                  ? `${c.activeGlow} scale-[1.03] z-10 opacity-100 font-extrabold`
                  : 'opacity-75 hover:opacity-95 hover:scale-[1.01]'
              }`}
            >
              <span className="truncate block font-mono text-[11px] sm:text-xs">
                {c.name}
              </span>
              {unread > 0 && !isActive && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-[9px] font-bold px-1.5 rounded-full shadow animate-pulse">
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
