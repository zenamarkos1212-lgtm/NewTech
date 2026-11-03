export class WifiService {
  private socket: WebSocket | null = null;
  private ip: string = '192.168.4.1';
  private port: number = 81;
  private onDataCallback: ((text: string) => void) | null = null;
  private onStatusChangeCallback: ((connected: boolean, error?: string) => void) | null = null;
  private rxBytes: number = 0;
  private txBytes: number = 0;
  private pingInterval: any = null;

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
      isConnected: this.socket?.readyState === WebSocket.OPEN,
    };
  }

  public async connect(ip: string = '192.168.4.1', port: number = 81): Promise<void> {
    this.ip = ip.trim();
    this.port = port;

    return new Promise((resolve, reject) => {
      try {
        this.disconnect();
        const wsUrl = `ws://${this.ip}:${this.port}`;
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          this.onStatusChangeCallback?.(true);
          this.startHeartbeat();
          resolve();
        };

        this.socket.onmessage = async (event) => {
          let text = '';
          if (typeof event.data === 'string') {
            text = event.data;
            this.rxBytes += event.data.length;
          } else if (event.data instanceof Blob) {
            text = await event.data.text();
            this.rxBytes += event.data.size;
          } else if (event.data instanceof ArrayBuffer) {
            text = new TextDecoder().decode(event.data);
            this.rxBytes += event.data.byteLength;
          }
          this.onDataCallback?.(text);
        };

        this.socket.onerror = (err) => {
          console.warn('WiFi Bridge WebSocket error:', err);
          this.onStatusChangeCallback?.(false, 'WebSocket connection error');
          reject(new Error(`Failed to connect to WiFi Bridge at ${this.ip}:${this.port}`));
        };

        this.socket.onclose = () => {
          this.stopHeartbeat();
          this.onStatusChangeCallback?.(false);
        };
      } catch (err: any) {
        this.onStatusChangeCallback?.(false, err.message);
        reject(err);
      }
    });
  }

  public disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      try {
        this.socket.close();
      } catch (_) {}
      this.socket = null;
    }
    this.onStatusChangeCallback?.(false);
  }

  public async send(cmd: string): Promise<void> {
    const payload = cmd.endsWith('\n') || cmd.endsWith('\r') ? cmd : `${cmd}\r\n`;

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(payload);
      this.txBytes += payload.length;
      return;
    }

    // Fallback: Send over HTTP GET /send?cmd=...
    try {
      const url = `http://${this.ip}/send?cmd=${encodeURIComponent(payload)}`;
      await fetch(url, { mode: 'no-cors' });
      this.txBytes += payload.length;
    } catch (err: any) {
      throw new Error(`Failed to transmit command: ${err.message}`);
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        try {
          this.socket.send('\x00'); // Keep-alive ping
        } catch (_) {}
      }
    }, 15000);
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}
