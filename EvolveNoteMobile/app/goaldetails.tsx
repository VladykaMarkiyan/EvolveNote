import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function GoalDetailsScreen() {
  const [goalName, setGoalName] = useState('');
  
  // Logic for START DATE
  const [startTab, setStartTab] = useState('Today');
  const [startDate, setStartDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);

  // Logic for FINISH DATE / DURATION
  const [finishTab, setFinishTab] = useState('date'); // 'date' or 'duration'
  const [finishDate, setFinishDate] = useState(new Date());
  const [showFinishPicker, setShowFinishPicker] = useState(false);
  
  // Розділяємо тривалість на дні та місяці
  const [days, setDays] = useState(90);
  const [months, setMonths] = useState(0);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleStartTabPress = (tab: string) => {
    setStartTab(tab);
    const today = new Date();
    if (tab === 'Today') {
      setStartDate(today);
      setShowStartPicker(false);
    } else if (tab === 'Tommorow') {
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      setStartDate(tomorrow);
      setShowStartPicker(false);
    } else if (tab === 'Select date') {
      setShowStartPicker(true);
    }
  };

  const handleCreate = () => {
    if (goalName.trim() === '') return;
    router.push({
      pathname: '/addgoal',
      params: { newGoalTitle: goalName }
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={{marginBottom: 20}}>
            <Text style={{color: '#9aa1ad', fontSize: 16}}>‹ BACK</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create New Goal</Text>

        <Text style={styles.label}>Goal Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter goal name..."
          placeholderTextColor="#9aa1ad"
          value={goalName}
          onChangeText={setGoalName}
        />

        <Text style={styles.label}>When you would like to start</Text>
        <View style={styles.tabBar}>
          {['Today', 'Tommorow', 'Select date'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => handleStartTabPress(tab)} 
              style={[styles.tab, startTab === tab ? styles.tabActive : null]}
            >
              <Text style={[styles.tabText, startTab === tab ? styles.tabTextBlue : null]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, date) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (date) setStartDate(date);
            }}
          />
        )}

        <View style={styles.displayBox}>
          <Text style={styles.dateVal}>📅 {formatDate(startDate)}</Text>
        </View>

        <Text style={styles.label}>When you would like to finish</Text>
        <View style={styles.tabBar}>
          {['End Date', 'Duration'].map((tab) => {
            const isSelected = (tab === 'End Date' && finishTab === 'date') || (tab === 'Duration' && finishTab === 'duration');
            return (
              <TouchableOpacity 
                key={tab}
                onPress={() => setFinishTab(tab === 'End Date' ? 'date' : 'duration')}
                style={[styles.tab, isSelected ? styles.tabActive : null]}
              >
                <Text style={[styles.tabText, isSelected ? styles.tabTextBlue : null]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {finishTab === 'date' ? (
          <>
            <TouchableOpacity style={styles.displayBox} onPress={() => setShowFinishPicker(true)}>
              <Text style={styles.dateVal}>📅 {formatDate(finishDate)}</Text>
            </TouchableOpacity>
            {showFinishPicker && (
              <DateTimePicker
                value={finishDate}
                mode="date"
                display="default"
                minimumDate={startDate}
                onChange={(event, date) => {
                  setShowFinishPicker(Platform.OS === 'ios');
                  if (date) setFinishDate(date);
                }}
              />
            )}
          </>
        ) : (
          <View style={styles.durationWrapper}>
            {/* Клікер для Днів */}
            <View style={styles.durationBlock}>
              <View style={styles.pickerRow}>
                <TouchableOpacity onPress={() => setDays(Math.max(0, days - 1))} style={styles.circleBtn}>
                  <Text style={styles.circleBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.durationValue}>{days}</Text>
                <TouchableOpacity onPress={() => setDays(days + 1)} style={styles.circleBtn}>
                  <Text style={styles.circleBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.durationLabel}>Days</Text>
            </View>

            <Text style={styles.orText}>or</Text>

            {/* Клікер для Місяців */}
            <View style={styles.durationBlock}>
              <View style={styles.pickerRow}>
                <TouchableOpacity onPress={() => setMonths(Math.max(0, months - 1))} style={styles.circleBtn}>
                  <Text style={styles.circleBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.durationValue}>{months}</Text>
                <TouchableOpacity onPress={() => setMonths(months + 1)} style={styles.circleBtn}>
                  <Text style={styles.circleBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.durationLabel}>Months</Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.finalBtn, !goalName && {backgroundColor: '#ccc'}]} 
          onPress={handleCreate}
          disabled={!goalName}
        >
            <Text style={styles.finalBtnText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 25 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20, color: '#111' },
  label: { fontSize: 16, fontWeight: '700', marginTop: 25, marginBottom: 12, color: '#111' },
  textInput: { backgroundColor: '#f8f9fb', height: 54, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  tabBar: { flexDirection: 'row', backgroundColor: '#f1f3f7', padding: 4, borderRadius: 14, height: 54 },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 11 },
  tabActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: {width:0, height:2} },
  tabText: { color: '#6b7280', fontWeight: '600' },
  tabTextBlue: { color: '#3b82f6' },
  displayBox: { backgroundColor: '#f8f9fb', height: 54, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 16, marginTop: 15, borderWidth: 1, borderColor: '#e5e7eb' },
  dateVal: { fontSize: 16, color: '#374151', fontWeight: '500' },
  
  // Стилі для нового Duration
  durationWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 20,
    backgroundColor: '#f8f9fb',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 16
  },
  durationBlock: { alignItems: 'center', flex: 1 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 8 },
  circleBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  circleBtnText: { fontSize: 24, color: '#9aa1ad' },
  durationValue: { fontSize: 24, fontWeight: 'bold', color: '#111', minWidth: 30, textAlign: 'center' },
  durationLabel: { fontSize: 14, color: '#9aa1ad' },
  orText: { fontSize: 14, color: '#9aa1ad', marginHorizontal: 10, paddingTop: 5 },

  finalBtn: { backgroundColor: '#3b82f6', height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  finalBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});