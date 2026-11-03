export type ConnectionType = 'otg' | 'wireless' | 'simulator';

export type ChipsetId =
  | 'mstar'
  | 'mediatek'
  | 'realtek'
  | 'hisilicon'
  | 'panasonic'
  | 'amlogic'
  | 'nugget-mstar'
  | 'firetv';

export interface ChipsetInfo {
  id: ChipsetId;
  name: string;
  tagline: string;
  badgeColor: string;
  defaultBaudRate: number;
  bootPrompt: string;
  interruptKey: string;
  description: string;
  logoText: string;
  accentBg: string;
}

export interface ConsoleMessage {
  id: string;
  timestamp: string;
  type: 'rx' | 'tx' | 'system' | 'error' | 'success';
  text: string;
}

export interface RecoveryAction {
  id: string;
  labelKey: string;
  defaultLabel: string;
  command: string | ((chipset: ChipsetId) => string);
  colorClass: string;
  descriptionKey: string;
  requiresConfirm?: boolean;
}

export type Language = 'am' | 'en'; // Amharic or English
