# TRKN - Cross-Platform Mobil Uygulama

Bu proje, Google Stitch kullanılarak tasarlanmış bir uygulamanın Native React Native (CLI) kod tabanına dönüştürülmüş halidir.

## Özellikler
- **Tasarım:** Kinetik Dark M3
- **Teknolojiler:** React Native CLI, TypeScript, React Navigation
- **Veritabanı:** SQLite (`@op-engineering/op-sqlite`) - Android ve iOS üzerinde hızlı JSI entegrasyonu sağlar.
- **Mimari:** Tamamen yerel (native) componentler kullanıldı, WebView içermez. Platform spesifik kodlar (Android/iOS) UI katmanından izole edildi.
- **Güvenlik:** API anahtarları veya şifreler koda hardcoded olarak eklenmemiştir. `react-native-dotenv` kullanılması önerilir.

## Geliştirme Ortamı Kurulumu

### Node.js ve NPM
Sisteminizde [Node.js](https://nodejs.org/en/) kurulu olduğundan emin olun.
```sh
npm install
```

### Android Ortamı (Windows / Mac)
1. **Android Studio Kurulumu:** Android Studio kurarak SDK platform (Örn: API 34) indirin.
2. **JDK:** Proje için Java Development Kit (JDK 17) kurulu ve `JAVA_HOME` yolu ayarlanmış olmalıdır.
3. **Emülatör:** Android Studio üzerinden bir sanal cihaz (AVD) oluşturun.

#### Projeyi Android'de Çalıştırma
Debug modda projeyi çalıştırmak için:
```sh
npx react-native run-android
```
Uygulama fiziksel bir cihaza bağlanmış durumdayken cihazda da yüklenecektir. (Cihazın Geliştirici Seçeneklerinden USB Hata Ayıklama modunun açık olması gereklidir).

---

## 🚀 Android Release (Google Play Store)

Google Play Store'a yükleme yapabilmek için **Android App Bundle (.aab)** formatında dosya almanız gerekmektedir.

### 1. Keystore Oluşturma
Uygulamayı imzalamak için güvenli bir keystore dosyasına ihtiyacınız var. Aşağıdaki komutu Windows'ta PowerShell'de veya Mac/Linux terminalinde çalıştırarak `my-release-key.keystore` oluşturabilirsiniz:
```sh
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```
> **DİKKAT:** Şifrenizi unutmayın. Bu keystore dosyasını projenin ana klasöründe DEĞİL, `android/app/` klasörüne taşıyın. Keystore dosyasını ASLA git reposuna atmayın (`.gitignore` dosyasında olduğunu teyit edin).

### 2. Gradle Signing Ayarları
`android/gradle.properties` dosyasına oluşturduğunuz şifre bilgilerini ekleyin (bu dosyayı da git'e commitlemeyin, placeholder olarak kullanın):
```properties
MYAPP_UPLOAD_STORE_FILE=my-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

`android/app/build.gradle` içinde şu ayarlara sahip olmalısınız:
```gradle
signingConfigs {
    release {
        if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled enableProguardInReleaseBuilds
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

### 3. Sürüm Kodu (Version Control)
`android/app/build.gradle` içinde:
- `versionCode 1` (Her Google Play güncellemesinde bu sayı arttırılmalıdır. Örn: 2, 3...)
- `versionName "1.0"` (Kullanıcılara gösterilen versiyon numarasıdır. Örn: "1.0.1")

### 4. Release AAB (App Bundle) Alınması
Projenin root klasöründeyken terminalde sırasıyla çalıştırın:
```sh
cd android
./gradlew clean
./gradlew bundleRelease
```
Eğer Windows ortamındaysanız:
```powershell
cd android
.\gradlew.bat clean
.\gradlew.bat bundleRelease
```
**Çıktı Yolu:** AAB dosyası `android/app/build/outputs/bundle/release/app-release.aab` konumunda oluşacaktır. Bu dosyayı Google Play Console'a yükleyebilirsiniz.

---

## 🍏 Future iOS Release (App Store)

Şu anda proje Windows ortamında oluşturulmuş olup iOS build işlemleri Mac bilgisayar gerektirmektedir. İleride proje Mac ortamında açıldığında şu adımlar izlenmelidir:

1. **Mac ve Xcode Gereksinimi:** Xcode'u App Store üzerinden indirin.
2. **CocoaPods:** Projede kullanılan iOS kütüphanelerini bağlamak için gereklidir:
   ```sh
   cd ios
   pod install
   ```
3. **Simülatör / Cihaz:**
   ```sh
   npx react-native run-ios
   ```
   veya `ios/TRKN.xcworkspace` dosyasını Xcode ile açarak derleyebilirsiniz.
4. **Apple Developer Hesabı:** App Store'a yayın yapmak için 99$/yıl bedeli olan Apple Developer hesabına ihtiyacınız vardır.
5. **Bundle Identifier ve Signing:** Xcode üzerinden projeye tıklayıp `Signing & Capabilities` sekmesinde "Automatically manage signing" seçeneğini aktif edip geliştirici hesabınızı bağlayın.
6. **Distribution Certificate ve Provisioning Profile:** Xcode sizin yerinize bu sertifikaları App Store Connect üzerinden oluşturacaktır.
7. **TestFlight:** Xcode'da menüden `Product -> Archive` tıklanarak oluşan build'i "Distribute App" diyerek TestFlight'a yollayın.
8. **App Store Yükleme:** App Store Connect web panelinden uygulamanın versiyon detayları ve ekran görüntüleri eklenip onay sürecine yollanır.

---

## 🛠 Veritabanı (SQLite) Mimari

- Veritabanı kodları `src/database/` altındadır.
- Platform bağımsız (`@op-engineering/op-sqlite`) kütüphane kullanılmaktadır.
- Tablolar (Schema) ve Migration işlemleri `database.ts` altında otomatik olarak kurgulanmıştır.
- SQL enjeksiyonlarına karşı daima **parametreli sorgular (parameterized queries)** kullanılmaktadır. CRUD operasyonları UI tarafına taşınmamış olup `src/repositories/` katmanında tutulmaktadır.
