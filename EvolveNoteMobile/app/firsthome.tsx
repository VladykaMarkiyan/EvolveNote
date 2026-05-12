import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FirstHomeScreen() {
  const [userName, setUserName] = useState('USER');

  useEffect(() => {
    const loadName = async () => {
      const storedName = await AsyncStorage.getItem('username');
      if (storedName) setUserName(storedName.toUpperCase());
    };
    loadName();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.app}>
        {/* Header - ідентично HomeScreen */}
        <View style={styles.top}>
          <View>
            <Text style={styles.welcomeText}>WELCOME</Text>
            <Text style={styles.nameText}>HELLO, <Text style={{ fontWeight: '700' }}>{userName}!</Text></Text>
          </View>
          <View style={styles.goalsBadge}>
            <Text style={styles.goalsText}>0 GOALS</Text>
          </View>
        </View>

        {/* Main Content (Start Your Journey) */}
        <View style={styles.centerContent}>
          <View style={styles.illustrationContainer}>
            <View style={styles.outerCircle}>
              <View style={styles.innerCircle}>
                <View style={styles.targetCircle}>
                  <View style={styles.targetCenter} />
                </View>
              </View>
              <TouchableOpacity 
                style={styles.smallPlusBtn}
                onPress={() => router.push('/addgoal')}
              >
                <Text style={styles.smallPlusText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.mainTitle}>Countinue Your Journey</Text>
          <Text style={styles.description}>
            Every great achievement begins with a single goal. What do you want to accomplish?
          </Text>

          <TouchableOpacity 
            style={styles.createBtn}
            onPress={() => router.push('/addgoal')}
          >
            <View style={styles.plusIconContainer}>
              <Text style={styles.plusIcon}>+</Text>
            </View>
            <Text style={styles.createBtnText}>Create Your First Goal</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation - Ідентично вашому HomeScreen */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/home')}>
          <Image source={require('../assets/home-s.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn}>
          <Image source={require('../assets/motiv-g.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/addgoal')}>
          <Image source={require('../assets/calend-g.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/addtask')}>
          <Image source={require('../assets/book.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn}>
          <Image source={require('../assets/settings-g.png')} style={styles.navIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' }, // Білий фон як на макеті
  app: { padding: 16, flexGrow: 1, justifyContent: 'space-between', paddingBottom: 100 },
  
  // Стилі з вашого HomeScreen
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  welcomeText: { fontSize: 12, color: '#9aa1ad' },
  nameText: { fontSize: 22, marginVertical: 4 },
  goalsBadge: { flexDirection: 'row', alignItems: 'center' },
  goalsText: { color: '#9aa1ad', fontSize: 14, fontWeight: '700' },
  
  // Центр (ілюстрація)
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  illustrationContainer: { marginBottom: 30, alignItems: 'center' },
  outerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#f8fbff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  targetCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetCenter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  smallPlusBtn: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  smallPlusText: { color: '#4caf50', fontSize: 24, fontWeight: 'bold' },
  
  mainTitle: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 10 },
  description: { textAlign: 'center', color: '#9aa1ad', fontSize: 15, lineHeight: 22, marginBottom: 30 },
  
  createBtn: { 
    backgroundColor: '#3b82f6', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 15, 
    paddingHorizontal: 20, 
    borderRadius: 15,
    width: '100%'
  },
  plusIconContainer: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    width: 32, 
    height: 32, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  plusIcon: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1, marginLeft: 15 },
  arrowIcon: { color: '#fff', fontSize: 18 },

  // Навігація з вашого HomeScreen
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  navBtn: { padding: 10 },
  navIcon: { width: 26, height: 26, resizeMode: 'contain' }
});