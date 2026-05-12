import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

const frequencies = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'odd', label: 'Odd days' },
  { id: 'even', label: 'Even days' },
];

export default function TaskDetailsScreen() {
  const params = useLocalSearchParams();
  
  // Перевіряємо, чи ми зайшли сюди для РЕДАГУВАННЯ існуючої таски
  const isEditTaskMode = !!params.editTaskId;

  const [taskName, setTaskName] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('daily');

  // Якщо ми в режимі редагування — підставляємо дані, які прийшли в параметрах
  useEffect(() => {
    if (isEditTaskMode) {
      setTaskName(params.editTaskName as string || '');
      setSelectedFrequency(params.editTaskFreq as string || 'daily');
    }
  }, [isEditTaskMode]);

  const saveTask = () => {
    if (taskName.trim() === '') return;

    // Дістаємо список тасок, який уже був сформований на попередньому екрані
    const existingTasks = params.existingTasks ? JSON.parse(params.existingTasks as string) : [];

    let updatedTasks = [];

    if (isEditTaskMode) {
      // Оновлюємо існуючу таску (в тому числі ту, яку згенерував AI)
      updatedTasks = existingTasks.map((task: any) => {
        if (task.id === params.editTaskId) {
          return {
            ...task,
            name: taskName,
            frequency: selectedFrequency
          };
        }
        return task;
      });
    } else {
      // Створюємо нову таску вручну
      const newTask = {
        id: Date.now().toString(), 
        name: taskName,
        frequency: selectedFrequency
      };
      updatedTasks = [...existingTasks, newTask];
    }

    // Повертаємо оновлений масив назад на AddTasksScreen
    router.navigate({
      pathname: "/addtask" as any,
      params: { 
        ...params, 
        fullTasksList: JSON.stringify(updatedTasks) 
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Text style={styles.backText}>‹ BACK</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          {isEditTaskMode ? 'Edit Task' : 'New Task'}
        </Text>
        
        <Text style={styles.label}>Task Name</Text>
        <TextInput
          style={styles.input}
          placeholder="What needs to be done?"
          placeholderTextColor="#9aa1ad"
          value={taskName}
          onChangeText={setTaskName}
          autoFocus={!isEditTaskMode}
        />

        <Text style={[styles.label, { marginTop: 30 }]}>Frequency</Text>
        <View style={styles.freqContainer}>
          {frequencies.map((freq) => (
            <TouchableOpacity
              key={freq.id}
              style={[
                styles.freqButton,
                selectedFrequency === freq.id && styles.freqButtonActive
              ]}
              onPress={() => setSelectedFrequency(freq.id)}
            >
              <Text style={[
                styles.freqText,
                selectedFrequency === freq.id && styles.freqTextActive
              ]}>
                {freq.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.saveBtn, taskName.length > 0 ? styles.btnActive : styles.btnDisabled]} 
        onPress={saveTask}
        disabled={taskName.length === 0}
      >
        <Text style={styles.saveBtnText}>
          {isEditTaskMode ? 'Update Task' : 'Save Task'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 25, paddingTop: 10 },
  backText: { color: '#9aa1ad', fontSize: 16, fontWeight: 'bold' },
  content: { paddingHorizontal: 25, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12 },
  input: {
    backgroundColor: '#f8f9fb',
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#000'
  },
  freqContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  freqButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  freqButtonActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#3b82f6',
  },
  freqText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  freqTextActive: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  saveBtn: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnActive: { backgroundColor: '#3b82f6' },
  btnDisabled: { backgroundColor: '#e5e7eb' },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});