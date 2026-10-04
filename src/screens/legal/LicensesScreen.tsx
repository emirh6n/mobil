import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';
import { Icon } from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { t } from '../../legal/i18n';
import licensesData from '../../legal/licenses.json';

export const LicensesScreen = () => {
  const navigation = useNavigation<any>();

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.licenseCard}>
      <View style={styles.licenseHeader}>
        <Text style={styles.libName}>{item.name}</Text>
        <Text style={styles.libVersion}>v{item.version}</Text>
      </View>
      <View style={styles.licenseFooter}>
        <Text style={styles.libLicense}>{item.license} License</Text>
        {item.repository && (
          <TouchableOpacity onPress={() => Linking.openURL(item.repository).catch(() => {})}>
            <Text style={styles.libLink}>View</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('licenses')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={licensesData}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.margin, paddingVertical: 12, backgroundColor: 'rgba(18, 19, 22, 0.85)' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...theme.typography.headlineLgMobile, color: theme.colors.onSurface, fontSize: 18 },
  listContent: { padding: theme.spacing.margin },
  licenseCard: { backgroundColor: theme.colors.surfaceContainer, borderRadius: 8, padding: 16, borderWidth: 1, borderColor: theme.colors.surfaceContainerHigh },
  licenseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  libName: { ...theme.typography.titleMd, color: theme.colors.primary, fontWeight: 'bold' },
  libVersion: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  licenseFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  libLicense: { ...theme.typography.bodySm, color: theme.colors.onSurface },
  libLink: { ...theme.typography.labelMd, color: theme.colors.secondary }
});
