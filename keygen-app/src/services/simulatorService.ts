import { ChipsetId } from '../types/tv';
import { CHIPSETS } from '../constants/chipsets';

export class SimulatorService {
  private onDataCallback: ((text: string) => void) | null = null;
  private currentChipset: ChipsetId = 'mstar';
  private isRunning = false;
  private bootTimer: any = null;

  public setOnData(cb: (text: string) => void) {
    this.onDataCallback = cb;
  }

  public setChipset(chipset: ChipsetId) {
    this.currentChipset = chipset;
  }

  public start(chipset: ChipsetId = 'mstar') {
    this.currentChipset = chipset;
    this.isRunning = true;
    this.emitBootSequence();
  }

  public stop() {
    this.isRunning = false;
    if (this.bootTimer) {
      clearTimeout(this.bootTimer);
      this.bootTimer = null;
    }
  }

  public emitBootSequence() {
    const chipset = CHIPSETS.find((c) => c.id === this.currentChipset) || CHIPSETS[0];

    const lines = [
      `\r\n[SYSTEM] === NEW-TECH INSTITUTE TV RECOVERY SIMULATOR ===\r\n`,
      `[SIM] Target SoC: ${chipset.name} (${chipset.tagline})\r\n`,
      `[SIM] Baud Rate: ${chipset.defaultBaudRate} 8-N-1\r\n`,
      `[ROM] BootROM ver: 4.2.1-RELEASE\r\n`,
      `[DDR] Initializing DDR3/DDR4 SDRAM: 1536MB OK\r\n`,
      `[SPI] Winbond W25Q64FW SPI Flash detected (8MB)\r\n`,
      `[eMMC] Kingston eMMC 16GB [BOOT1: 4MB, BOOT2: 4MB, USER: 14.8GB] OK\r\n`,
      `Hit '${chipset.interruptKey}' key to stop autoboot: 3 ... 2 ... 1 ... 0\r\n`,
      `<< BOOT INTERRUPTED BY TECHNICIAN >>\r\n`,
      `${chipset.bootPrompt}`,
    ];

    let delay = 100;
    for (const line of lines) {
      setTimeout(() => {
        if (this.isRunning) {
          this.onDataCallback?.(line);
        }
      }, delay);
      delay += 120;
    }
  }

  public handleCommand(cmd: string) {
    if (!this.isRunning) return;
    const trimmed = cmd.trim();
    const prompt =
      CHIPSETS.find((c) => c.id === this.currentChipset)?.bootPrompt || 'mstar # ';

    setTimeout(() => {
      this.onDataCallback?.(`\r\n${this.generateResponse(trimmed)}\r\n${prompt}`);
    }, 150);
  }

  private generateResponse(cmd: string): string {
    const lower = cmd.toLowerCase();

    if (lower === 'help' || lower === '?') {
      return (
        `Available U-Boot TV Recovery Commands:\r\n` +
        `  recovery       - Boot into Android Recovery OS\r\n` +
        `  setenv <var>   - Set boot environment variable\r\n` +
        `  saveenv        - Save environment to Flash/eMMC\r\n` +
        `  printenv       - Print all environment parameters\r\n` +
        `  reset          - Perform CPU & SoC hard reset\r\n` +
        `  mmc info       - Display eMMC partition details\r\n` +
        `  mmc part       - List partition map (boot, recovery, system)\r\n` +
        `  mirror <1/0>   - Toggle screen image orientation 180 deg\r\n` +
        `  backlight <on> - Force turn on backlight driver inverter\r\n` +
        `  uart <1/0>     - Enable or disable debug serial port\r\n` +
        `  showlogo       - Render boot splash picture on LCD\r\n` +
        `  custstart      - Trigger automatic USB firmware flashing`
      );
    }

    if (lower.includes('recovery')) {
      return (
        `[RECOVERY] Staging boot-recovery image partition...\r\n` +
        `[RECOVERY] Reading /dev/block/by-name/recovery (offset 0x01800000)...\r\n` +
        `[RECOVERY] Verifying SHA256 checksum: VALID\r\n` +
        `[RECOVERY] Jumping to Recovery Kernel @ 0x80008000...\r\n` +
        `[SUCCESS] TV Screen displays Android Recovery menu! (Wipe Data / Factory Reset available)`
      );
    }

    if (lower.includes('mirror')) {
      return (
        `[PANEL] Setting LVDS Mirror parameter: INVERT = TRUE\r\n` +
        `[PANEL] Writing EEPROM Register 0x3F = 0x01\r\n` +
        `[SUCCESS] Panel display flipped 180 degrees. Upside-down image restored to normal!`
      );
    }

    if (lower.includes('backlight') || lower.includes('bl_')) {
      return (
        `[GPIO] Driving BL_ON / BL_EN pin to HIGH (3.3V)\r\n` +
        `[PWM] Backlight dimming PWM frequency set to 240Hz, 100% duty cycle.\r\n` +
        `[SUCCESS] TV LED Backlight strips activated!`
      );
    }

    if (lower.includes('mmc') || lower.includes('boot1') || lower.includes('showboot')) {
      return (
        `[eMMC CID] 15010046344d42393302685a1a1f9a12\r\n` +
        `[eMMC Part 0] BOOT1: Size = 4096 KB (Boot Code)\r\n` +
        `[eMMC Part 1] BOOT2: Size = 4096 KB (Backup Boot)\r\n` +
        `[eMMC Part 2] RPMB:  Size = 4096 KB (Replay Protected)\r\n` +
        `[eMMC User]   USER:  Size = 14920 MB (Partitions: boot, recovery, system, cache, userdata)\r\n` +
        `[MMC STATUS] Healthy (Lifetime est: 0-10% used)`
      );
    }

    if (lower.includes('uart 1') || lower.includes('uart on')) {
      return `[UART] Hardware debug serial enabled. Verbose logging level: 7 (DEBUG)`;
    }

    if (lower.includes('uart 0') || lower.includes('uart off')) {
      return `[UART] Hardware debug serial muted. Quiet mode enabled.`;
    }

    if (lower.includes('audio') || lower.includes('beep') || lower.includes('tone')) {
      return `[AUDIO] I2S Codec ES7134 DAC initialized. Outputting 1kHz sine test signal on Left/Right channels... OK`;
    }

    if (lower.includes('showlogo')) {
      return `[LOGO] Loading bitmap partition 'bootlogo' -> Framebuffer 0x20000000 (1920x1080@60Hz) ... DISPLAYED`;
    }

    if (lower.includes('delete') || lower.includes('erase')) {
      return (
        `[FLASH] Erasing flash partition block at address 0x00c00000 ...\r\n` +
        `[FLASH] Erased 8192 sectors OK. Partition wiped.`
      );
    }

    if (lower.includes('custstart') || lower.includes('usb')) {
      return (
        `[USB UPDATE] Scanning USB Ports 1 & 2 for update files (MstarUpgrade.bin / allupgrade.bin)...\r\n` +
        `[USB] Waiting for USB storage insertion.`
      );
    }

    if (lower.includes('reset') || lower.includes('reboot')) {
      setTimeout(() => this.emitBootSequence(), 500);
      return `[RESET] Soft SoC Watchdog triggered. Rebooting TV motherboard...`;
    }

    if (lower.includes('printenv')) {
      return (
        `baudrate=115200\r\n` +
        `bootdelay=2\r\n` +
        `bootcmd=run boot_kernel\r\n` +
        `ethaddr=00:1A:2B:3C:4D:5E\r\n` +
        `panel=1920x1080_60Hz\r\n` +
        `mirror=0\r\n` +
        `color_depth=8bit_jeida\r\n` +
        `uart_debug=1`
      );
    }

    return `Command executed: "${cmd}" -> OK (Exit code 0)`;
  }
}
