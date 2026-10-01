import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { theme } from '../theme/theme';
import { Icon } from './Icon';
import { useNavigation } from '@react-navigation/native';
import { useDateContext } from '../context/DateContext';

interface HeaderProps {
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ subtitle }) => {
  const navigation = useNavigation<any>();
  const { selectedDate, setSelectedDate } = useDateContext();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [calDate, setCalDate] = useState(new Date(selectedDate));

  const dateObj = new Date(selectedDate);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const monthStr = dateObj.toLocaleString('tr-TR', { month: 'short' }).toUpperCase();
  const dateText = `${day} ${monthStr}`;

  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const handlePrevMonth = () => {
    setCalDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCalDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (d: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    setSelectedDate(dStr);
    setModalVisible(false);
  };

  const renderCalendar = () => {
    const cells = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.calDayEmpty} />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = dStr === selectedDate;
      cells.push(
        <TouchableOpacity 
          key={`day-${d}`} 
          style={[styles.calDay, isSelected && styles.calDaySelected]}
          onPress={() => handleSelectDay(d)}
        >
          <Text style={[styles.calDayText, isSelected && styles.calDayTextSelected]}>{d}</Text>
        </TouchableOpacity>
      );
    }
    return cells;
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 8 }}>
              <Icon name="arrow-back" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          )}
          <View style={styles.iconBox}>
            <Icon name="bolt" size={28} color={theme.colors.primary} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>TRKN</Text>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.dateBtn} onPress={() => {
            setCalDate(new Date(selectedDate));
            setModalVisible(true);
          }}>
            <Icon name="calendar-today" size={18} color={theme.colors.primary} />
            <Text style={styles.dateBtnText}>{dateText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
            <Icon name="settings" size={22} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tarih Seçin</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.monthSelector}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}><Icon name="chevron-left" size={24} color={theme.colors.onSurface} /></TouchableOpacity>
              <Text style={styles.monthText}>{monthNames[month]} {year}</Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}><Icon name="chevron-right" size={24} color={theme.colors.onSurface} /></TouchableOpacity>
            </View>

            <View style={styles.calendarGrid}>
              {['P', 'S', 'Ç', 'P', 'C', 'C', 'P'].map((d, i) => (
                <Text key={i} style={styles.calHeader}>{d}</Text>
              ))}
              {renderCalendar()}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.margin,
    backgroundColor: 'rgba(18, 19, 22, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(38, 40, 46, 0.6)'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: theme.rounded.xl,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  headerTextContainer: {
    justifyContent: 'center'
  },
  headerTitle: {
    ...theme.typography.headlineMd,
    color: theme.colors.primary,
    lineHeight: 28,
    fontWeight: 'bold'
  },
  headerSubtitle: {
    ...theme.typography.labelSm,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  dateBtn: {
    height: 36,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.rounded.full,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorderLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginRight: 4
  },
  dateBtnText: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurface
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorderLight
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.primary,
    fontWeight: 'bold'
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorderLight
  },
  navBtn: {
    padding: 12
  },
  monthText: {
    ...theme.typography.titleMd,
    color: theme.colors.onSurface
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start'
  },
  calHeader: {
    width: '11.5%',
    textAlign: 'center',
    ...theme.typography.labelSm,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 8
  },
  calDayEmpty: {
    width: '11.5%',
    height: 40
  },
  calDay: {
    width: '11.5%',
    height: 40,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(38, 40, 46, 0.6)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  calDaySelected: {
    backgroundColor: theme.colors.primaryContainer,
    borderColor: theme.colors.primary
  },
  calDayText: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurface
  },
  calDayTextSelected: {
    color: theme.colors.onPrimaryContainer,
    fontWeight: 'bold'
  }
});
