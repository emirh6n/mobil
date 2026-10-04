import { registerWebModule, NativeModule } from 'expo';

class ExpoAlarmModule extends NativeModule<{}> {}

export default registerWebModule(ExpoAlarmModule, 'ExpoAlarmModule');
