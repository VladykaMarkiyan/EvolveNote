import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getLocalDateString = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

interface Task {
  id: string | number;
  text: string;
  done: boolean;
  is_active: boolean;
  frequency: string;
}

interface Goal {
  id: string;
  text: string;
  start_date: string;
  end_date: string;
  tasks: Task[];
}

export default function CalendarScreen() {
  const today = getLocalDateString(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [expandedGoals, setExpandedGoals] = useState<string[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [])
  );

  const fetchGoals = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/goals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        // ФІЛЬТР: Залишаємо тільки ті цілі, які НЕ в архіві
        const activeGoals = data.filter((g: any) => !g.is_archived);
        
        setGoals(activeGoals);
        if (activeGoals.length > 0) {
          setExpandedGoals([activeGoals[0].id.toString()]);
        }
      }
    } catch (error) {
      console.error("Fetch calendar goals error:", error);
    }
  };

  const toggleExpand = (goalId: string) => {
    setExpandedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId) 
        : [...prev, goalId]
    );
  };

  const handleTaskPress = async (goalId: string, taskId: string | number) => {
    if (selectedDate > today) {
      Alert.alert("Hold on! ⏳", "You can't complete tasks from the future. Wait for this day to arrive!");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setGoals(prevGoals => prevGoals.map(goal => {
          if (goal.id === goalId) {
            return {
              ...goal,
              tasks: goal.tasks.map(t => t.id === taskId ? updatedTask : t)
            };
          }
          return goal;
        }));
      }
    } catch (error) {
      console.error("Toggle task error:", error);
    }
  };

  const markedDates = useMemo(() => {
    return {
      [today]: { marked: true, dotColor: '#3b82f6' },
      [selectedDate]: { 
        selected: true, 
        selectedColor: '#3b82f6',
        selectedTextColor: '#ffffff' 
      },
    };
  }, [selectedDate, today]);

  const getTasksForDate = (goal: Goal, dateStr: string) => {
    // 1. Минуле і дати поза межами цілі приховуємо
    if (dateStr < today) return [];
    if (goal.start_date && dateStr < goal.start_date) return [];
    if (goal.end_date && dateStr > goal.end_date) return [];

    // 2. Визначаємо парність дня
    const dayNum = parseInt(dateStr.split('-')[2], 10);
    const isOdd = dayNum % 2 !== 0;

    // 3. Рахуємо різницю днів для Weekly тасок
    const startMs = new Date(goal.start_date).setHours(0, 0, 0, 0);
    const currentMs = new Date(dateStr).setHours(0, 0, 0, 0);
    const diffDays = Math.round((currentMs - startMs) / (1000 * 60 * 60 * 24));

    return goal.tasks.filter(t => {
      // Якщо це сьогодні і таска деактивована — не показуємо
      if (dateStr === today && !t.is_active) return false;

      if (t.frequency === 'daily') return true;
      if (t.frequency === 'weekly') return diffDays >= 0 && diffDays % 7 === 0; // Точно кожен 7-й день
      if (t.frequency === 'odd') return isOdd;
      if (t.frequency === 'even') return !isOdd;
      
      return false;
    }).map(t => ({ 
      ...t, 
      done: dateStr === today ? t.done : false // Галочки зберігаємо тільки для сьогоднішнього дня
    }));
  };

  const goalsWithVisibleTasks = goals.map(goal => ({
    ...goal,
    visibleTasks: getTasksForDate(goal, selectedDate)
  })).filter(g => g.visibleTasks.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹ BACK</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>

        <View style={styles.calendarCard}>
          <Calendar
            current={today}
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#9aa1ad',
              selectedDayBackgroundColor: '#3b82f6',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#3b82f6',
              dayTextColor: '#111',
              textDisabledColor: '#d9e1e8',
              arrowColor: '#111',
              monthTextColor: '#111',
              textDayFontWeight: '600',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              ['stylesheet.calendar.header' as any]: {
                dayHeader: {
                  marginTop: 2,
                  marginBottom: 7,
                  width: 32,
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#9aa1ad',
                  fontWeight: '700'
                }
              }
            } as any}
          />
        </View>

        <LinearGradient
          colors={['#3b82f6', '#2dd4bf']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.streakCard}
        >
          <View style={styles.streakInfo}>
            <View style={styles.streakIconCircle}>
               <Ionicons name="flame" size={24} color="#22c55e" />
            </View>
            <View style={styles.streakTextContent}>
              <Text style={styles.streakLabel}>Current Streak</Text>
              <Text style={styles.streakValue}>12 Days</Text>
            </View>
          </View>
          <View style={styles.streakDots}>
            {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
              <View key={i} style={[styles.dot, i < 6 ? styles.dotActive : styles.dotInactive]} />
            ))}
          </View>
        </LinearGradient>

        {selectedDate < today ? (
           <View style={{alignItems: 'center', marginTop: 20}}>
             <Text style={{color: '#7b8494', fontSize: 16, fontWeight: '600'}}>Past is in the past 🍃</Text>
             <Text style={{color: '#9aa1ad', marginTop: 5}}>Focus on today and tomorrow.</Text>
           </View>
        ) : goalsWithVisibleTasks.length === 0 ? (
           <View style={{alignItems: 'center', marginTop: 20}}>
             <Text style={{color: '#9aa1ad'}}>No tasks scheduled for this day.</Text>
           </View>
        ) : (
          goalsWithVisibleTasks.map((goal) => {
            const isExpanded = expandedGoals.includes(goal.id.toString());
            return (
              <View key={goal.id} style={styles.goalSection}>
                <TouchableOpacity 
                  style={styles.goalHeader} 
                  onPress={() => toggleExpand(goal.id.toString())}
                  activeOpacity={0.6}
                >
                  <Text style={styles.goalTitle}>{goal.text}</Text>
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#3b82f6" 
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.tasksContainer}>
                    {goal.visibleTasks.map((task) => (
                      <TouchableOpacity 
                        key={task.id} 
                        style={[styles.taskItem, task.done && styles.taskItemCompleted]}
                        onPress={() => handleTaskPress(goal.id, task.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.checkbox, task.done && styles.checkboxChecked]}>
                          {task.done && <Ionicons name="checkmark" size={16} color="#fff" />}
                        </View>
                        <Text style={[styles.taskText, task.done && styles.taskTextCompleted]}>
                          {task.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                <View style={styles.divider} />
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ОНОВЛЕНА НАВІГАЦІЯ */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Image source={require('../assets/home-g.png')} style={styles.navIconMain} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Image source={require('../assets/motiv-g.png')} style={styles.navIconMain} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeNav}>
            <Image source={require('../assets/calend-g.png')} style={[styles.navIconMain, { tintColor: '#fff' }]} />
          </View>
        </TouchableOpacity>
        
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings')}>
          <Image source={require('../assets/settings-g.png')} style={styles.navIconMain} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 25, paddingBottom: 130 },
  backButton: { marginBottom: 20 },
  backText: { color: '#9aa1ad', fontSize: 16, fontWeight: 'bold' },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111', marginTop: 4 },
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  streakCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  streakInfo: { flexDirection: 'row', alignItems: 'center' },
  streakIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  streakTextContent: {},
  streakLabel: { color: '#fff', fontSize: 11, fontWeight: '600', opacity: 0.9 },
  streakValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  streakDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  dotActive: { backgroundColor: '#fff' },
  dotInactive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  goalSection: { marginBottom: 5 },
  goalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 15
  },
  goalTitle: { fontSize: 17, fontWeight: 'bold', color: '#4b5563' },
  tasksContainer: { paddingBottom: 10 },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f3f7',
  },
  taskItemCompleted: { backgroundColor: '#f3f4f6', opacity: 0.8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#fff'
  },
  checkboxChecked: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  taskText: { fontSize: 15, color: '#374151', fontWeight: '500' },
  taskTextCompleted: { color: '#9aa1ad', textDecorationLine: 'line-through' },
  divider: { height: 1, backgroundColor: '#f1f3f7', width: '100%' },

  // СТИЛІ НАВІГАЦІЇ
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
  activeNav: { backgroundColor: '#333', padding: 8, borderRadius: 16 }
});