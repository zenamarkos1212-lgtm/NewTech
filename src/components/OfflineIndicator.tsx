import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';
import { Language } from '../types/tv';

interface OfflineIndicatorProps {
  lang: Language;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600/95 border border-amber-400 px-3 py-1.5 text-xs font-semibold text-black shadow-xl backdrop-blur-xs animate-bounce">
      <WifiOff className="w-4 h-4 text-black" />
      <span>
        {lang === 'am'
          ? 'ኦፍላይን ሞድ - አፑ ያለ ኢንተርኔት በስልክዎ ላይ ይሰራል!'
          : 'Offline Mode — Local UART & cached tools active.'}
      </span>
    </div>
  );
};
