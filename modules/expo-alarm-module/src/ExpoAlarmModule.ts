import { NativeModule, requireNativeModule } from 'expo';

declare class ExpoAlarmModule extends NativeModule {
  startAlarm(): void;
  stopAlarm(): void;
  checkAndClearBootFlag(): boolean;
  scheduleAlarm(id: number, timeMs: number, isHardMode: boolean): void;
  cancelAlarm(id: number): void;
  getActiveAlarmId(): number;
}

export default requireNativeModule<ExpoAlarmModule>('ExpoAlarmModule');
