import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { theme } from '../../theme/theme';
import { Icon } from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { t } from '../../legal/i18n';

export const AboutScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('about')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/logo.jpg')} style={styles.logo} />
          <Text style={styles.appName}>TRKN Mobil</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('developer')}</Text>
            <Text style={styles.infoValue}>AREM</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('version')}</Text>
            <Text style={styles.infoValue}>{getVersion()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('build')}</Text>
            <Text style={styles.infoValue}>{getBuildNumber()}</Text>
          </View>
        </View>

        <Text style={styles.copyrightText}>{t('copyright')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.margin, paddingVertical: 12, backgroundColor: 'rgba(18, 19, 22, 0.85)' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...theme.typography.headlineLgMobile, color: theme.colors.onSurface, fontSize: 18 },
  scrollContent: { padding: theme.spacing.margin, alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginVertical: 32 },
  logo: { width: 100, height: 100, borderRadius: 24, marginBottom: 16 },
  appName: { ...theme.typography.headlineMd, color: theme.colors.primary, fontWeight: 'bold' },
  
  infoCard: { width: '100%', backgroundColor: theme.colors.surfaceContainer, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.surfaceContainerHigh, padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  infoLabel: { ...theme.typography.bodyMd, color: theme.colors.onSurfaceVariant },
  infoValue: { ...theme.typography.titleMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: 'rgba(38, 40, 46, 0.6)', marginVertical: 4 },
  
  copyrightText: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, marginTop: 32, textAlign: 'center' }
});
