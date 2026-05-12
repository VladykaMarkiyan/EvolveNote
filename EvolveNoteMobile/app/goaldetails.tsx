import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Platform, Modal, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function GoalDetailsScreen() {
  const params = useLocalSearchParams();
  const isEditMode = params.mode === 'edit';

  const [goalName, setGoalName] = useState('');
  const [startTab, setStartTab] = useState('Today');
  const [startDate, setStartDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [finishTab, setFinishTab] = useState('date'); 

  const getNextDay = (date: Date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  };

  const [finishDate, setFinishDate] = useState(getNextDay(new Date()));
  const [showFinishPicker, setShowFinishPicker] = useState(false);
  
  const [days, setDays] = useState('1');
  const [months, setMonths] = useState('0');

  // Заповнюємо дані при редагуванні
  useEffect(() => {
    if (isEditMode && params.text) {
      setGoalName(params.text as string);
      
      if (params.start_date) {
        const sDate = new Date(params.start_date as string);
        setStartDate(sDate);
        setStartTab('Select date');
      }
      
      if (params.end_date) {
        setFinishDate(new Date(params.end_date as string));
        setFinishTab('date');
      }
    }
  }, [isEditMode]);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleStartTabPress = (tab: string) => {
    setStartTab(tab);
    if (tab === 'Today') {
      const d = new Date();
      setStartDate(d);
      setFinishDate(getNextDay(d));
    } else if (tab === 'Tommorow') {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      setStartDate(d);
      setFinishDate(getNextDay(d));
    } else if (tab === 'Select date') {
      setShowStartPicker(true);
    }
  };

  const handleContinue = () => {
    if (goalName.trim() === '') {
      Alert.alert("Error", "Please enter a goal name");
      return;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    if (finishTab === 'date') {
      const end = new Date(finishDate);
      end.setHours(0, 0, 0, 0);
      if (end <= start) {
        Alert.alert("Error", "End date must be strictly after the start date");
        return;
      }
    }

    // ЗАВЖДИ йдемо на екран додавання тасок, але передаємо режим і ID (якщо це edit)
    router.push({
      pathname: "/addtask" as any, 
      params: { 
        tempGoalName: goalName,
        tempStartDate: startDate.toISOString(),
        tempEndDate: finishTab === 'date' ? finishDate.toISOString() : null,
        tempDays: days,
        tempMonths: months,
        mode: isEditMode ? 'edit' : 'create', // Передаємо режим далі!
        goalId: params.id || null // Передаємо ID цілі, щоб знати, що оновлювати
      }
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹ BACK</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {isEditMode ? 'Edit Goal' : 'Create New Goal'}
        </Text>

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

        <TouchableOpacity style={styles.displayBox} onPress={() => setShowStartPicker(true)}>
          <Text style={styles.dateVal}>📅 {formatDate(startDate)}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>When you would like to finish</Text>
        <View style={styles.tabBar}>
          {['End Date', 'Duration'].map((tab) => {
            const isSelected = (tab === 'End Date' && finishTab === 'date') || (tab === 'Duration' && finishTab === 'duration');
            return (
              <TouchableOpacity 
                key={tab}
                onPress={() => {
                  setFinishTab(tab === 'End Date' ? 'date' : 'duration');
                  if (tab === 'End Date') setShowFinishPicker(true);
                }}
                style={[styles.tab, isSelected ? styles.tabActive : null]}
              >
                <Text style={[styles.tabText, isSelected ? styles.tabTextBlue : null]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {finishTab === 'date' ? (
          <TouchableOpacity style={styles.displayBox} onPress={() => setShowFinishPicker(true)}>
            <Text style={styles.dateVal}>📅 {formatDate(finishDate)}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.durationWrapper}>
            <View style={styles.durationBlock}>
              <TextInput
                style={styles.durationInput}
                keyboardType="number-pad"
                value={days}
                onChangeText={(val) => setDays(val.replace(/[^0-9]/g, ''))}
                maxLength={3}
              />
              <Text style={styles.durationLabel}>DAYS</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.durationBlock}>
              <TextInput
                style={styles.durationInput}
                keyboardType="number-pad"
                value={months}
                onChangeText={(val) => setMonths(val.replace(/[^0-9]/g, ''))}
                maxLength={2}
              />
              <Text style={styles.durationLabel}>MONTHS</Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.finalBtn, !goalName ? styles.btnDisabled : styles.btnActive]} 
          onPress={handleContinue}
          disabled={!goalName}
        >
          {/* ТЕПЕР ЗАВЖДИ ПИШЕ CONTINUE */}
          <Text style={styles.finalBtnText}>Continue</Text> 
        </TouchableOpacity>
      </ScrollView>

      {(showStartPicker || showFinishPicker) && (
        <Modal transparent animationType="fade" visible={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={showStartPicker ? startDate : finishDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                minimumDate={showStartPicker ? (isEditMode ? undefined : new Date()) : getNextDay(startDate)}
                style={{ width: '100%', backgroundColor: 'white' }}
                themeVariant="light"
                onChange={(event, date) => {
                  if (Platform.OS === 'android') {
                    setShowStartPicker(false);
                    setShowFinishPicker(false);
                  }
                  if (date) {
                    if (showStartPicker) {
                      setStartDate(date);
                      setFinishDate(getNextDay(date));
                      setStartTab('Select date');
                    } else {
                      setFinishDate(date);
                    }
                  }
                }}
              />
              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={() => { setShowStartPicker(false); setShowFinishPicker(false); }}
              >
                <Text style={styles.confirmBtnText}>Confirm Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 25, paddingBottom: 60 },
  backButton: { marginBottom: 20 },
  backText: { color: '#9aa1ad', fontSize: 16, fontWeight: 'bold' },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center' },
  confirmBtn: { backgroundColor: '#3b82f6', width: '100%', height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  confirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  durationWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 20, backgroundColor: '#f8f9fb', paddingVertical: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  durationBlock: { alignItems: 'center', flex: 1 },
  durationInput: { fontSize: 32, fontWeight: 'bold', color: '#3b82f6', textAlign: 'center', width: '100%', padding: 0 },
  durationLabel: { fontSize: 12, color: '#9aa1ad', fontWeight: '800', letterSpacing: 1 },
  separator: { width: 1, height: '50%', backgroundColor: '#e5e7eb' },
  finalBtn: { height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  btnActive: { backgroundColor: '#3b82f6' },
  btnDisabled: { backgroundColor: '#e5e7eb' },
  finalBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});