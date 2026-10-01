import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useLibrary } from '../hooks/useLibrary';

import { Header } from '../components/Header';

export const LibraryScreen = () => {
  const navigation = useNavigation();
  const { resources, loading, addResource, deleteResource } = useLibrary();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const handleAddResource = () => {
    if (!title.trim()) return;
    addResource(title, category, url, notes);
    setTitle('');
    setCategory('');
    setUrl('');
    setNotes('');
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
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
            <Icon name="add" size={20} color={theme.colors.onPrimaryContainer} />
            <Text style={styles.submitBtnText}>Kütüphaneye ekle</Text>
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
                <TouchableOpacity key={r.id} style={styles.listItem} onLongPress={() => deleteResource(r.id)} onPress={() => r.url ? Linking.openURL(r.url) : null}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.listItemTitle}>{r.title}</Text>
                    {r.url ? <Icon name="link" size={16} color={theme.colors.primary} /> : null}
                  </View>
                  {r.category ? <Text style={styles.listItemCat}>{r.category}</Text> : null}
                  {!!r.notes && <Text style={styles.listItemNotes}>{r.notes}</Text>}
                </TouchableOpacity>
              ))
            )}
          </View>
          
          <View style={styles.pagination}>
            <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageBtnText}>Önceki</Text></TouchableOpacity>
            <Text style={styles.pageText}>1 / 1</Text>
            <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageBtnText}>Sonraki</Text></TouchableOpacity>
          </View>
        </View>

      </ScrollView>
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
  
  scrollContent: { padding: theme.spacing.margin, paddingBottom: 100, gap: 16 },
  
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
  listItem: { backgroundColor: theme.colors.surfaceContainerLowest, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.surfaceBorder },
  listItemTitle: { ...theme.typography.labelMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  listItemCat: { fontSize: 10, color: theme.colors.primary, marginTop: 2 },
  listItemNotes: { ...theme.typography.bodySm, color: theme.colors.onSurfaceVariant, marginTop: 6 },
  
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  pageBtn: { backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.surfaceBorder, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  pageBtnText: { fontSize: 12, color: theme.colors.onSurfaceVariant, fontWeight: '500' },
  pageText: { fontSize: 12, color: theme.colors.onSurfaceVariant, fontWeight: 'bold' },
});
