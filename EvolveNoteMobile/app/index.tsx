import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import 'react-native-gesture-handler';

export default function HomeScreen() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Practice vocabulary (30 min)', done: false },
    { id: 2, text: 'Write 5 sentences', done: false }
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.app}>
        
        <View style={styles.top}>
          <View>
            <Text style={styles.welcomeText}>WELCOME BACK</Text>
            <Text style={styles.nameText}>HELLO, <Text style={{ fontWeight: '700' }}>ALEX!</Text></Text>
          </View>
          <TouchableOpacity style={styles.goalsBadge} onPress={() => router.push('/addgoal')}>
            <Text style={styles.goalsText}>1/3 GOALS</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.goalCard}>
          <View style={styles.goalContent}>
            <Text style={styles.goalTitle}>Learn Spanish in{"\n"}90 Days</Text>
            <View style={styles.goalActions}>
              <View style={styles.action}><Text>❝❞</Text></View>
              <View style={styles.action}><Text>📅</Text></View>
              <TouchableOpacity 
                style={[styles.action, styles.actionActive]} 
                onPress={() => router.push('/goaldetails')}
              >
                <Text style={{color:'#fff'}}>📄</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressHeader}>Current Progress</Text>
          <View style={styles.progressContent}>
            <View style={styles.side}>
              <Text style={styles.sideNumber}>61</Text>
              <Text style={styles.sideLabel}>Days{"\n"}Completed</Text>
            </View>

            <View style={styles.circleContainer}>
              <Svg viewBox="0 0 36 36" style={styles.svg}>
                <Path
                  d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
                  fill="none"
                  stroke="#e0e6f0"
                  strokeWidth="4"
                />
                <Path
                  d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
                  fill="none"
                  stroke="#4caf50"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="68, 100"
                />
              </Svg>
              <View style={styles.percentOverlay}>
                <Text style={styles.percentText}>68%</Text>
                <Text style={styles.percentLabel}>Done</Text>
              </View>
            </View>

            <View style={styles.side}>
              <Text style={styles.sideNumber}>29</Text>
              <Text style={styles.sideLabel}>Days{"\n"}Left</Text>
            </View>
          </View>
          <Text style={styles.deadlineText}>Deadline <Text style={{fontWeight:'700'}}>March 15, 2026</Text></Text>
        </View>

        <View style={styles.tasksSection}>
          <View style={styles.tasksHeader}>
            <Text style={styles.sectionTitle}>Tasks for Today</Text>
            <TouchableOpacity><Text style={styles.addBtn}>+</Text></TouchableOpacity>
          </View>

          {tasks.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.task, item.done && styles.taskDone]} 
              onPress={() => toggleTask(item.id)}
            >
              <View style={[styles.check, item.done && styles.checkDone]}>
                {item.done && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.taskText}>{item.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navBtn}><Image source={require('../assets/home-s.png')} style={styles.navIcon} /></TouchableOpacity>
        <TouchableOpacity style={styles.navBtn}><Image source={require('../assets/motiv-g.png')} style={styles.navIcon} /></TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/addgoal')}>
          <Image source={require('../assets/calend-g.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn}><Image source={require('../assets/book.png')} style={styles.navIcon} /></TouchableOpacity>
        <TouchableOpacity style={styles.navBtn}><Image source={require('../assets/settings-g.png')} style={styles.navIcon} /></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f7fb' },
  app: { padding: 16, paddingBottom: 100 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { fontSize: 12, color: '#9aa1ad' },
  nameText: { fontSize: 22, marginVertical: 4 },
  goalsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  goalsText: { color: '#3b82f6', fontSize: 14 },
  arrow: { fontSize: 18, color: '#3b82f6' },
  goalCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginTop: 16 },
  goalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  goalContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalActions: { flexDirection: 'row', gap: 12 },
  action: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f1f3f7', justifyContent: 'center', alignItems: 'center' },
  actionActive: { backgroundColor: '#3b82f6' },
  progressCard: { backgroundColor: '#f0f6ff', marginTop: 20, padding: 16, borderRadius: 20 },
  progressHeader: { textAlign: 'center', fontWeight: '700', marginBottom: 10 },
  progressContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  side: { alignItems: 'center' },
  sideNumber: { fontSize: 20, color: '#3b82f6', fontWeight: '700' },
  sideLabel: { fontSize: 10, color: '#7b8494', textAlign: 'center' },
  circleContainer: { width: 120, height: 120, position: 'relative' },
  svg: { width: '100%', height: '100%' },
  percentOverlay: { position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center' },
  percentText: { fontSize: 18, fontWeight: '700' },
  percentLabel: { fontSize: 10, color: '#777' },
  deadlineText: { marginTop: 12, textAlign: 'center', fontSize: 12 },
  tasksSection: { marginTop: 20 },
  tasksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  addBtn: { fontSize: 28, color: '#3b82f6' },
  task: { backgroundColor: '#fff', padding: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  taskDone: { opacity: 0.6 },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#cfd6e4', justifyContent: 'center', alignItems: 'center' },
  checkDone: { backgroundColor: '#4caf50', borderColor: '#4caf50' },
  checkMark: { color: '#fff', fontSize: 12 },
  taskText: { fontSize: 15 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  navBtn: { padding: 10 },
  navIcon: { width: 26, height: 26, resizeMode: 'contain' }
});