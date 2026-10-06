import { registerWebModule, NativeModule } from 'expo';

// TrknPedometerModule is not available on the web platform.
class TrknPedometerModule extends NativeModule<{}> {}

export default registerWebModule(TrknPedometerModule, 'TrknPedometerModule');
