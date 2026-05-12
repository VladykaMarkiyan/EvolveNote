import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, 
  Image, Modal, ScrollView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface GoalItem {
  id: string;
  text: string;
  start_date?: string;
  end_date?: string;
  tasks_count?: number;
  progress?: string;
  months?: number;
  isFinished?: boolean; 
}

export default function GoalsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); // Зчитуємо параметри
  const sourceTab = params.source || 'settings';
  const [goalsList, setGoalsList] = useState<GoalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<GoalItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [])
  );

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        router.replace('/');
        return;
      }

      const response = await fetch(`${API_URL}/goals`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        const todayMs = new Date().setHours(0, 0, 0, 0);

        const formattedGoals = data.map((g: any) => {
          const startMs = new Date(g.start_date).getTime();
          const endMs = new Date(g.end_date).getTime();
          
          let calcMonths = 1;
          if (startMs && endMs) {
             calcMonths = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24 * 30)));
          }

          let totalExpectedTasks = 0;
          let totalCompletedTasks = 0;
          const totalDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));

          if (g.tasks) {
              g.tasks.forEach((t: any) => {
                  let expected = totalDays > 0 ? totalDays : 1;
                  if (t.frequency === 'odd' || t.frequency === 'even') expected = Math.max(1, Math.round(totalDays / 2));
                  else if (t.frequency === 'weekly') expected = Math.max(1, Math.ceil(totalDays / 7));
                  
                  totalExpectedTasks += expected;
                  totalCompletedTasks += (t.completed_count || 0);
              });
          }

          let taskPercent = 0;
          if (totalExpectedTasks > 0) {
              taskPercent = Math.min(100, Math.max(0, Math.round((totalCompletedTasks / totalExpectedTasks) * 100)));
          }

          // Ціль завершена, якщо вийшов час АБО якщо юзер натиснув галочку (is_archived = true)
          const isFinished = (endMs < todayMs) || g.is_archived;

          return {
            id: g.id.toString(),
            text: g.title || g.text || "Без назви",
            start_date: g.start_date,
            end_date: g.end_date,
            tasks_count: g.tasks ? g.tasks.length : 0,
            months: calcMonths,
            progress: `${taskPercent}%`,
            isFinished: isFinished
          };
        });
        
        setGoalsList(formattedGoals);
      } else {
        console.error("Помилка завантаження цілей:", data.error);
      }
    } catch (error) {
      console.error("Мережева помилка", error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeGoals = goalsList.filter(g => !g.isFinished);
  const archivedGoals = goalsList.filter(g => g.isFinished);

  const requestDelete = (id: string) => {
    setGoalToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!goalToDelete) return;

    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/goals/${goalToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setGoalsList(prev => prev.filter(t => t.id !== goalToDelete));
        setIsDeleteModalVisible(false);
        setGoalToDelete(null);
      } else {
        const data = await response.json();
        Alert.alert("Помилка", data.error || "Не вдалося видалити ціль");
      }
    } catch (error) {
      Alert.alert("Помилка", "Проблема з мережею при видаленні");
    }
  };

  // ФУНКЦІЯ РУЧНОГО ЗАВЕРШЕННЯ ЦІЛІ
  // ОНОВЛЕНА ФУНКЦІЯ РУЧНОГО ЗАВЕРШЕННЯ ЦІЛІ З ПІДТВЕРДЖЕННЯМ
  const handleFinishManual = (id: string) => {
    Alert.alert(
      "Finish Goal?",
      "Move this goal to archive?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Finish",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('access_token');
              const response = await fetch(`${API_URL}/goals/${id}`, {
                method: 'PUT',
                headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json' // ПЕРЕВІР, ЩО ЦЕ Є
                },
                body: JSON.stringify({ is_archived: true }) // Надсилаємо True
              });

              if (response.ok) {
                // Після успішного PUT обов'язково перетягуємо дані заново
                await fetchGoals(); 
                Alert.alert("Success", "Goal moved to archive!");
              }
            } catch (error) {
               console.error(error);
            }
          }
        }
      ]
    );
  };

  const handleEdit = (item: GoalItem) => {
    router.push({
      pathname: '/goaldetails',
      params: { 
        id: item.id, 
        text: item.text, 
        start_date: item.start_date, 
        end_date: item.end_date,
        mode: 'edit'
      }
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) 
      ? dateStr 
      : date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // ОНОВЛЕНА ФУНКЦІЯ КОЛЬОРІВ ЗА ТВОЇМИ ПРАВИЛАМИ
  const getArchiveColor = (progressStr?: string) => {
    const val = parseInt(progressStr || '0', 10);
    if (val >= 80) return '#10b981'; // Зелений (80 - 100)
    if (val >= 60) return '#fbbf24'; // Жовтий (60 - 79)
    return '#f97316'; // Оранжевий (0 - 59)
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtnWrapper} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#9aa1ad" />
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Goals</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'active' && styles.activeTab]} 
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active Goals</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]} 
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Archive</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'active' ? 'My Active Goals' : 'My Completed Goals'}
          </Text>
          <Text style={styles.itemsCount}>
            {activeTab === 'active' ? activeGoals.length : archivedGoals.length} items
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 50 }} />
        ) : activeTab === 'active' ? (
          activeGoals.length > 0 ? (
            activeGoals.map((item) => (
              <View key={item.id} style={styles.activeCard}>
                <View style={styles.archiveHeader}>
                  <Text style={styles.statusBadgeActive}>IN PROGRESS</Text>
                  
                  <View style={styles.activeActions}>
                    {/* НОВА КНОПКА ЗАВЕРШЕННЯ (переносить в архів) */}
                    <TouchableOpacity onPress={() => handleFinishManual(item.id)} style={styles.iconBtn}>
                      <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
                      <Ionicons name="pencil" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => requestDelete(item.id)} style={styles.iconBtn}>
                      <Ionicons name="trash" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={styles.archiveGoalTitle}>{item.text}</Text>
                
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{item.months}</Text>
                    <Text style={styles.statLabel}>Months</Text>
                  </View>
                  <View style={[styles.statItem, styles.statBorder]}>
                    <Text style={styles.statValue}>{item.tasks_count}</Text>
                    <Text style={styles.statLabel}>Tasks</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, {color: '#3b82f6'}]}>{item.progress}</Text>
                    <Text style={styles.statLabel}>Done</Text>
                  </View>
                </View>

                <View style={styles.dateInfoContainer}>
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Start Date</Text>
                    <Text style={styles.dateValue}>{formatDate(item.start_date)}</Text>
                  </View>
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Deadline</Text>
                    <Text style={styles.dateValue}>{formatDate(item.end_date)}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 40 }}>
              You don't have active goals yet.
            </Text>
          )
        ) : (
          archivedGoals.length > 0 ? (
            archivedGoals.map((item) => {
              // ОБЧИСЛЮЄМО КОЛІР ДЛЯ КОЖНОЇ КАРТКИ В АРХІВІ
              const cardColor = getArchiveColor(item.progress);

              return (
                <View key={item.id} style={[styles.archiveCard, { borderLeftColor: cardColor }]}>
                  <View style={styles.archiveHeader}>
                    <Text style={[styles.statusBadge, { color: cardColor }]}>COMPLETED</Text>
                    
                    <View style={styles.activeActions}>
                      <Ionicons name="checkmark-circle" size={26} color={cardColor} style={{marginRight: 10}} />
                      <TouchableOpacity onPress={() => requestDelete(item.id)} style={styles.iconBtn}>
                        <Ionicons name="trash" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <Text style={styles.archiveGoalTitle}>{item.text}</Text>
                  
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{item.months}</Text>
                      <Text style={styles.statLabel}>Months</Text>
                    </View>
                    <View style={[styles.statItem, styles.statBorder]}>
                      <Text style={styles.statValue}>{item.tasks_count}</Text>
                      <Text style={styles.statLabel}>Tasks</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: cardColor }]}>{item.progress}</Text>
                      <Text style={styles.statLabel}>Done</Text>
                    </View>
                  </View>

                  <View style={styles.dateInfoContainer}>
                    <View style={styles.dateRow}>
                      <Text style={styles.dateLabel}>Start Date</Text>
                      <Text style={styles.dateValue}>{formatDate(item.start_date)}</Text>
                    </View>
                    <View style={styles.dateRow}>
                      <Text style={styles.dateLabel}>Deadline</Text>
                      <Text style={styles.dateValue}>{formatDate(item.end_date)}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 40 }}>
              Your archive is empty. Wait until a goal's deadline passes or finish one manually.
            </Text>
          )
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Image source={require('../assets/home-g.png')} style={styles.navIconMain} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Image source={require('../assets/motiv-g.png')} style={styles.navIconMain} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/calendar')}>
          <Image source={require('../assets/calend-g.png')} style={styles.navIconMain} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeNav}>
            <Image source={require('../assets/settings-g.png')} style={[styles.navIconMain, { tintColor: '#fff' }]} />
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={isDeleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.warningIconContainer}>
              <Ionicons name="alert-circle" size={40} color="#ef4444" />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Goal?</Text>
            <Text style={styles.deleteModalSub}>Are you sure you want to delete this goal? This action cannot be undone.</Text>
            
            <View style={styles.deleteActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteBtn} 
                onPress={handleDelete}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 130 },
  header: { height: 50, justifyContent: 'center', paddingHorizontal: 15 },
  backBtnWrapper: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#9aa1ad', fontWeight: '700', fontSize: 13, marginLeft: 2 },
  title: { fontSize: 28, fontWeight: '800', color: '#111', marginTop: 10, marginBottom: 25 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 14, padding: 4, marginBottom: 30 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 },
  tabText: { color: '#64748b', fontWeight: '600', fontSize: 14 },
  activeTabText: { color: '#3b82f6' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#565e6d' },
  itemsCount: { fontSize: 13, color: '#94a3b8' },

  activeCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 20,
    borderWidth: 1, borderColor: '#f1f3f7', elevation: 5, shadowColor: '#000', shadowOpacity: 0.08,
    borderLeftWidth: 5, borderLeftColor: '#3b82f6'
  },
  statusBadgeActive: { color: '#3b82f6', fontWeight: '800', fontSize: 10, letterSpacing: 0.5 },
  activeActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconBtn: { padding: 4 },

  archiveCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 20,
    borderWidth: 1, borderColor: '#f1f3f7', elevation: 5, shadowColor: '#000', shadowOpacity: 0.08,
    borderLeftWidth: 5, 
  },
  statusBadge: { fontWeight: '800', fontSize: 10, letterSpacing: 0.5 },
  
  archiveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  archiveGoalTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, paddingHorizontal: 10 },
  statItem: { alignItems: 'center', flex: 1 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#f1f5f9' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#334155' },
  statLabel: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  dateInfoContainer: { gap: 10 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateLabel: { color: '#94a3b8', fontSize: 13 },
  dateValue: { color: '#1e293b', fontWeight: '700', fontSize: 13 },

  bottomNav: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: 90, 
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderTopColor: '#f1f3f7',
    paddingBottom: Platform.OS === 'ios' ? 25 : 15
  },
  navItem: {top: 7, alignItems: 'center', justifyContent: 'center' },
  navIconMain: { width: 40, height: 40, resizeMode: 'contain', tintColor: '#9aa1ad' },
  activeNav: { backgroundColor: '#333', padding: 8, borderRadius: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  deleteModalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 24, padding: 25, alignItems: 'center' },
  warningIconContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  deleteModalTitle: { fontSize: 20, fontWeight: '800', color: '#1f2937', marginBottom: 10 },
  deleteModalSub: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginBottom: 25 },
  deleteActions: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#f3f4f6', alignItems: 'center' },
  cancelBtnText: { color: '#4b5563', fontWeight: '700', fontSize: 15 },
  deleteBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#ef4444', alignItems: 'center' },
  deleteBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 }
});