# TRKN - Mobil Uygulama Migration Planı

Bu belge, Google Stitch üzerinde oluşturulmuş HTML/CSS (Tailwind) projesinin production-ready, cross-platform bir React Native (CLI + TypeScript) projesine dönüştürülmesi için uygulanacak adımları içerir.

## 1. Proje Analizi
- **Tasarım Sistemi**: Kinetik Dark M3 (Koyu tema öncelikli, `Inter` font, `Material Symbols Outlined` ikon seti).
- **Ekranlar**: Toplam 9 ekran tespit edildi (Ana Sayfa, Ayarlar, Besin/Rutin, Görev, Hatırlatıcı, İstatistik, Kütüphane, Notlar, Spor Merkezi).
- **Mimari**: WebView kullanılmayacak. Tüm yapılar yerel (native) componentlere dönüştürülecek.
- **Veritabanı**: Yerel veritabanı olarak SQLite kullanılacak.
- **Navigasyon**: `react-navigation` ile Type-safe bir yönlendirme ağı kurulacak.

## 2. React Native Projesi Kurulumu
- React Native CLI ile `TRKN` adında yeni bir TypeScript projesi oluşturulacak.
- Proje içi klasör mimarisi şu şekilde kurgulanacak:
  ```
  src/
    assets/       # İkonlar, fontlar, görseller
    components/   # Tekrar kullanılabilir UI parçaları
    screens/      # Uygulama ekranları
    navigation/   # React Navigation ayarları
    database/     # SQLite bağlantısı ve schema/migration işlemleri
    repositories/ # Veritabanı sorguları (CRUD)
    theme/        # Kinetik Dark M3 renk, font, boşluk değerleri
    types/        # TypeScript interfaceleri
  ```
- Mevcut `stitch` kaynak klasörü projede referans olarak korunacak (`/stitch-source`).

## 3. Tasarım Sistemi & Tema (Theme)
- `DESIGN.md` referans alınarak merkezi bir tema nesnesi (`src/theme/theme.ts`, `colors.ts`, `typography.ts`) oluşturulacak.
- Sihirli sayılar (magic numbers) yerine tema değişkenleri kullanılacak.

## 4. React Navigation
- Bottom Tab Navigator ana gezinme için oluşturulacak.
- Alt ekranlar için Native Stack Navigator kullanılacak.
- Tür güvenliği (Type-safety) için `RootStackParamList` tanımlanacak.

## 5. SQLite Veritabanı ve Modeller
- `@op-engineering/op-sqlite` (cross-platform, hızlı ve JSI tabanlı) entegre edilecek.
- Migration ve sürüm kontrolü (versioning) sistemi eklenecek.
- CRUD işlemleri UI'dan bağımsız bir Repository katmanında yönetilecek.

## 6. HTML'den Native React Native Componentlerine Dönüşüm
- Tailwind utility classları, `StyleSheet.create` ile statik React Native stillerine veya Theme objesi kullanımına dönüştürülecek.
- Temel dönüşümler:
  - `div` -> `View`
  - `p / span / h1` -> `Text`
  - `button / a` -> `Pressable / TouchableOpacity`
  - `input` -> `TextInput`
  - Scroll alanları -> `ScrollView / FlatList`
- `Material Symbols` için vector-icons veya SVG çözümü kullanılacak.

## 7. Web Bağımlılıklarının Kaldırılması ve Platform Ayarlamaları
- `window`, `document`, `localStorage` yerine React Native alternatifleri kullanılacak.
- SafeAreaView ile çentik/Dynamic Island ve gesture alanları korunacak.
- Klavye (KeyboardAvoidingView) davranışları Android/iOS uyumlu ayarlanacak.

## 8. Yayın Ayarları (Release Configuration)
- Android: `applicationId`, versionlama, Keystore dokümantasyonu, Proguard/R8 ayarları yapılarak `AAB` üretimi test edilecek.
- iOS: Statik kontroller yapılacak, `Podfile` ayarlanacak. Mac gereksinimi nedeniyle build alınmasa da altyapı hazırlanacak.
- İzinler (Permissions): `AndroidManifest.xml` ve `Info.plist` hazırlanacak.

## 9. Test & README
- Proje build alınarak test edilecek.
- Detaylı ve kapsamlı bir `README.md` dosyası oluşturulacak (Android Play Store süreci ve ileride yapılacak iOS App Store süreci eklenecek).
