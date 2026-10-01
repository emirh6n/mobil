import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../hooks/useSettings';

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const { settings, loading, updateSetting, updateMultipleSettings } = useSettings();
  
  const [userName, setUserName] = useState(settings.userName);
  
  // Accordion states
  const [goalsExpanded, setGoalsExpanded] = useState(false);
  const [personalExpanded, setPersonalExpanded] = useState(false);
  
  // Goals form
  const [calories, setCalories] = useState(settings.target_calories);
  const [protein, setProtein] = useState(settings.target_protein);
  const [water, setWater] = useState(settings.target_water);
  const [steps, setSteps] = useState(settings.target_steps);

  // Personal form
  const [age, setAge] = useState(settings.age);
  const [gender, setGender] = useState<'male' | 'female'>(settings.gender as 'male' | 'female');
  const [height, setHeight] = useState(settings.height);
  const [weight, setWeight] = useState(settings.weight);
  const [waist, setWaist] = useState(settings.waist);
  const [neck, setNeck] = useState(settings.neck);
  const [hip, setHip] = useState(settings.hip);

  const [restoreModalVisible, setRestoreModalVisible] = useState(false);

  // Sync state when loaded
  useEffect(() => {
    if (!loading) {
      setUserName(settings.userName);
      setCalories(settings.target_calories);
      setProtein(settings.target_protein);
      setWater(settings.target_water);
      setSteps(settings.target_steps);
      setAge(settings.age);
      setGender(settings.gender as 'male' | 'female');
      setHeight(settings.height);
      setWeight(settings.weight);
      setWaist(settings.waist);
      setNeck(settings.neck);
      setHip(settings.hip);
    }
  }, [loading, settings]);

  const handleSaveGeneral = () => updateSetting('userName', userName);
  const handleSaveGoals = () => {
    updateMultipleSettings({ target_calories: calories, target_protein: protein, target_water: water, target_steps: steps });
    setGoalsExpanded(false);
  };
  const handleSavePersonal = () => {
    updateMultipleSettings({ age, gender, height, weight, waist, neck, hip });
    setPersonalExpanded(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Ayarlar</Text>
          <View style={styles.statusRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>Sistem Senkronize</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}><Icon name="help-outline" size={22} color={theme.colors.onSurfaceVariant} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Icon name="qr-code-scanner" size={22} color={theme.colors.onSurfaceVariant} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* GENEL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GENEL</Text>
          <View style={styles.card}>
            <View style={styles.genelRow}>
              <View style={styles.cardIconBox}><Icon name="badge" size={22} color={theme.colors.primary} /></View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Kullanıcı Adı</Text>
                <TextInput style={styles.inputField} value={userName} onChangeText={setUserName} />
              </View>
              <TouchableOpacity style={styles.saveBtnSmall} onPress={handleSaveGeneral}>
                <Icon name="check" size={18} color={theme.colors.primary} />
                <Text style={styles.saveBtnSmallText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* GÜNLÜK HEDEFLER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GÜNLÜK HEDEFLER</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.accordionHeader} onPress={() => setGoalsExpanded(!goalsExpanded)}>
              <View style={styles.accordionHeaderLeft}>
                <View style={styles.cardIconBox}><Icon name="flag-circle" size={22} color={theme.colors.primary} /></View>
                <View>
                  <Text style={styles.accordionTitle}>Hedef Değerleri</Text>
                  <View style={styles.badgeRow}>
                    <Text style={[styles.badge, { color: theme.colors.primary }]}>{settings.target_calories} kcal</Text>
                    <Text style={[styles.badge, { color: theme.colors.secondary }]}>{settings.target_protein} g</Text>
                    <Text style={[styles.badge, { color: theme.colors.onSurfaceVariant }]}>{settings.target_water} L</Text>
                  </View>
                </View>
              </View>
              <Icon name={goalsExpanded ? "expand-less" : "expand-more"} size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>

            {goalsExpanded && (
              <View style={styles.accordionContent}>
                <View style={styles.formRow}>
                  <View style={styles.formRowLeft}>
                    <Icon name="local-fire-department" size={20} color={theme.colors.primary} />
                    <View><Text style={styles.formRowTitle}>Enerji / Kalori</Text><Text style={styles.formRowSub}>Günlük aktif kalori hedefi</Text></View>
                  </View>
                  <View style={styles.inputWrapper}><TextInput style={styles.miniInput} keyboardType="numeric" value={calories} onChangeText={setCalories} /><Text style={styles.inputUnit}>kcal</Text></View>
                </View>
                <View style={styles.formRow}>
                  <View style={styles.formRowLeft}>
                    <Icon name="egg-alt" size={20} color={theme.colors.secondary} />
                    <View><Text style={styles.formRowTitle}>Protein</Text><Text style={styles.formRowSub}>Kas koruma & onarım</Text></View>
                  </View>
                  <View style={styles.inputWrapper}><TextInput style={[styles.miniInput, { color: theme.colors.secondary }]} keyboardType="numeric" value={protein} onChangeText={setProtein} /><Text style={styles.inputUnit}>g</Text></View>
                </View>
                <View style={styles.formRow}>
                  <View style={styles.formRowLeft}>
                    <Icon name="water-drop" size={20} color="#3b82f6" />
                    <View><Text style={styles.formRowTitle}>Su Tüketimi</Text><Text style={styles.formRowSub}>Optimum hidrasyon</Text></View>
                  </View>
                  <View style={styles.inputWrapper}><TextInput style={styles.miniInput} keyboardType="numeric" value={water} onChangeText={setWater} /><Text style={styles.inputUnit}>L</Text></View>
                </View>
                <View style={styles.formRow}>
                  <View style={styles.formRowLeft}>
                    <Icon name="directions-walk" size={20} color={theme.colors.primary} />
                    <View><Text style={styles.formRowTitle}>Günlük Adım</Text><Text style={styles.formRowSub}>Genel hareketlilik</Text></View>
                  </View>
                  <View style={styles.inputWrapper}><TextInput style={styles.miniInput} keyboardType="numeric" value={steps} onChangeText={setSteps} /><Text style={styles.inputUnit}>adım</Text></View>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.btnSecondary} onPress={() => setGoalsExpanded(false)}><Text style={styles.btnSecondaryText}>Vazgeç</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveGoals}><Icon name="check-circle" size={18} color={theme.colors.onPrimaryContainer} /><Text style={styles.btnPrimaryText}>Kaydet</Text></TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* KİŞİSEL BİLGİLER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KİŞİSEL BİLGİLER</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.accordionHeader} onPress={() => setPersonalExpanded(!personalExpanded)}>
              <View style={styles.accordionHeaderLeft}>
                <View style={styles.cardIconBox}><Icon name="person-outline" size={22} color={theme.colors.primary} /></View>
                <View><Text style={styles.accordionTitle}>Biyometrik Parametreler</Text></View>
              </View>
              <Icon name={personalExpanded ? "expand-less" : "expand-more"} size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>

            {personalExpanded && (
              <View style={styles.accordionContent}>
                <View style={styles.grid2}>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridItemTitle}>Yaş</Text>
                    <View style={styles.inputWrapper}><TextInput style={styles.miniInput} keyboardType="numeric" value={age} onChangeText={setAge} /><Text style={styles.inputUnit}>yıl</Text></View>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridItemTitle}>Biyolojik Cinsiyet</Text>
                    <View style={styles.toggleRow}>
                      <TouchableOpacity style={[styles.toggleBtn, gender === 'male' && styles.toggleBtnActive]} onPress={() => setGender('male')}><Text style={[styles.toggleBtnText, gender === 'male' && styles.toggleBtnTextActive]}>Erkek</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.toggleBtn, gender === 'female' && styles.toggleBtnActiveSecondary]} onPress={() => setGender('female')}><Text style={[styles.toggleBtnText, gender === 'female' && styles.toggleBtnTextActive]}>Kadın</Text></TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={styles.grid2}>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridItemTitle}>Boy (cm)</Text>
                    <View style={styles.inputWrapper}><TextInput style={styles.miniInput} keyboardType="numeric" value={height} onChangeText={setHeight} /><Text style={styles.inputUnit}>cm</Text></View>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridItemTitle}>Kilo (kg)</Text>
                    <View style={styles.inputWrapper}><TextInput style={styles.miniInput} keyboardType="numeric" value={weight} onChangeText={setWeight} /><Text style={styles.inputUnit}>kg</Text></View>
                  </View>
                </View>
                <View style={styles.grid2}>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridItemTitle}>Bel Çevresi</Text>
                    <View style={styles.inputWrapper}><TextInput style={styles.miniInput} keyboardType="numeric" value={waist} onChangeText={setWaist} /><Text style={styles.inputUnit}>cm</Text></View>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridItemTitle}>Boyun Çevresi</Text>
                    <View style={styles.inputWrapper}><TextInput style={styles.miniInput} keyboardType="numeric" value={neck} onChangeText={setNeck} /><Text style={styles.inputUnit}>cm</Text></View>
                  </View>
                </View>
                {gender === 'female' && (
                  <View style={[styles.gridItem, { borderColor: theme.colors.secondary, borderWidth: 1, backgroundColor: 'rgba(66, 232, 178, 0.1)' }]}>
                     <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[styles.gridItemTitle, { color: theme.colors.onSurface }]}>Kalça Çevresi (cm)</Text>
                        <Text style={{ fontSize: 10, color: theme.colors.secondary, fontWeight: 'bold' }}>KADINLARDA GEREKLİ</Text>
                     </View>
                     <View style={styles.inputWrapper}><TextInput style={[styles.miniInput, { color: theme.colors.secondary }]} keyboardType="numeric" value={hip} onChangeText={setHip} /><Text style={styles.inputUnit}>cm</Text></View>
                  </View>
                )}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.btnSecondary} onPress={() => setPersonalExpanded(false)}><Text style={styles.btnSecondaryText}>Vazgeç</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.btnPrimary} onPress={handleSavePersonal}><Icon name="check-circle" size={18} color={theme.colors.onPrimaryContainer} /><Text style={styles.btnPrimaryText}>Kaydet</Text></TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* YEDEKLEME */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YEDEKLEME</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <View style={styles.cardIconBox}><Icon name="download-for-offline" size={22} color={theme.colors.primary} /></View>
                <View><Text style={styles.listItemTitle}>Yedeği Dışa Aktar</Text><Text style={styles.listItemSub}>JSON / CSV formatında</Text></View>
              </View>
              <View style={styles.btnSmall}><Icon name="file-download" size={18} color={theme.colors.primary} /><Text style={styles.btnSmallText}>İndir</Text></View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.listItem} onPress={() => setRestoreModalVisible(true)}>
              <View style={styles.listItemLeft}>
                <View style={styles.cardIconBox}><Icon name="settings-backup-restore" size={22} color={theme.colors.secondary} /></View>
                <View><Text style={styles.listItemTitle}>Yedekten Geri Yükle</Text><Text style={styles.listItemSub}>Cihaza aktar</Text></View>
              </View>
              <View style={[styles.btnSmall, { backgroundColor: 'rgba(66, 232, 178, 0.15)' }]}><Icon name="upload" size={18} color={theme.colors.secondary} /><Text style={[styles.btnSmallText, { color: theme.colors.secondary }]}>İçe Aktar</Text></View>
            </TouchableOpacity>
          </View>
        </View>

        {/* SİSTEM & YASAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SİSTEM & YASAL</Text>
          <View style={styles.card}>
            <View style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <View style={styles.cardIconBox}><Icon name="terminal" size={22} color={theme.colors.primary} /></View>
                <View><Text style={styles.listItemTitle}>TRKN Studio</Text></View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <View style={styles.cardIconBox}><Icon name="policy" size={22} color={theme.colors.onSurfaceVariant} /></View>
                <View><Text style={styles.listItemTitle}>Gizlilik Sözleşmesi</Text><Text style={styles.listItemSub}>Uçtan uca şifreleme</Text></View>
              </View>
              <Icon name="open-in-new" size={18} color={theme.colors.onSurfaceVariant} />
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Restore Modal */}
      <Modal visible={restoreModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Icon name="warning" size={32} color={theme.colors.error} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.modalTitle}>Kayıtlar Değiştirilecek!</Text>
                <Text style={styles.modalSubTitle}>KALICI İŞLEM</Text>
              </View>
            </View>
            <Text style={styles.modalText}>Dikkat: Yedekten geri yükleme işlemi yapıldığında mevcut tüm verileriniz silinip değiştirilecektir. Bu işlem geri alınamaz.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setRestoreModalVisible(false)}><Text style={styles.btnSecondaryText}>Vazgeç</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnDanger} onPress={() => setRestoreModalVisible(false)}><Icon name="restore" size={18} color={theme.colors.onErrorContainer} /><Text style={styles.btnDangerText}>Onayla</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.margin, paddingVertical: 12, backgroundColor: 'rgba(18, 19, 22, 0.85)' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { ...theme.typography.headlineLgMobile, color: theme.colors.onSurface, fontSize: 24 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary },
  statusText: { ...theme.typography.labelSm, color: theme.colors.primary, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  
  scrollContent: { padding: theme.spacing.margin, gap: 24, paddingBottom: 100 },
  
  section: { gap: 8 },
  sectionTitle: { ...theme.typography.labelMd, color: theme.colors.primary, fontWeight: 'bold', marginLeft: 4 },
  
  card: { backgroundColor: theme.colors.surfaceContainer, borderRadius: theme.rounded.lg, borderWidth: 1, borderColor: theme.colors.surfaceContainerHigh, overflow: 'hidden' },
  
  genelRow: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, gap: 12 },
  cardIconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  inputContainer: { flex: 1 },
  inputLabel: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, marginBottom: 2 },
  inputField: { ...theme.typography.titleMd, color: theme.colors.onSurface, fontWeight: 'bold', padding: 0, margin: 0 },
  saveBtnSmall: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.surfaceContainerHigh, paddingHorizontal: 12, height: 36, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.outlineVariant },
  saveBtnSmallText: { ...theme.typography.labelMd, color: theme.colors.primary },
  
  accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.md },
  accordionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accordionTitle: { ...theme.typography.titleMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  badge: { backgroundColor: theme.colors.surfaceContainerHighest, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 11, fontWeight: 'bold' },
  
  accordionContent: { borderTopWidth: 1, borderTopColor: 'rgba(38, 40, 46, 0.6)', padding: theme.spacing.md, backgroundColor: 'rgba(27, 27, 31, 0.5)', gap: 12 },
  
  formRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(41, 42, 45, 0.6)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(64, 74, 55, 0.3)' },
  formRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  formRowTitle: { ...theme.typography.titleMd, fontSize: 14, color: theme.colors.onSurface },
  formRowSub: { ...theme.typography.bodySm, fontSize: 11, color: theme.colors.onSurfaceVariant },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.surfaceContainerLowest, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(64, 74, 55, 0.5)' },
  miniInput: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 14, textAlign: 'right', minWidth: 40, padding: 0 },
  inputUnit: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  btnSecondary: { paddingHorizontal: 16, height: 40, borderRadius: 12, backgroundColor: theme.colors.surfaceContainerHigh, justifyContent: 'center' },
  btnSecondaryText: { ...theme.typography.labelMd, color: theme.colors.onSurfaceVariant },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, height: 40, borderRadius: 12, backgroundColor: theme.colors.primaryContainer, justifyContent: 'center' },
  btnPrimaryText: { ...theme.typography.labelMd, color: theme.colors.onPrimaryContainer, fontWeight: 'bold' },
  
  grid2: { flexDirection: 'row', gap: 12 },
  gridItem: { flex: 1, backgroundColor: 'rgba(41, 42, 45, 0.6)', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(64, 74, 55, 0.3)', gap: 8 },
  gridItemTitle: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  toggleRow: { flexDirection: 'row', backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: 6, padding: 2 },
  toggleBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, borderRadius: 4 },
  toggleBtnActive: { backgroundColor: theme.colors.primaryContainer },
  toggleBtnActiveSecondary: { backgroundColor: theme.colors.secondary },
  toggleBtnText: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  toggleBtnTextActive: { color: theme.colors.onPrimaryContainer, fontWeight: 'bold' },
  
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.md },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listItemTitle: { ...theme.typography.titleMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  listItemSub: { ...theme.typography.bodySm, color: theme.colors.onSurfaceVariant },
  btnSmall: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.surfaceContainerHigh, paddingHorizontal: 12, height: 36, borderRadius: 18 },
  btnSmallText: { ...theme.typography.labelMd, color: theme.colors.primary, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: 'rgba(38, 40, 46, 0.6)' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalBox: { backgroundColor: theme.colors.surfaceContainerHigh, width: '100%', maxWidth: 360, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.colors.outlineVariant },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  modalTitle: { ...theme.typography.titleLg, color: theme.colors.onSurface, fontWeight: 'bold' },
  modalSubTitle: { ...theme.typography.labelSm, color: theme.colors.error, fontWeight: 'bold', marginTop: 2 },
  modalText: { ...theme.typography.bodySm, color: theme.colors.onSurfaceVariant, backgroundColor: theme.colors.surfaceContainerLowest, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.outlineVariant },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btnDanger: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 12, backgroundColor: theme.colors.errorContainer },
  btnDangerText: { ...theme.typography.labelMd, color: theme.colors.onErrorContainer, fontWeight: 'bold' },
});
