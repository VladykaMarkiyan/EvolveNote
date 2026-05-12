import React, { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent, RefreshControl, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.88; 
const SPACING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

interface Task {
  id: string;
  text: string;
  done: boolean;
  is_active: boolean; 
  frequency: string;
  completed_count: number;
}

interface Goal {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  tasks: Task[];
  isDummy?: boolean;
}

export default function HomeScreen() {
  const lastIndex = useRef(0);
  const [goalsList, setGoalsList] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userName, setUserName] = useState('USER');
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [allGoalsCount, setAllGoalsCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const [goalStats, setGoalStats] = useState({
    completedDays: 0,
    daysLeft: 0,
    progressPercent: 0,
    totalDays: 0,
    deadlineFormatted: '---'
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const storedName = await AsyncStorage.getItem('username');
    if (storedName) setUserName(storedName.toUpperCase());
    await fetchGoals();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const fetchGoals = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL;
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return router.replace('/');

      const response = await fetch(`${API_URL}/goals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        const todayMs = new Date().setHours(0, 0, 0, 0);

        const activeData = data.filter((g: any) => {
          const endMs = new Date(g.end_date).getTime();
          const isNotArchived = !g.is_archived;
          const isNotExpired = endMs >= todayMs; 

          return isNotArchived && isNotExpired;
        });

        setAllGoalsCount(activeData.length);
        
        const formatted = activeData.map((g: any) => ({
          id: g.id.toString(),
          title: g.text,
          start_date: g.start_date,
          end_date: g.end_date,
          tasks: g.tasks || []
        }));

        const finalData = [...formatted.reverse(), { id: 'ADD_NEW', isDummy: true, title: 'ADD NEW' } as Goal];
        setGoalsList(finalData);

        if (finalData.length > 0) {
          updateActiveGoal(finalData[lastIndex.current] || finalData[0]);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const calculateProgress = (start: string, end: string) => {
    if (!start || !end) return { completed: 0, left: 0, total: 0, deadline: '---', startFormatted: '---', isFuture: false };
    const parse = (str: string) => {
      const [y, m, d] = str.split('-').map(Number);
      return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
    };
    const startMs = parse(start);
    const endMs = parse(end);
    const todayMs = new Date().setHours(0, 0, 0, 0);
    const oneDay = 24 * 60 * 60 * 1000;
    const isFuture = todayMs < startMs;
    const total = Math.round((endMs - startMs) / oneDay);
    const effectiveToday = Math.max(todayMs, startMs); 
    const left = Math.max(0, Math.round((endMs - effectiveToday) / oneDay));
    const completed = Math.max(0, total - left);

    return {
      completed, left, total, isFuture,
      startFormatted: new Date(startMs).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      deadline: new Date(endMs).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
  };

  const updateActiveGoal = (goal: Goal) => {
    setCurrentGoal(goal);
    setTasks(goal.isDummy ? [] : goal.tasks);
    if (!goal.isDummy) {
      const res = calculateProgress(goal.start_date, goal.end_date);
      const activeTasks = goal.tasks.filter(t => t.is_active);
      const doneTasks = activeTasks.filter(t => t.done).length;
      const percent = activeTasks.length > 0 ? Math.round((doneTasks / activeTasks.length) * 100) : 0;

      setGoalStats({
        completedDays: res.completed,
        daysLeft: res.left,
        totalDays: res.total,
        progressPercent: percent,
        deadlineFormatted: res.deadline
      });
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 20));
    if (index !== lastIndex.current && goalsList[index]) {
      lastIndex.current = index;
      updateActiveGoal(goalsList[index]);
    }
  };

  const timerRef = useRef<any>({}); 

  const getTasksForToday = () => {
    if (!currentGoal || currentGoal.isDummy) return [];
    
    const todayMs = new Date().setHours(0, 0, 0, 0);
    const startMs = new Date(currentGoal.start_date).setHours(0, 0, 0, 0);
    
    const diffDays = Math.round((todayMs - startMs) / (1000 * 60 * 60 * 24));
    const todayDayNum = new Date().getDate();
    const isOdd = todayDayNum % 2 !== 0;

    return tasks.filter(t => {
      if (!t.is_active) return false; 
      
      if (t.frequency === 'daily') return true;
      if (t.frequency === 'weekly') return diffDays >= 0 && diffDays % 7 === 0; 
      if (t.frequency === 'odd') return isOdd;
      if (t.frequency === 'even') return !isOdd;
      
      return true;
    });
  };

  const todayTasks = getTasksForToday(); 

  const toggleTask = (taskId: string) => {
    // 1. Оновлюємо інтерфейс миттєво (Optimistic)
    const updateState = (t: Task) => {
      if (t.id === taskId) {
        const isNowDone = !t.done; 
        return {
          ...t,
          done: isNowDone,
          completed_count: isNowDone 
            ? (t.completed_count || 0) + 1 
            : Math.max(0, (t.completed_count || 0) - 1)
        };
      }
      return t;
    };
    
    const updatedTasks = tasks.map(updateState);
    setTasks(updatedTasks);
    
    const updatedGoalsList = goalsList.map(g => 
      g.id === currentGoal?.id ? { ...g, tasks: g.tasks.map(updateState) } : g
    );
    setGoalsList(updatedGoalsList);

    // 2. ПЕРЕВІРКА НА 100% ЗАГАЛЬНОГО ПРОГРЕСУ ЦІЛІ
    if (currentGoal && !currentGoal.isDummy) {
      const targetGoal = updatedGoalsList.find(g => g.id === currentGoal.id);
      
      if (targetGoal) {
        const res = calculateProgress(targetGoal.start_date, targetGoal.end_date);
        let totalExpectedTasks = 0; 
        let totalCompletedTasks = 0; 

        targetGoal.tasks.forEach(t => {
          let expected = res.total > 0 ? res.total : 1; 
          if (t.frequency === 'odd' || t.frequency === 'even') expected = Math.max(1, Math.round(res.total / 2));
          else if (t.frequency === 'weekly') expected = Math.max(1, Math.ceil(res.total / 7));
          
          totalExpectedTasks += expected;
          totalCompletedTasks += (t.completed_count || 0);
        });

        let taskPercent = 0;
        if (!res.isFuture && totalExpectedTasks > 0) {
          taskPercent = Math.min(100, Math.max(0, Math.round((totalCompletedTasks / totalExpectedTasks) * 100)));
        }

        // Якщо коло загального прогресу заповнилося на 100%
        if (taskPercent === 100) {
          setTimeout(() => {
            router.push({
              pathname: '/congrats',
              params: {
                title: targetGoal.title,
                totalDays: res.total,
                totalTasks: totalExpectedTasks
              }
            });
          }, 500); 
        }
      }
    }

    // 3. Дебаунс таймер для відправки на сервер
    if (timerRef.current[taskId]) {
      clearTimeout(timerRef.current[taskId]);
    }

    timerRef.current[taskId] = setTimeout(async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tasks/${taskId}/toggle`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {
        console.error("Sync failed", e);
      }
      delete timerRef.current[taskId];
    }, 500); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.app} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
      >
        <View style={styles.top}>
          <View>
            <Text style={styles.welcomeText}>WELCOME BACK</Text>
            <Text style={styles.nameText}>HELLO, <Text style={{ fontWeight: '700' }}>{userName}!</Text></Text>
          </View>
          <TouchableOpacity style={styles.goalsBadge}>
            <Text style={styles.goalsText}>{allGoalsCount}/3 GOALS</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={goalsList}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 20}
          decelerationRate="fast"
          onScroll={handleScroll}
          contentContainerStyle={{ paddingHorizontal: SPACING - 10, paddingVertical: 10 }}
          renderItem={({ item }) => {
            if (item.isDummy) {
              const isLimitReached = allGoalsCount >= 3;
              return (
                <View style={{ width: CARD_WIDTH, marginHorizontal: 10 }}>
                  <View style={[styles.progressCard, styles.dummyContainer]}>
                    <View style={styles.illustrationContainer}>
                      <View style={styles.outerCircle}>
                        <View style={styles.innerCircle}>
                          <View style={styles.targetCircle}>
                            <View style={styles.targetCenter} />
                          </View>
                        </View>
                        {!isLimitReached && (
                          <TouchableOpacity style={styles.smallPlusBtn} onPress={() => router.push('/goaldetails')}>
                            <Text style={styles.smallPlusText}>+</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    <Text style={styles.dummyTitle}>{isLimitReached ? "Goal Limit Reached" : "Continue Your Journey"}</Text>
                    <Text style={styles.dummyDescription}>
                      {isLimitReached 
                        ? "You have reached the limit. You can upgrade your Subscription!" 
                        : "Every great achievement begins with a single goal. What's next?"}
                    </Text>
                    {!isLimitReached && (
                      <TouchableOpacity style={styles.addBtnLarge} onPress={() => router.push('/goaldetails')}>
                        <Text style={{color: '#fff', fontWeight: '700'}}>Add New Goal +</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }

            const res = calculateProgress(item.start_date, item.end_date);
            let totalExpectedTasks = 0; 
            let totalCompletedTasks = 0; 

            item.tasks.forEach(t => {
              let expected = res.total > 0 ? res.total : 1; 
              if (t.frequency === 'odd' || t.frequency === 'even') expected = Math.max(1, Math.round(res.total / 2));
              else if (t.frequency === 'weekly') expected = Math.max(1, Math.ceil(res.total / 7));
              totalExpectedTasks += expected;
              totalCompletedTasks += (t.completed_count || 0);
            });

            let taskPercent = 0;
            if (!res.isFuture && totalExpectedTasks > 0) {
              taskPercent = Math.min(100, Math.max(0, Math.round((totalCompletedTasks / totalExpectedTasks) * 100)));
            }

            return (
              <View style={{ width: CARD_WIDTH, marginHorizontal: 10 }}>
                <View style={styles.goalCard}>
                  <View style={styles.goalContent}>
                    <Text style={styles.goalTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.goalActions}>
                      <TouchableOpacity style={styles.actionCalendar} onPress={() => router.push('/calendar')}>
                        <Image source={require('../assets/calend-g.png')} style={styles.navIcon} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionPlus} 
                        onPress={() => router.push({
                          pathname: '/goaldetails',
                          params: {
                            id: item.id,
                            text: item.title,
                            start_date: item.start_date,
                            end_date: item.end_date,
                            mode: 'edit'
                          }
                        })}
                      >
                        <Text style={{color: '#fff', fontSize: 20}}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.progressCard}>
                  <Text style={styles.progressHeader}>Current Progress</Text>
                  <View style={styles.progressContent}>
                    <View style={styles.side}>
                      <Text style={styles.sideNumber}>{res.completed}</Text>
                      <Text style={styles.sideLabel}>Days{"\n"}Completed</Text>
                    </View>
                    <View style={styles.circleContainer}>
                      <Svg viewBox="0 0 36 36" style={styles.svg}>
                        <Path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e0e6f0" strokeWidth="3" />
                        <Path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4caf50" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${Math.max(1, taskPercent)}, 100`} />
                      </Svg>
                      <View style={styles.percentOverlay}>
                        <Text style={styles.percentText}>{taskPercent}%</Text>
                        <Text style={styles.percentLabel}>Done</Text>
                      </View>
                    </View>
                    <View style={styles.side}>
                      <Text style={styles.sideNumber}>{res.left}</Text>
                      <Text style={styles.sideLabel}>Days{"\n"}Left</Text>
                    </View>
                  </View>
                  <Text style={styles.deadlineText}>
                    {res.isFuture ? 'Start: ' : 'Deadline '}
                    <Text style={{fontWeight:'700'}}>{res.isFuture ? res.startFormatted : res.deadline}</Text>
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {currentGoal && !currentGoal.isDummy && (
          <View style={styles.tasksSection}>
            <View style={styles.tasksHeader}>
              <Text style={styles.sectionTitle}>Tasks for Today</Text>
            </View>
            {calculateProgress(currentGoal.start_date, currentGoal.end_date).isFuture ? (
              <View style={styles.emptyTasks}>
                <Text style={{color: '#7b8494', fontSize: 16, fontWeight: '600'}}>Goal hasn't started yet</Text>
                <Text style={{color: '#9aa1ad', marginTop: 5}}>Starts on {calculateProgress(currentGoal.start_date, currentGoal.end_date).startFormatted}</Text>
              </View>
            ) : todayTasks.length === 0 ? (
              <View style={styles.emptyTasks}><Text style={{color: '#999'}}>No tasks for today</Text></View>
            ) : (
              todayTasks.map(item => (
                <TouchableOpacity key={item.id} style={styles.task} onPress={() => toggleTask(item.id)}>
                  <View style={[styles.check, item.done && styles.checkDone]}>{item.done && <Text style={styles.checkMark}>✓</Text>}</View>
                  <Text style={styles.taskText}>{item.text}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeNav}>
            <Image source={require('../assets/home-g.png')} style={[styles.navIconMain, { tintColor: '#fff' }]} />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Image source={require('../assets/motiv-g.png')} style={styles.navIconMain} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/calendar')}>
          <Image source={require('../assets/calend-g.png')} style={styles.navIconMain} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings')}>
          <Image source={require('../assets/settings-g.png')} style={styles.navIconMain} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f7fb' },
  app: { paddingBottom: 130 }, 
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  welcomeText: { fontSize: 12, color: '#9aa1ad' },
  nameText: { fontSize: 22, marginVertical: 4 },
  goalsBadge: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  goalsText: { color: '#3b82f6', fontSize: 13, fontWeight: '700' },
  goalCard: { backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 15, elevation: 2 },
  goalTitle: { fontSize: 20, fontWeight: '800', color: '#111', flex: 1, marginRight: 10 },
  goalContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalActions: { flexDirection: 'row', gap: 8 },
  actionCalendar: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#e6f0ff', justifyContent: 'center', alignItems: 'center' },
  actionPlus: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  progressCard: { backgroundColor: '#fff', padding: 20, borderRadius: 30, minHeight: 220, elevation: 1 },
  progressHeader: { textAlign: 'center', fontWeight: '800', color: '#111', marginBottom: 15 },
  progressContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  side: { alignItems: 'center' },
  sideNumber: { fontSize: 24, color: '#3b82f6', fontWeight: '800' },
  sideLabel: { fontSize: 10, color: '#7b8494', textAlign: 'center' },
  circleContainer: { width: 120, height: 120, position: 'relative' },
  svg: { width: '100%', height: '100%' },
  percentOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  percentText: { fontSize: 22, fontWeight: '800' },
  percentLabel: { fontSize: 10, color: '#7b8494' },
  deadlineText: { marginTop: 15, textAlign: 'center', fontSize: 12, color: '#7b8494' },
  tasksSection: { marginTop: 25, paddingHorizontal: 16 },
  tasksHeader: { marginBottom: 15 },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: '#111' },
  task: { backgroundColor: '#fff', padding: 16, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 12 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center' },
  checkDone: { backgroundColor: '#4caf50', borderColor: '#4caf50' },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  taskText: { fontSize: 16, color: '#374151', fontWeight: '500' },
  emptyTasks: { padding: 20, alignItems: 'center' },
  navIcon: { width: 22, height: 22, resizeMode: 'contain' },
  dummyContainer: { alignItems: 'center', justifyContent: 'center', minHeight: 320, backgroundColor: '#f8fbff' },
  illustrationContainer: { marginBottom: 20, alignItems: 'center' },
  outerCircle: { width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  innerCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  targetCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  targetCenter: { width: 20, height: 20, borderRadius: 10, borderWidth: 5, borderColor: 'rgba(255,255,255,0.3)' },
  smallPlusBtn: { position: 'absolute', bottom: 10, right: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  smallPlusText: { color: '#4caf50', fontSize: 20, fontWeight: 'bold' },
  dummyTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 8 },
  dummyDescription: { textAlign: 'center', color: '#9aa1ad', fontSize: 14, paddingHorizontal: 20, marginBottom: 20 },
  addBtnLarge: { backgroundColor: '#3b82f6', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 16 },

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
  navItem: { top: 7, alignItems: 'center', justifyContent: 'center' },
  navIconMain: { width: 40, height: 40, resizeMode: 'contain', tintColor: '#9aa1ad' },
  activeNav: { backgroundColor: '#333', padding: 8, borderRadius: 16 }
});