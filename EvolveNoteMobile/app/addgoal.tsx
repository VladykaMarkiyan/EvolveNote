import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface Task {
  id: string;
  text: string;
}

export default function AddGoalScreen() {
  const params = useLocalSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const FREE_LIMIT = 3;
  const isLimitReached = tasks.length >= FREE_LIMIT;

  // Використовуємо useEffect для відстеження вхідного параметра
  useEffect(() => {
    const newTitle = params.newGoalTitle;

    if (newTitle && typeof newTitle === 'string' && newTitle.length > 0) {
      // Додаємо нову таску, використовуючи функціональне оновлення prev
      setTasks((prev) => {
        // Перевіряємо, чи ми вже не досягли ліміту в поточному стані
        if (prev.length >= FREE_LIMIT) return prev;
        
        const newTask = {
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          text: newTitle,
        };
        
        return [...prev, newTask];
      });

      // ВАЖЛИВО: очищаємо параметр в роутері, щоб він не спрацював ще раз
      router.setParams({ newGoalTitle: '' });
    }
  }, [params.newGoalTitle]);

  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Task>) => {
    return (
      <ScaleDecorator activeScale={1}>
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={drag}
          delayLongPress={150}
          onPress={() => openTaskDetails(item)}
          style={[
            styles.card,
            { 
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: isActive ? '#3b82f6' : '#f0f0f0', 
              elevation: isActive ? 12 : 3,
              shadowOpacity: isActive ? 0.25 : 0.1,
              shadowRadius: isActive ? 15 : 5,
              zIndex: isActive ? 999 : 1,
            }
          ]}
        >
          <View style={styles.cardLeft}>
            <TouchableOpacity onPressIn={drag} style={styles.dragHandle} activeOpacity={1}>
               <View style={styles.line} />
               <View style={styles.line} />
               <View style={styles.line} />
            </TouchableOpacity>
            <Text style={styles.taskText}>{item.text}</Text>
          </View>
          
          <View style={styles.cardRight}>
            <TouchableOpacity onPress={() => setTasks(prev => prev.filter(t => t.id !== item.id))}>
              <Image source={require('../assets/delete-icon.png')} style={styles.deleteIcon} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/')}>
            <Text style={styles.backText}>‹ BACK</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainWrapper}>
          <Text style={styles.title}>Create New Goal</Text>
          
          <View style={styles.subHeader}>
            <Text style={styles.subTitle}>Add goal</Text>
            <TouchableOpacity 
              style={[styles.addBtnCircle, isLimitReached && { opacity: 0.5 }]} 
              onPress={() => !isLimitReached && router.push('/goaldetails')}
              disabled={isLimitReached}
            >
              <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>
          </View>

          <DraggableFlatList
            data={tasks}
            onDragEnd={({ data }) => setTasks(data)}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            containerStyle={styles.listContainer}
            ListFooterComponent={
              isLimitReached ? (
                <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
                  <Text style={styles.footerText}>
                    You've reached the limit of freemium version. If you would like to have more goals upgrade your <Text style={styles.link}>Subscription</Text> to Premium.
                  </Text>
                </View>
              ) : null
            }
          />
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Task Info</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>1. Name:</Text>
                <Text style={styles.infoValue}>{selectedTask?.text}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>2. Start Date:</Text>
                <Text style={styles.infoValue}>26/02/2026</Text> 
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>3. End Date:</Text>
                <Text style={styles.infoValue}>03/05/2026</Text>
              </View>
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeModalBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity 
          style={[styles.createBtn, isLimitReached ? styles.btnDisabled : styles.btnActive]} 
          onPress={() => !isLimitReached && router.push('/goaldetails')}
          disabled={isLimitReached}
        >
          <Text style={styles.createBtnText}>Create Goal</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// Стилі без змін...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, height: 50, alignItems: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#9aa1ad', fontWeight: 'bold', fontSize: 14 },
  closeBtn: { fontSize: 20, color: '#9aa1ad' },
  mainWrapper: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 30, color: '#111' },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  subTitle: { fontSize: 18, fontWeight: 'bold' },
  addBtnCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0f6ff', justifyContent: 'center', alignItems: 'center' },
  plusText: { color: '#3b82f6', fontSize: 24, lineHeight: 28 },
  listContainer: { flexGrow: 1, paddingBottom: 100 },
  card: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 12,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dragHandle: { paddingRight: 15, paddingVertical: 10, gap: 3 },
  line: { width: 16, height: 2, backgroundColor: '#d1d5db', borderRadius: 1 },
  taskText: { fontSize: 15, fontWeight: '500', flex: 1, color: '#374151' },
  cardRight: { paddingLeft: 10 },
  deleteIcon: { width: 22, height: 22, resizeMode: 'contain', tintColor: '#9aa1ad' },
  footerText: { textAlign: 'center', color: '#9aa1ad', fontSize: 13, lineHeight: 20 },
  link: { color: '#4caf50', textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 24, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  infoRow: { marginBottom: 15 },
  infoLabel: { fontSize: 14, color: '#9aa1ad', fontWeight: '700' },
  infoValue: { fontSize: 16, color: '#111', marginTop: 4 },
  closeModalBtn: { backgroundColor: '#3b82f6', height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  closeModalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  createBtn: { position: 'absolute', bottom: 30, left: 20, right: 20, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  btnActive: { backgroundColor: '#3b82f6' },
  btnDisabled: { backgroundColor: '#b0b5bd' },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});