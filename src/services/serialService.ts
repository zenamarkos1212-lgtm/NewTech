export interface SerialState {
  isConnected: boolean;
  port: any | null;
  baudRate: number;
  rxBytes: number;
  txBytes: number;
}

export class SerialService {
  private port: any = null;
  private reader: any = null;
  private writer: any = null;
  private keepReading = false;
  private decoder = new TextDecoder();
  private encoder = new TextEncoder();
  private onDataCallback: ((text: string) => void) | null = null;
  private onStatusChangeCallback: ((connected: boolean, error?: string) => void) | null = null;
  private rxBytes = 0;
  private txBytes = 0;

  public static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public setOnData(cb: (text: string) => void) {
    this.onDataCallback = cb;
  }

  public setOnStatusChange(cb: (connected: boolean, error?: string) => void) {
    this.onStatusChangeCallback = cb;
  }

  public getStats() {
    return {
      rxBytes: this.rxBytes,
      txBytes: this.txBytes,
      isConnected: !!this.port && this.keepReading,
    };
  }

  public async connect(baudRate = 115200): Promise<boolean> {
    if (!SerialService.isSupported()) {
      throw new Error(
        'Web Serial API is not supported in this browser. To use OTG USB, use Chrome on Android with OTG adapter, or enable chrome://flags/#enable-experimental-web-platform-features.'
      );
    }

    try {
      // Prompt user to select USB Serial device (CH340, CP2102, FT232, ESP8266)
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({
        baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
      });

      this.keepReading = true;
      this.startReading();
      this.onStatusChangeCallback?.(true);
      return true;
    } catch (err: any) {
      this.keepReading = false;
      this.port = null;
      this.onStatusChangeCallback?.(false, err.message || 'Failed to open serial port');
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    this.keepReading = false;
    try {
      if (this.reader) {
        await this.reader.cancel();
        this.reader = null;
      }
      if (this.writer) {
        await this.writer.close();
        this.writer = null;
      }
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
    } catch (err) {
      console.warn('Error closing port:', err);
    } finally {
      this.onStatusChangeCallback?.(false);
    }
  }

  public async write(data: string): Promise<void> {
    if (!this.port || !this.port.writable) {
      throw new Error('Serial port not open');
    }

    try {
      if (!this.writer) {
        this.writer = this.port.writable.getWriter();
      }
      // Ensure CRLF if command doesn't have it
      const payload = data.endsWith('\n') || data.endsWith('\r') ? data : `${data}\r\n`;
      const encoded = this.encoder.encode(payload);
      await this.writer.write(encoded);
      this.txBytes += encoded.length;
      this.writer.releaseLock();
      this.writer = null;
    } catch (err: any) {
      console.error('Serial write error:', err);
      if (this.writer) {
        try {
          this.writer.releaseLock();
        } catch (_) {}
        this.writer = null;
      }
      throw err;
    }
  }

  public async toggleSignals(dtr: boolean, rts: boolean): Promise<void> {
    if (this.port && typeof this.port.setSignals === 'function') {
      await this.port.setSignals({
        dataTerminalReady: dtr,
        requestToSend: rts,
      });
    }
  }

  private async startReading(): Promise<void> {
    while (this.port && this.port.readable && this.keepReading) {
      try {
        this.reader = this.port.readable.getReader();
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) {
            break;
          }
          if (value) {
            this.rxBytes += value.length;
            const text = this.decoder.decode(value, { stream: true });
            this.onDataCallback?.(text);
          }
        }
      } catch (err: any) {
        if (this.keepReading) {
          console.error('Serial read error:', err);
          this.onStatusChangeCallback?.(false, err.message);
        }
        break;
      } finally {
        if (this.reader) {
          try {
            this.reader.releaseLock();
          } catch (_) {}
          this.reader = null;
        }
      }
    }
  }
}
