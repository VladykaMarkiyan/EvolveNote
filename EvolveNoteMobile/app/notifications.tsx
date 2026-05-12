import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Switch, Image, Platform } from 'react-native';
import { router } from 'expo-router';

export default function NotificationsScreen() {
  const [goalsEnabled, setGoalsEnabled] = useState(true);
  const [recsEnabled, setRecsEnabled] = useState(false);
  const [calendarEnabled, setCalendarEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Row 1: Goals/Tasks */}
        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={styles.rowTitle}>Daily Reminders</Text>
            <Text style={styles.rowSubtitle}>Notifications for daily goals and tasks</Text>
          </View>
          <Switch
            trackColor={{ false: "#e5e7eb", true: "#4caf50" }} // Зелений колір як на іконках Settings
            thumbColor="#fff"
            ios_backgroundColor="#e5e7eb"
            onValueChange={() => setGoalsEnabled(previousState => !previousState)}
            value={goalsEnabled}
          />
        </View>

        {/* Row 2: Recommendations */}
        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={styles.rowTitle}>Recommendations</Text>
            <Text style={styles.rowSubtitle}>Personalized growth tips and AI insights</Text>
          </View>
          <Switch
            trackColor={{ false: "#e5e7eb", true: "#4caf50" }}
            thumbColor="#fff"
            ios_backgroundColor="#e5e7eb"
            onValueChange={() => setRecsEnabled(previousState => !previousState)}
            value={recsEnabled}
          />
        </View>

        {/* Row 3: Calendar */}
        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={styles.rowTitle}>Calendar</Text>
            <Text style={styles.rowSubtitle}>Alerts for scheduled events and deadlines</Text>
          </View>
          <Switch
            trackColor={{ false: "#e5e7eb", true: "#4caf50" }}
            thumbColor="#fff"
            ios_backgroundColor="#e5e7eb"
            onValueChange={() => setCalendarEnabled(previousState => !previousState)}
            value={calendarEnabled}
          />
        </View>

      </ScrollView>

      {/* Bottom Navigation */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    color: '#9aa1ad',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000',
    marginBottom: 25,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 130,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
  },
  textContainer: {
    flex: 1,
    paddingRight: 20,
  },
  rowTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 14,
    color: '#9aa1ad',
    lineHeight: 20,
  },
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