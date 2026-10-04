import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';
import { Icon } from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { t } from '../../legal/i18n';

const GenericTextScreen = ({ titleKey, textKey }: { titleKey: any, textKey: any }) => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t(titleKey)}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.bodyText}>{t(textKey)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export const PrivacyPolicyScreen = () => <GenericTextScreen titleKey="privacyPolicy" textKey="privacyPolicyText" />;
export const TermsScreen = () => <GenericTextScreen titleKey="termsOfUse" textKey="termsOfUseText" />;
export const KvkkScreen = () => <GenericTextScreen titleKey="kvkk" textKey="kvkkText" />;

export const SupportScreen = () => {
  const navigation = useNavigation<any>();

  const handleEmail = () => {
    // We use a mailto link with placeholder. The user asked for a prefilled draft with device info.
    const email = 'arem.workgroup@gmail.com';
    const subject = 'TRKN Mobil - Destek / Geri Bildirim';
    const body = '\\n\\n--- \\nCihaz Modeli: \\nİşletim Sistemi: \\nUygulama Sürümü: [SÜRÜM]\\n';
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
      .catch(() => alert('E-posta uygulaması açılamadı.'));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('support')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.scrollContent}>
        <Text style={styles.bodyText}>{t('contactUsDesc')}</Text>
        <TouchableOpacity style={styles.emailBtn} onPress={handleEmail}>
          <Icon name="mail" size={24} color={theme.colors.onPrimary} />
          <Text style={styles.emailBtnText}>{t('sendEmail')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.margin, paddingVertical: 12, backgroundColor: 'rgba(18, 19, 22, 0.85)' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...theme.typography.headlineLgMobile, color: theme.colors.onSurface, fontSize: 18 },
  scrollContent: { padding: theme.spacing.margin, paddingBottom: 40 },
  bodyText: { ...theme.typography.bodyMd, color: theme.colors.onSurfaceVariant, lineHeight: 24 },
  emailBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: 12, marginTop: 24 },
  emailBtnText: { ...theme.typography.labelLg, color: theme.colors.onPrimary, fontWeight: 'bold' }
});
