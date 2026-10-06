import { NativeModule, requireNativeModule } from 'expo';

declare class TrknPedometerModule extends NativeModule<{}> {
  startTracking(): void;
  stopTracking(): void;
  getTodaySteps(): number;
  syncSteps(): Promise<number>;
}

export default requireNativeModule<TrknPedometerModule>('TrknPedometer');
