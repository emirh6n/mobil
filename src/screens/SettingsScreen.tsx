import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Image } from 'react-native';
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

  const [personalExpanded, setPersonalExpanded] = useState(false);
  


  // Personal form
  const [age, setAge] = useState(settings.age);
  const [gender, setGender] = useState<'male' | 'female'>(settings.gender as 'male' | 'female');
  const [height, setHeight] = useState(settings.height);
  const [weight, setWeight] = useState(settings.weight);
  const [waist, setWaist] = useState(settings.waist);
  const [neck, setNeck] = useState(settings.neck);
  const [hip, setHip] = useState(settings.hip);

  const ageRef = React.useRef<TextInput>(null);
  const heightRef = React.useRef<TextInput>(null);
  const weightRef = React.useRef<TextInput>(null);
  const waistRef = React.useRef<TextInput>(null);
  const neckRef = React.useRef<TextInput>(null);
  const hipRef = React.useRef<TextInput>(null);

  const [restoreModalVisible, setRestoreModalVisible] = useState(false);

  // Sync state when loaded
  useEffect(() => {
    if (!loading) {
      setUserName(settings.userName);

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

  const handleSavePersonal = () => {
    updateMultipleSettings({ 
      age: String(age), 
      gender, 
      height: String(height), 
      weight: String(weight), 
      waist: String(waist), 
      neck: String(neck), 
      hip: String(hip) 
    });
    setPersonalExpanded(false);
  };

  const metrics = React.useMemo(() => {
    const w = parseFloat(String(weight)) || 0;
    const h = parseFloat(String(height)) || 0;
    const a = parseFloat(String(age)) || 0;
    const wa = parseFloat(String(waist)) || 0;
    const n = parseFloat(String(neck)) || 0;
    const hi = parseFloat(String(hip)) || 0;

    let bmi = 0;
    if (h > 0 && w > 0) {
      bmi = w / Math.pow(h / 100, 2);
    }

    let bmr = 0;
    if (w > 0 && h > 0 && a > 0) {
      if (gender === 'male') {
        bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
      } else {
        bmr = (10 * w) + (6.25 * h) - (5 * a) - 161;
      }
    }

    let bodyFat = 0;
    if (gender === 'male') {
      if (wa > n && h > 0) {
        bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(wa - n) + 0.15456 * Math.log10(h)) - 450;
      }
    } else {
      if (wa + hi > n && h > 0) {
        bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(wa + hi - n) + 0.22100 * Math.log10(h)) - 450;
      }
    }

    return {
      bmi: bmi > 0 ? bmi.toFixed(1) : '-',
      bmr: bmr > 0 ? Math.round(bmr).toString() : '-',
      bodyFat: bodyFat > 0 && bodyFat < 100 ? bodyFat.toFixed(1) : '-'
    };
  }, [weight, height, age, waist, neck, hip, gender]);

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
                <TextInput style={styles.inputField} value={String(userName)} onChangeText={setUserName} />
              </View>
              <TouchableOpacity style={styles.saveBtnSmall} onPress={handleSaveGeneral}>
                <Icon name="check" size={18} color={theme.colors.primary} />
                <Text style={styles.saveBtnSmallText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
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
                  <TouchableOpacity style={styles.gridItem} activeOpacity={0.8} onPress={() => ageRef.current?.focus()}>
                    <Text style={styles.gridItemTitle}>Yaş</Text>
                    <View style={styles.inputWrapper}><TextInput ref={ageRef} style={styles.miniInput} keyboardType="numeric" value={String(age)} onChangeText={setAge} /><Text style={styles.inputUnit}>yıl</Text></View>
                  </TouchableOpacity>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridItemTitle}>Biyolojik Cinsiyet</Text>
                    <View style={styles.toggleRow}>
                      <TouchableOpacity style={[styles.toggleBtn, gender === 'male' && styles.toggleBtnActive]} onPress={() => setGender('male')}><Text style={[styles.toggleBtnText, gender === 'male' && styles.toggleBtnTextActive]}>Erkek</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.toggleBtn, gender === 'female' && styles.toggleBtnActiveSecondary]} onPress={() => setGender('female')}><Text style={[styles.toggleBtnText, gender === 'female' && styles.toggleBtnTextActive]}>Kadın</Text></TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={styles.grid2}>
                  <TouchableOpacity style={styles.gridItem} activeOpacity={0.8} onPress={() => heightRef.current?.focus()}>
                    <Text style={styles.gridItemTitle}>Boy (cm)</Text>
                    <View style={styles.inputWrapper}><TextInput ref={heightRef} style={styles.miniInput} keyboardType="numeric" value={String(height)} onChangeText={setHeight} /><Text style={styles.inputUnit}>cm</Text></View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.gridItem} activeOpacity={0.8} onPress={() => weightRef.current?.focus()}>
                    <Text style={styles.gridItemTitle}>Kilo (kg)</Text>
                    <View style={styles.inputWrapper}><TextInput ref={weightRef} style={styles.miniInput} keyboardType="numeric" value={String(weight)} onChangeText={setWeight} /><Text style={styles.inputUnit}>kg</Text></View>
                  </TouchableOpacity>
                </View>
                <View style={styles.grid2}>
                  <TouchableOpacity style={styles.gridItem} activeOpacity={0.8} onPress={() => waistRef.current?.focus()}>
                    <Text style={styles.gridItemTitle}>Bel Çevresi</Text>
                    <View style={styles.inputWrapper}><TextInput ref={waistRef} style={styles.miniInput} keyboardType="numeric" value={String(waist)} onChangeText={setWaist} /><Text style={styles.inputUnit}>cm</Text></View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.gridItem} activeOpacity={0.8} onPress={() => neckRef.current?.focus()}>
                    <Text style={styles.gridItemTitle}>Boyun Çevresi</Text>
                    <View style={styles.inputWrapper}><TextInput ref={neckRef} style={styles.miniInput} keyboardType="numeric" value={String(neck)} onChangeText={setNeck} /><Text style={styles.inputUnit}>cm</Text></View>
                  </TouchableOpacity>
                </View>
                {gender === 'female' && (
                  <TouchableOpacity style={styles.gridItem} activeOpacity={0.8} onPress={() => hipRef.current?.focus()}>
                    <Text style={styles.gridItemTitle}>Kalça Çevresi (cm)</Text>
                    <View style={styles.inputWrapper}><TextInput ref={hipRef} style={styles.miniInput} keyboardType="numeric" value={String(hip)} onChangeText={setHip} /><Text style={styles.inputUnit}>cm</Text></View>
                  </TouchableOpacity>
                )}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.btnSecondary} onPress={() => setPersonalExpanded(false)}><Text style={styles.btnSecondaryText}>Vazgeç</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.btnPrimary} onPress={handleSavePersonal}><Icon name="check-circle" size={18} color={theme.colors.onPrimaryContainer} /><Text style={styles.btnPrimaryText}>Kaydet</Text></TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* VÜCUT ANALİZİ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VÜCUT ANALİZİ</Text>
          <View style={styles.card}>
            <View style={styles.analysisGrid}>
              <View style={styles.analysisBox}>
                <Icon name="monitor-weight" size={24} color={theme.colors.primary} />
                <Text style={styles.analysisValue}>{metrics.bmi}</Text>
                <Text style={styles.analysisLabel}>Vücut Kitle İndeksi</Text>
              </View>
              <View style={styles.analysisBox}>
                <Icon name="local-fire-department" size={24} color={theme.colors.secondary} />
                <Text style={styles.analysisValue}>{metrics.bmr} <Text style={{fontSize: 12, color: theme.colors.onSurfaceVariant}}>kcal</Text></Text>
                <Text style={styles.analysisLabel}>Bazal Metabolizma</Text>
              </View>
              <View style={styles.analysisBox}>
                <Icon name="water-drop" size={24} color="#3b82f6" />
                <Text style={styles.analysisValue}>{metrics.bodyFat !== '-' ? `%${metrics.bodyFat}` : '-'}</Text>
                <Text style={styles.analysisLabel}>Vücut Yağ Oranı</Text>
              </View>
            </View>
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
                <View style={[styles.cardIconBox, { backgroundColor: 'transparent', padding: 0 }]}>
                  <Image source={require('../../assets/logo.jpg')} style={{ width: 40, height: 40, borderRadius: 8 }} />
                </View>
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
  
  analysisGrid: { flexDirection: 'row', gap: 12 },
  analysisBox: { flex: 1, backgroundColor: 'rgba(41, 42, 45, 0.6)', padding: 12, borderRadius: 8, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(64, 74, 55, 0.3)' },
  analysisValue: { ...theme.typography.titleLg, color: theme.colors.onSurface, fontWeight: 'bold' },
  analysisLabel: { ...theme.typography.labelSm, fontSize: 10, color: theme.colors.onSurfaceVariant, textAlign: 'center' },
});
