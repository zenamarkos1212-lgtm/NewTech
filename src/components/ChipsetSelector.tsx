import React from 'react';
import { CHIPSETS } from '../constants/chipsets';
import { ChipsetId, Language } from '../types/tv';
import { translations } from '../constants/translations';
import { Cpu, CheckCircle2 } from 'lucide-react';

interface ChipsetSelectorProps {
  activeChipset: ChipsetId;
  onSelectChipset: (id: ChipsetId) => void;
  lang: Language;
}

export const ChipsetSelector: React.FC<ChipsetSelectorProps> = ({
  activeChipset,
  onSelectChipset,
  lang,
}) => {
  const t = translations[lang];

  // Visual renderers mimicking the exact brand badges in Image 2
  const renderBrandBadge = (id: ChipsetId) => {
    switch (id) {
      case 'mstar':
        return (
          <div className="bg-white text-black px-3 py-2 rounded flex flex-col items-center justify-center border border-slate-300 shadow-sm w-full h-[52px]">
            <div className="flex items-center text-red-600 font-extrabold text-lg leading-none tracking-tighter">
              <span className="text-xl italic font-serif">M</span>
              <span className="text-black font-sans font-black text-sm ml-0.5">Star</span>
            </div>
            <span className="text-[8px] font-semibold tracking-wider text-slate-800 uppercase mt-0.5">
              semiconductor
            </span>
          </div>
        );

      case 'mediatek':
        return (
          <div className="bg-[#f57c00] text-white px-3 py-2 rounded flex items-center justify-center font-black tracking-wider text-sm shadow-sm w-full h-[52px] border border-amber-600">
            <span className="italic font-sans text-base tracking-wide">MEDIATEK</span>
          </div>
        );

      case 'realtek':
        return (
          <div className="bg-white text-[#02569b] px-3 py-2 rounded flex items-center justify-center gap-1.5 border border-slate-300 shadow-sm w-full h-[52px]">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#02569b]">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            <span className="font-extrabold tracking-wider text-xs sm:text-sm font-sans">
              REALTEK
            </span>
          </div>
        );

      case 'hisilicon':
        return (
          <div className="bg-white text-black px-3 py-2 rounded flex items-center justify-center gap-1 border border-slate-300 shadow-sm w-full h-[52px]">
            <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-black italic">
              Hi
            </div>
            <span className="font-black tracking-widest text-xs sm:text-sm text-slate-900">
              HISILICON
            </span>
          </div>
        );

      case 'panasonic':
        return (
          <div className="bg-[#004098] text-white px-3 py-2 rounded flex items-center justify-center font-bold tracking-tight text-xs sm:text-sm shadow-sm w-full h-[52px]">
            <span>Panasonic</span>
          </div>
        );

      case 'amlogic':
        return (
          <div className="bg-white text-[#1976d2] px-3 py-2 rounded flex items-center justify-center font-bold text-sm tracking-tight border border-slate-300 shadow-sm w-full h-[52px]">
            <span className="text-xl font-light text-slate-700">@</span>
            <span className="font-sans font-black text-sm text-[#1976d2]">mlogic</span>
          </div>
        );

      case 'nugget-mstar':
        return (
          <div className="bg-white text-black px-2 py-2 rounded flex items-center justify-center border border-slate-300 shadow-sm w-full h-[52px]">
            <span className="font-black text-[11px] sm:text-xs tracking-tight text-slate-900 font-mono">
              NUGGUET-MSTAR
            </span>
          </div>
        );

      case 'firetv':
        return (
          <div className="bg-black text-white px-3 py-2 rounded flex flex-col items-center justify-center border border-neutral-700 shadow-sm w-full h-[52px]">
            <div className="flex items-center text-[#ff9900] font-bold text-sm leading-tight">
              <span>fire</span>
              <span className="text-white ml-0.5 font-light">tv</span>
            </div>
            <svg viewBox="0 0 40 8" className="w-8 h-2 fill-none stroke-[#ff9900] stroke-2">
              <path d="M 2 2 Q 20 8 38 2" />
            </svg>
          </div>
        );

      default:
        return <div>{id}</div>;
    }
  };

  return (
    <div className="bg-[#0e121a] border border-slate-800 rounded-xl p-3 sm:p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-200 tracking-wide">
            {t.selectChipset}
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          8 Presets
        </span>
      </div>

      {/* Grid matching Image 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {CHIPSETS.map((chip) => {
          const isSelected = activeChipset === chip.id;

          return (
            <button
              key={chip.id}
              onClick={() => onSelectChipset(chip.id)}
              className={`group relative rounded-lg p-1.5 transition-all text-left flex flex-col items-center justify-between border cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/50 shadow-md shadow-amber-500/10'
                  : 'bg-[#151a24] border-slate-800/80 hover:border-slate-700 hover:bg-[#1c2230]'
              }`}
            >
              <div className="w-full">{renderBrandBadge(chip.id)}</div>

              <div className="w-full mt-1.5 flex items-center justify-between px-1">
                <span className="text-[10px] font-mono truncate text-slate-400 group-hover:text-slate-300">
                  {chip.bootPrompt}
                </span>
                {isSelected ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-slate-500 flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
