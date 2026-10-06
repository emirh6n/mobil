import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Linking, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useLibrary } from '../hooks/useLibrary';

import { Header } from '../components/Header';

export const LibraryScreen = () => {
  const navigation = useNavigation();
  const { resources, loading, addResource, updateResource, deleteResource } = useLibrary();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const handleAddResource = async () => {
    if (!title.trim()) return;
    if (editingId) {
      await updateResource(editingId, title, category, url, notes);
      setEditingId(null);
    } else {
      await addResource(title, category, url, notes);
    }
    setTitle('');
    setCategory('');
    setUrl('');
    setNotes('');
  };

  const handleLongPress = (r: any) => {
    Alert.alert(
      'İşlem Seçin',
      'Bu kaynak için ne yapmak istiyorsunuz?',
      [
        {
          text: 'Düzenle',
          onPress: () => {
            setEditingId(r.id);
            setTitle(r.title);
            setCategory(r.category || '');
            setUrl(r.url || '');
            setNotes(r.notes || '');
          }
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Silme Onayı',
              'Bu kaynağı silmek istediğininize emin misiniz?',
              [
                { text: 'İptal', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => deleteResource(r.id) }
              ]
            );
          }
        },
        { text: 'İptal', style: 'cancel' }
      ]
    );
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory ? r.category.toLowerCase() === filterCategory.toLowerCase() : true;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(resources.map(r => r.category).filter(c => c)));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header subtitle="Kütüphane" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Kütüphane Yönetimi */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Kütüphane Yönetimi</Text>
            <Text style={styles.cardSub}>{resources.length} kaynak</Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Kaynak adı</Text>
            <TextInput style={styles.inputField} placeholder="Kaynak adı" placeholderTextColor={theme.colors.onSurfaceVariant} value={title} onChangeText={setTitle} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Kategori</Text>
            <TextInput style={styles.inputField} placeholder="Örn. Antrenman, Beslenme" placeholderTextColor={theme.colors.onSurfaceVariant} value={category} onChangeText={setCategory} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Bağlantı (isteğe bağlı)</Text>
            <TextInput style={styles.inputField} placeholder="https://..." placeholderTextColor={theme.colors.onSurfaceVariant} value={url} onChangeText={setUrl} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Ana fikir / çıkarım</Text>
            <TextInput style={[styles.inputField, { height: 80, textAlignVertical: 'top' }]} placeholder="Kısa bir not ekle..." placeholderTextColor={theme.colors.onSurfaceVariant} multiline value={notes} onChangeText={setNotes} />
          </View>
          
          <TouchableOpacity style={styles.submitBtn} onPress={handleAddResource} disabled={loading}>
            <Icon name={editingId ? "edit" : "add"} size={20} color={theme.colors.onPrimaryContainer} />
            <Text style={styles.submitBtnText}>{editingId ? 'Kaynağı güncelle' : 'Kütüphaneye ekle'}</Text>
          </TouchableOpacity>
        </View>

        {/* Kaynaklarını Bul */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kaynaklarını bul</Text>
          
          <View style={styles.searchBox}>
            <TextInput style={styles.searchInput} placeholder="Kaynak ara" placeholderTextColor={theme.colors.onSurfaceVariant} value={searchQuery} onChangeText={setSearchQuery} />
            <Icon name="search" size={20} color={theme.colors.onSurfaceVariant} />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <TouchableOpacity style={filterCategory === '' ? styles.chipActive : styles.chipInactive} onPress={() => setFilterCategory('')}>
              <Text style={filterCategory === '' ? styles.chipTextActive : styles.chipTextInactive}>Tümü</Text>
            </TouchableOpacity>
            {categories.map((cat, idx) => (
              <TouchableOpacity key={idx} style={filterCategory === cat ? styles.chipActive : styles.chipInactive} onPress={() => setFilterCategory(cat)}>
                <Text style={filterCategory === cat ? styles.chipTextActive : styles.chipTextInactive}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.list}>
            {loading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : filteredResources.length === 0 ? (
              <Text style={styles.emptyText}>Kaynak bulunamadı.</Text>
            ) : (
              filteredResources.map(r => (
                <TouchableOpacity 
                  key={r.id} 
                  style={styles.listItem} 
                  onLongPress={() => handleLongPress(r)} 
                  onPress={() => {
                    if (r.url) {
                      const finalUrl = r.url.toLowerCase().startsWith('http') ? r.url : `https://${r.url}`;
                      Linking.openURL(finalUrl).catch(err => console.log('Invalid URL', err));
                    }
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Sol Kısım */}
                    <View style={{ flex: 1, paddingRight: 8, justifyContent: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        <Text style={styles.listItemTitle}>{r.title}</Text>
                        {r.category ? (
                          <View style={styles.catBadge}>
                            <Text style={styles.catBadgeText}>{r.category}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>

                    {/* Sağ Kısım */}
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', borderLeftWidth: 1, borderLeftColor: theme.colors.surfaceBorder, paddingLeft: 8 }}>
                      {!!r.notes ? (
                        <Text style={[styles.listItemNotes, { flex: 1, marginRight: r.url ? 8 : 0 }]} numberOfLines={3}>
                          {r.notes}
                        </Text>
                      ) : (
                        <View style={{ flex: 1 }} />
                      )}
                      {r.url ? <Icon name="link" size={18} color={theme.colors.primary} /> : null}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
          

        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.margin, paddingVertical: 12, backgroundColor: 'rgba(18, 19, 22, 0.85)', borderBottomWidth: 1, borderBottomColor: 'rgba(38, 40, 46, 0.6)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { ...theme.typography.titleLg, color: theme.colors.onSurface, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.surfaceContainerHigh, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.surfaceBorder },
  dateBadgeText: { ...theme.typography.labelSm, color: theme.colors.primary, fontWeight: 'bold' },
  iconBtn: { padding: 8 },
  
  scrollContent: { padding: theme.spacing.margin, paddingBottom: 24, gap: 16 },
  
  card: { backgroundColor: theme.colors.surfaceContainer, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.colors.surfaceBorder, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { ...theme.typography.labelLg, color: theme.colors.primary, fontWeight: 'bold' },
  cardSub: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  
  formGroup: { gap: 4 },
  inputLabel: { fontSize: 11, color: theme.colors.onSurfaceVariant, fontWeight: '500' },
  inputField: { backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.surfaceBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: theme.colors.onSurface, fontSize: 13 },
  
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.colors.primary, height: 48, borderRadius: 12, marginTop: 4 },
  submitBtnText: { ...theme.typography.labelLg, color: theme.colors.onPrimaryContainer, fontWeight: 'bold' },
  
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.surfaceBorder, borderRadius: 12, paddingHorizontal: 14 },
  searchInput: { flex: 1, height: 44, color: theme.colors.onSurface, fontSize: 13 },
  
  chipRow: { gap: 8, paddingVertical: 4 },
  chipActive: { backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  chipTextActive: { fontSize: 12, color: theme.colors.primary, fontWeight: '500' },
  chipInactive: { backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.surfaceBorder, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  chipTextInactive: { fontSize: 12, color: theme.colors.onSurfaceVariant, fontWeight: '500' },
  
  list: { gap: 8, marginTop: 8 },
  emptyText: { ...theme.typography.bodySm, color: theme.colors.onSurfaceVariant, textAlign: 'center', paddingVertical: 16 },
  listItem: { backgroundColor: theme.colors.surfaceContainerLowest, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.surfaceBorder, minHeight: 64, justifyContent: 'center' },
  listItemTitle: { ...theme.typography.labelMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  catBadge: { backgroundColor: 'rgba(255, 152, 0, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255, 152, 0, 0.2)' },
  catBadgeText: { fontSize: 9, color: '#ff9800', fontWeight: 'bold', textTransform: 'uppercase' },
  listItemNotes: { fontSize: 11, color: theme.colors.onSurfaceVariant, lineHeight: 16 },
});
