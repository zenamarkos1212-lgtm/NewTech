import {
  Capacitor,
  registerPlugin,
  PluginListenerHandle,
} from '@capacitor/core';

interface UsbSerialPluginAPI {
  connect(options: {
    baudRate: number;
  }): Promise<{
    connected: boolean;
    deviceName: string;
    baudRate?: number;
  }>;

  disconnect(): Promise<void>;

  write(options: {
    data: string;
  }): Promise<void>;

  toggleSignals(options: {
    dtr: boolean;
    rts: boolean;
  }): Promise<void>;

  addListener(
    eventName: 'serialData',
    listener: (event: { data: string; bytes: number }) => void
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: 'serialError',
    listener: (event: { message: string }) => void
  ): Promise<PluginListenerHandle>;
}

const NativeUsbSerial =
  registerPlugin<UsbSerialPluginAPI>('UsbSerial');

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
  private nativeConnected = false;

  private decoder = new TextDecoder();
  private encoder = new TextEncoder();

  private nativeDataListener: PluginListenerHandle | null = null;
  private nativeErrorListener: PluginListenerHandle | null = null;

  private onDataCallback: ((text: string) => void) | null = null;

  private onStatusChangeCallback:
    ((connected: boolean, error?: string) => void) | null = null;

  private rxBytes = 0;
  private txBytes = 0;

  public static isSupported(): boolean {
    return Capacitor.isNativePlatform() ||
      (typeof navigator !== 'undefined' && 'serial' in navigator);
  }

  public setOnData(cb: (text: string) => void) {
    this.onDataCallback = cb;
  }

  public setOnStatusChange(
    cb: (connected: boolean, error?: string) => void
  ) {
    this.onStatusChangeCallback = cb;
  }

  public getStats() {
    return {
      rxBytes: this.rxBytes,
      txBytes: this.txBytes,
      isConnected: this.nativeConnected ||
        (!!this.port && this.keepReading),
    };
  }

  public async connect(baudRate = 115200): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        this.nativeDataListener = await NativeUsbSerial.addListener(
          'serialData',
          (event) => {
            this.rxBytes += event.bytes;
            this.onDataCallback?.(event.data);
          }
        );

        this.nativeErrorListener = await NativeUsbSerial.addListener(
          'serialError',
          (event) => {
            this.onStatusChangeCallback?.(false, event.message);
          }
        );

        await NativeUsbSerial.connect({ baudRate });

        this.nativeConnected = true;
        this.keepReading = true;
        this.port = { nativeUsbSerial: true };

        this.onStatusChangeCallback?.(true);
        return true;

      } catch (err: any) {
        await this.removeNativeListeners();

        this.nativeConnected = false;
        this.keepReading = false;
        this.port = null;

        this.onStatusChangeCallback?.(
          false,
          err?.message || 'USB serial connection failed'
        );

        throw err;
      }
    }

    if (!SerialService.isSupported()) {
      throw new Error(
        'Web Serial API is not supported. Use the Android app for native USB OTG.'
      );
    }

    try {
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

      this.onStatusChangeCallback?.(
        false,
        err?.message || 'Failed to open serial port'
      );

      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    this.keepReading = false;

    if (this.nativeConnected) {
      try {
        await NativeUsbSerial.disconnect();
      } catch (err) {
        console.warn('Native serial disconnect error:', err);
      }

      this.nativeConnected = false;
      this.port = null;

      await this.removeNativeListeners();
      this.onStatusChangeCallback?.(false);
      return;
    }

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
      console.warn('Error closing serial port:', err);
    } finally {
      this.onStatusChangeCallback?.(false);
    }
  }

  public async write(data: string): Promise<void> {
    const payload =
      data.endsWith('\n') || data.endsWith('\r')
        ? data
        : `${data}\r\n`;

    if (this.nativeConnected) {
      const bytes = this.encoder.encode(payload);

      await NativeUsbSerial.write({ data: payload });

      this.txBytes += bytes.length;
      return;
    }

    if (!this.port || !this.port.writable) {
      throw new Error('Serial port not open');
    }

    try {
      if (!this.writer) {
        this.writer = this.port.writable.getWriter();
      }

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
        } catch (_) {
        }
        this.writer = null;
      }

      throw err;
    }
  }

  public async toggleSignals(
    dtr: boolean,
    rts: boolean
  ): Promise<void> {
    if (this.nativeConnected) {
      await NativeUsbSerial.toggleSignals({ dtr, rts });
      return;
    }

    if (this.port && typeof this.port.setSignals === 'function') {
      await this.port.setSignals({
        dataTerminalReady: dtr,
        requestToSend: rts,
      });
    }
  }

  private async removeNativeListeners(): Promise<void> {
    if (this.nativeDataListener) {
      await this.nativeDataListener.remove();
      this.nativeDataListener = null;
    }

    if (this.nativeErrorListener) {
      await this.nativeErrorListener.remove();
      this.nativeErrorListener = null;
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

            const text = this.decoder.decode(value, {
              stream: true,
            });

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
          } catch (_) {
          }
          this.reader = null;
        }
      }
    }
  }
}
