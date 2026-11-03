import { registerPlugin } from '@capacitor/core';

interface IrStatus {
  available: boolean;
  message: string;
}

interface IrTransmitResult {
  success: boolean;
  frequency: number;
  timingCount: number;
}

interface IrRemotePluginAPI {
  getStatus(): Promise<IrStatus>;
  transmitPattern(options: {
    frequency: number;
    pattern: number[];
  }): Promise<IrTransmitResult>;
}

const NativeIrRemote =
  registerPlugin<IrRemotePluginAPI>('IrRemote');

export const IrRemoteService = {
  async getStatus(): Promise<IrStatus> {
    return NativeIrRemote.getStatus();
  },

  async transmit(
    frequency: number,
    pattern: number[]
  ): Promise<IrTransmitResult> {
    if (!Array.isArray(pattern) || pattern.length < 2) {
      throw new Error('Valid IR timing data is required.');
    }

    return NativeIrRemote.transmitPattern({
      frequency,
      pattern,
    });
  },
};
