import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, FlatList, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

interface TaskItem {
  id: string;
  name: string;
  frequency: string;
}

export default function AddTasksScreen() {
  const params = useLocalSearchParams();
  const isEditMode = params.mode === 'edit';
  const goalId = params.goalId;

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(isEditMode);
  
  // Стейт для відстеження завантаження AI
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  useEffect(() => {
    if (params.fullTasksList) {
      try {
        const parsed = JSON.parse(params.fullTasksList as string);
        setTasks(parsed);
        setIsLoadingTasks(false);
      } catch (e) {
        console.error("Error parsing tasks list", e);
      }
    } else if (isEditMode && goalId) {
      fetchExistingTasks();
    }
  }, [params.fullTasksList, isEditMode, goalId]);

  const fetchExistingTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/goals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        const currentGoal = data.find((g: any) => g.id.toString() === goalId?.toString());
        if (currentGoal && currentGoal.tasks) {
          const formattedTasks = currentGoal.tasks.map((t: any) => ({
            id: t.id.toString(),
            name: t.text,
            frequency: t.frequency
          }));
          setTasks(formattedTasks);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // ФУНКЦІЯ ГЕНЕРАЦІЇ ТАСОК ЧЕРЕЗ AI
  // ФУНКЦІЯ ГЕНЕРАЦІЇ ТАСОК ЧЕРЕЗ AI
  const handleAiGenerate = async () => {
    setIsAiGenerating(true);
    
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/goals/generate-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: params.tempGoalName})
      });

      const data = await response.json();

      if (response.ok && data.tasks) {
        // Тепер AI повертає об'єкти з name та frequency
        const aiTasks = data.tasks.map((t: any) => ({
          id: (Date.now() + Math.random()).toString(),
          name: t.name,
          frequency: t.frequency // Використовуємо те, що запропонував AI
        }));
        setTasks(prev => [...prev, ...aiTasks]);
      } else {
        // Якщо AI вирішив, що ціль — дурниця, він поверне 400 помилку з текстом
        Alert.alert("AI Помічник", data.error || "Не вдалося згенерувати таски");
      }
    } 
    catch (e: any) {
      Alert.alert("Помилка мережі", "Перевірте з'єднання з інтернетом"); 
    } finally {
      setIsAiGenerating(false);
    }
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const editTask = (item: TaskItem) => {
    router.push({
      pathname: '/taskdetails' as any,
      params: {
        ...params,
        existingTasks: JSON.stringify(tasks),
        editTaskId: item.id,
        editTaskName: item.name,
        editTaskFreq: item.frequency
      }
    });
  };

  const finalizeGoalCreation = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token'); 
      if (!token) return;

      const getLocalDateString = (dateVal?: string | string[]) => {
        if (!dateVal) return null;
        const d = new Date(dateVal as string);
        if (isNaN(d.getTime())) return null; 
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      const payload = {
        title: params.tempGoalName,
        start_date: getLocalDateString(params.tempStartDate), 
        end_date: params.tempEndDate ? getLocalDateString(params.tempEndDate) : null,
        duration_days: params.tempDays ? parseInt(params.tempDays as string) : 0,
        duration_months: params.tempMonths ? parseInt(params.tempMonths as string) : 0,
        tasks: tasks.map(t => ({
          // Передаємо ID. Якщо це нова таска (створена через Date.now()), 
          // бекенд зрозуміє, що такого ID в базі немає і створить нову.
          id: t.id, 
          name: t.name,
          frequency: t.frequency
        }))
      };

      const url = isEditMode 
        ? `${process.env.EXPO_PUBLIC_API_URL}/goals/${goalId}` 
        : `${process.env.EXPO_PUBLIC_API_URL}/goals`;
        
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, { 
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Alert.alert("Success", isEditMode ? "Changes saved!" : "Goal created!");
        router.replace('/home'); 
      }
    } catch (e) {
      Alert.alert("Error", "Network error.");
    }
  };

  const renderItem = ({ item }: { item: TaskItem }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskLeft}>
        <View style={styles.dragHandle}>
          <View style={styles.line} />
          <View style={styles.line} />
          <View style={styles.line} />
        </View>
        <Text style={styles.taskName} numberOfLines={1}>{item.name}</Text>
      </View>
      
      <View style={styles.taskRight}>
        <View style={styles.freqBadge}>
          <Text style={styles.freqBadgeText}>{item.frequency}</Text>
        </View>
        <TouchableOpacity onPress={() => editTask(item)} style={styles.iconButton}>
          <Ionicons name="pencil-outline" size={20} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.iconButton}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/home')}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        <Text style={styles.title}>
          {isEditMode ? 'Edit Regular Tasks' : 'Add Regular Tasks'}
        </Text>
        <Text style={styles.subtitle}>For: {params.tempGoalName || "Goal"}</Text>

        <View style={styles.tasksHeader}>
          <Text style={styles.label}>Tasks</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* КНОПКА ГЕНЕРАЦІЇ AI */}
            <TouchableOpacity 
              style={[styles.addIconBtn, { backgroundColor: '#f5f3ff' }]} 
              onPress={handleAiGenerate}
              disabled={isAiGenerating}
            >
              {isAiGenerating ? (
                <ActivityIndicator size="small" color="#8b5cf6" />
              ) : (
                <Ionicons name="sparkles" size={18} color="#8b5cf6" />
              )}
            </TouchableOpacity>

            {/* КНОПКА ДОДАВАННЯ ВРУЧНУ */}
            <TouchableOpacity 
              style={styles.addIconBtn} 
              onPress={() => {
                if (tasks.length >= 15) {
                  Alert.alert("Limit Reached", "Max 15 tasks.");
                  return;
                }
                router.push({
                  pathname: '/taskdetails' as any,
                  params: { ...params, existingTasks: JSON.stringify(tasks) }
                });
              }}
            >
              <Text style={styles.addIconText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoadingTasks ? (
           <ActivityIndicator size="large" color="#3b82f6" style={{marginTop: 50}} />
        ) : (
          <FlatList
            data={tasks}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Add a task or use AI ✨</Text>
              </View>
            }
          />
        )}
      </View>

      <TouchableOpacity 
        style={[styles.createBtn, tasks.length > 0 ? styles.btnActive : styles.btnDisabled]}
        disabled={tasks.length === 0 || isLoadingTasks}
        onPress={finalizeGoalCreation}
      >
        <Text style={styles.createBtnText}>
          {isEditMode ? 'Save Changes' : 'Create Goal'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, alignItems: 'center' },
  backText: { color: '#9aa1ad', fontWeight: 'bold', fontSize: 14 },
  closeBtn: { fontSize: 22, color: '#9aa1ad' },
  main: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 5 },
  subtitle: { color: '#3b82f6', fontSize: 14, fontWeight: '600', marginBottom: 30 },
  tasksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  label: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  addIconBtn: { width: 40, height: 40, backgroundColor: '#eef2ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  addIconText: { color: '#3b82f6', fontSize: 24, fontWeight: 'bold' },
  list: { paddingBottom: 100 },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#9aa1ad', fontSize: 16 },
  taskCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6', elevation: 3 },
  taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dragHandle: { paddingRight: 15, gap: 3 },
  line: { width: 16, height: 2, backgroundColor: '#d1d5db', borderRadius: 1 },
  taskName: { fontSize: 15, fontWeight: '500', color: '#374151', flex: 1 },
  taskRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconButton: { padding: 4 },
  freqBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginRight: 6 },
  freqBadgeText: { color: '#22c55e', fontSize: 11, fontWeight: 'bold' },
  createBtn: { position: 'absolute', bottom: 30, left: 20, right: 20, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  btnActive: { backgroundColor: '#3b82f6' },
  btnDisabled: { backgroundColor: '#e5e7eb' },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});