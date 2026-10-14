import React, { useEffect, useState } from 'react';
import { NewTechLogo } from './NewTechLogo';
import { Sparkles, Cpu } from 'lucide-react';

interface AppSplashScreenProps {
  onFinish: () => void;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing New-Tech Core...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(50);
      setStatusText('Loading TV UART & Remote Drivers...');
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Checking Hardware & Security...');
    }, 850);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Ready!');
    }, 1250);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 1600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090e] p-4 select-none">
      {/* Background radial gold glow */}
      <div className="absolute inset-0 bg-radial from-amber-500/15 via-black/40 to-black pointer-events-none" />

      {/* Center Animated Logo & Branding */}
      <div className="relative flex flex-col items-center text-center space-y-4 max-w-xs animate-in fade-in zoom-in-95 duration-500">
        {/* Pulsing Stitched Logo */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
          <NewTechLogo size={140} glow={true} />
        </div>

        <div>
          <h1 className="text-2xl font-black text-amber-400 tracking-wider">
            ኒው-ቴክ ኢንስቲትዩት
          </h1>
          <p className="text-xs font-mono text-slate-300 tracking-tight mt-0.5">
            የኤሌክትሮኒክስ ጥገና ማዕከል
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[10.5px]">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Developed by Tesfaye Hailu Gellaw</span>
          </div>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-64 space-y-2 pt-3">
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] font-mono text-slate-500 tracking-wide truncate">
            {statusText}
          </p>
        </div>
      </div>
    </div>
  );
};
