import { ChipsetInfo, ChipsetId } from '../types/tv';

export const CHIPSETS: ChipsetInfo[] = [
  {
    id: 'mstar',
    name: 'MStar Semiconductor',
    tagline: 'MSD338 / MSD6A648 / TSUM / MST6M',
    badgeColor: 'border-red-500 text-red-400 bg-red-950/30',
    defaultBaudRate: 115200,
    bootPrompt: 'mstar # ',
    interruptKey: 'Enter',
    description: 'Press ENTER rapidly during power-on to halt bootloader into mstar # prompt.',
    logoText: 'MStar',
    accentBg: 'from-red-950/40 to-slate-900',
  },
  {
    id: 'mediatek',
    name: 'MEDIATEK',
    tagline: 'MT5882 / MT5886 / MT9638 / MT9669',
    badgeColor: 'border-amber-500 text-amber-400 bg-amber-950/30',
    defaultBaudRate: 115200,
    bootPrompt: 'mtk # ',
    interruptKey: 'c',
    description: 'Press "c" or ESC repeatedly during AC power plug-in to enter MediaTek U-Boot console.',
    logoText: 'MEDIATEK',
    accentBg: 'from-amber-950/40 to-slate-900',
  },
  {
    id: 'realtek',
    name: 'REALTEK',
    tagline: 'RTD2984 / RTD2995 / RTD2851',
    badgeColor: 'border-blue-500 text-blue-400 bg-blue-950/30',
    defaultBaudRate: 115200,
    bootPrompt: 'Realtek # ',
    interruptKey: 'ESC',
    description: 'Press ESC or Space key immediately after TV mainboard 12V power applied.',
    logoText: 'REALTEK',
    accentBg: 'from-blue-950/40 to-slate-900',
  },
  {
    id: 'hisilicon',
    name: 'HISILICON',
    tagline: 'Hi3751 / Hi3796 / Hi3798 (Huawei/Honor)',
    badgeColor: 'border-red-600 text-red-500 bg-red-950/40',
    defaultBaudRate: 115200,
    bootPrompt: 'hisilicon # ',
    interruptKey: 'Ctrl+C',
    description: 'Press Ctrl+C or Enter during fastboot stage. Supports both 115200 and 1500000 baud.',
    logoText: 'HISILICON',
    accentBg: 'from-red-900/30 to-slate-900',
  },
  {
    id: 'panasonic',
    name: 'Panasonic',
    tagline: 'Viera TV Mainboard / Android SoC',
    badgeColor: 'border-sky-500 text-sky-400 bg-sky-950/30',
    defaultBaudRate: 115200,
    bootPrompt: 'panasonic # ',
    interruptKey: 'Space',
    description: 'Press Spacebar rapidly upon power supply activation to halt boot sequence.',
    logoText: 'Panasonic',
    accentBg: 'from-sky-950/40 to-slate-900',
  },
  {
    id: 'amlogic',
    name: 'Amlogic',
    tagline: 'T962 / T972 / T982 / S905D U-Boot',
    badgeColor: 'border-blue-600 text-blue-400 bg-blue-950/30',
    defaultBaudRate: 115200,
    bootPrompt: 'aml # ',
    interruptKey: 'Ctrl+C',
    description: 'Send Ctrl+C repeatedly to halt AMLogic U-Boot into aml # prompt.',
    logoText: '@mlogic',
    accentBg: 'from-indigo-950/40 to-slate-900',
  },
  {
    id: 'nugget-mstar',
    name: 'NUGGUET-MSTAR',
    tagline: 'Nugget Rom Core / MStar Boot Patch',
    badgeColor: 'border-emerald-500 text-emerald-400 bg-emerald-950/30',
    defaultBaudRate: 115200,
    bootPrompt: 'nugget # ',
    interruptKey: 'Enter',
    description: 'Specialized Nugget bootloader console for custom MStar motherboard firmware.',
    logoText: 'NUGGUET-MSTAR',
    accentBg: 'from-emerald-950/40 to-slate-900',
  },
  {
    id: 'firetv',
    name: 'fire tv',
    tagline: 'Amazon Fire TV Edition / Fastboot Console',
    badgeColor: 'border-orange-500 text-orange-400 bg-orange-950/30',
    defaultBaudRate: 115200,
    bootPrompt: 'fastboot # ',
    interruptKey: 'f',
    description: 'Press "f" repeatedly or send fastboot trigger token to enter emergency mode.',
    logoText: 'fire tv',
    accentBg: 'from-orange-950/40 to-slate-900',
  },
];

export function getChipsetCommand(actionId: string, chipset: ChipsetId): string {
  switch (actionId) {
    case 'recovery1':
      if (chipset === 'mstar' || chipset === 'nugget-mstar') {
        return 'recovery';
      }
      if (chipset === 'mediatek') {
        return 'reboot recovery';
      }
      if (chipset === 'amlogic') {
        return 'run recovery';
      }
      if (chipset === 'hisilicon') {
        return 'recovery boot';
      }
      if (chipset === 'realtek') {
        return 'boot recovery';
      }
      if (chipset === 'firetv') {
        return 'fastboot oem recovery';
      }
      return 'recovery';

    case 'recovery2':
      if (chipset === 'mstar' || chipset === 'nugget-mstar') {
        return 'setenv bootcmd "run recovery"; saveenv; reset';
      }
      if (chipset === 'mediatek') {
        return 'mtk_recovery force_wipe; reboot';
      }
      if (chipset === 'amlogic') {
        return 'wipe data; wipe cache; reboot';
      }
      if (chipset === 'hisilicon') {
        return 'format userdata; format cache; reset';
      }
      if (chipset === 'realtek') {
        return 'rtk_factory_reset; reset';
      }
      return 'reboot recovery --wipe_data';

    case 'reset':
      if (chipset === 'firetv') {
        return 'fastboot reboot';
      }
      return 'reset';

    case 'help':
      if (chipset === 'firetv') {
        return 'fastboot help';
      }
      return 'help';

    case 'mirror':
      if (chipset === 'mstar' || chipset === 'nugget-mstar') {
        return 'setenv mirror 1; saveenv; reset';
      }
      if (chipset === 'mediatek') {
        return 'panel_mirror 1; save_panel; reset';
      }
      if (chipset === 'amlogic') {
        return 'setenv panel_reverse 1; saveenv; reset';
      }
      if (chipset === 'realtek') {
        return 'rtk_panel mirror on; saveenv';
      }
      if (chipset === 'hisilicon') {
        return 'setenv lvds_mirror 1; saveenv';
      }
      return 'setenv mirror 1; saveenv';

    case 'backlight':
      if (chipset === 'mstar' || chipset === 'nugget-mstar') {
        return 'backlight on';
      }
      if (chipset === 'mediatek') {
        return 'gpio set backlight 1';
      }
      if (chipset === 'amlogic') {
        return 'bl_power 1; bl_level 255';
      }
      if (chipset === 'realtek') {
        return 'panel_bl on';
      }
      return 'gpio set bl_on 1';

    case 'bootInfo':
      if (chipset === 'mstar' || chipset === 'nugget-mstar') {
        return 'mmc info; mmc part';
      }
      if (chipset === 'mediatek') {
        return 'mtk_emmc info; printenv';
      }
      if (chipset === 'amlogic') {
        return 'emmc info; printenv';
      }
      if (chipset === 'realtek') {
        return 'showboot; rtk_info';
      }
      if (chipset === 'hisilicon') {
        return 'mmc read 0; printenv';
      }
      return 'mmc info; printenv';

    case 'uartOn':
      if (chipset === 'mstar' || chipset === 'nugget-mstar') {
        return 'uart 1';
      }
      if (chipset === 'mediatek') {
        return 'setenv debug_uart 1; saveenv';
      }
      if (chipset === 'amlogic') {
        return 'setenv loglevel 7; saveenv';
      }
      return 'uart on';

    case 'uartOff':
      if (chipset === 'mstar' || chipset === 'nugget-mstar') {
        return 'uart 0';
      }
      if (chipset === 'mediatek') {
        return 'setenv debug_uart 0; saveenv';
      }
      return 'uart off';

    case 'audioTest':
      if (chipset === 'mstar' || chipset === 'nugget-mstar') {
        return 'audio test 1000';
      }
      if (chipset === 'mediatek') {
        return 'mtk_audio_beep 1';
      }
      if (chipset === 'amlogic') {
        return 'tone 1000 500';
      }
      return 'audio test';

    case 'showLogo':
      if (chipset === 'mstar' || chipset === 'nugget-mstar') {
        return 'showlogo';
      }
      if (chipset === 'mediatek') {
        return 'mtk_showlogo';
      }
      if (chipset === 'amlogic') {
        return 'bmp display bootlogo';
      }
      return 'showlogo';

    case 'deleteLogo':
      if (chipset === 'mstar' || chipset === 'nugget-mstar') {
        return 'mmc erase.p bootlogo';
      }
      if (chipset === 'mediatek') {
        return 'mtk_emmc erase bootlogo';
      }
      if (chipset === 'amlogic') {
        return 'emmc erase logo';
      }
      return 'erase logo';

    case 'eraseFlash':
      return 'nand erase.chip || mmc erase 0 0x20000';

    case 'usbUpdate':
      if (chipset === 'mstar' || chipset === 'nugget-mstar') {
        return 'custstart';
      }
      if (chipset === 'mediatek') {
        return 'usb_update';
      }
      if (chipset === 'amlogic') {
        return 'update';
      }
      return 'usb update';

    case 'panelVesa':
      return 'setenv panel_format vesa; saveenv; reset';

    case 'enterBootloader':
      return '\x03\r\n'; // Ctrl+C or Enter burst

    default:
      return 'help';
  }
}
