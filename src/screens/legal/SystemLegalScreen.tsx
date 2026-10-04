import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';
import { Icon } from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { t } from '../../legal/i18n';

const NavItem = ({ title, icon, onPress }: { title: string; icon: any; onPress: () => void }) => (
  <TouchableOpacity style={styles.listItem} onPress={onPress}>
    <View style={styles.listItemLeft}>
      <View style={styles.cardIconBox}>
        <Icon name={icon} size={22} color={theme.colors.onSurfaceVariant} />
      </View>
      <Text style={styles.listItemTitle}>{title}</Text>
    </View>
    <Icon name="arrow-forward" size={18} color={theme.colors.onSurfaceVariant} />
  </TouchableOpacity>
);

export const SystemLegalScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('systemAndLegal')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <NavItem title={t('privacyPolicy')} icon="policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
          <View style={styles.divider} />
          <NavItem title={t('termsOfUse')} icon="gavel" onPress={() => navigation.navigate('Terms')} />
          <View style={styles.divider} />
          <NavItem title={t('kvkk')} icon="info" onPress={() => navigation.navigate('Kvkk')} />
        </View>

        <View style={styles.card}>
          <NavItem title={t('permissions')} icon="security" onPress={() => navigation.navigate('Permissions')} />
          <View style={styles.divider} />
          <NavItem title={t('myData')} icon="storage" onPress={() => navigation.navigate('MyData')} />
        </View>

        <View style={styles.card}>
          <NavItem title={t('licenses')} icon="code" onPress={() => navigation.navigate('Licenses')} />
          <View style={styles.divider} />
          <NavItem title={t('about')} icon="smartphone" onPress={() => navigation.navigate('About')} />
        </View>
        
        <View style={styles.card}>
          <NavItem title={t('support')} icon="headset-mic" onPress={() => navigation.navigate('Support')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.margin, paddingVertical: 12, backgroundColor: 'rgba(18, 19, 22, 0.85)' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...theme.typography.headlineLgMobile, color: theme.colors.onSurface, fontSize: 20 },
  
  scrollContent: { padding: theme.spacing.margin, gap: 24, paddingBottom: 24 },
  card: { backgroundColor: theme.colors.surfaceContainer, borderRadius: theme.rounded.lg, borderWidth: 1, borderColor: theme.colors.surfaceContainerHigh, overflow: 'hidden' },
  
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.md },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  listItemTitle: { ...theme.typography.titleMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: 'rgba(38, 40, 46, 0.6)' },
});
