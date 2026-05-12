import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

export default function CongratsScreen() {
  // Отримуємо параметри виконаної цілі
  const params = useLocalSearchParams();
  const goalTitle = params.title || 'Goal Completed!';
  const totalDays = Number(params.totalDays) || 90;
  const totalTasks = params.totalTasks || '---';

  // Конвертуємо дні у місяці приблизно
  const monthsCount = Math.max(1, Math.round(totalDays / 30));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Велика іконка фотографії з ефектом світіння */}
        <View style={styles.trophyWrapper}>
          <View style={styles.glowCircle}>
            <View style={styles.photoContainer}>
              
              <Image 
                source={require('../assets/congrats.png')} 
                style={styles.userPhoto} 
              />

            </View>
          </View>
        </View>

        <Text style={styles.title}>Congratulations!</Text>
        <Text style={styles.subtitle}>You've successfully achieved your goal!</Text>

        {/* Картка виконаної цілі з зеленим індикатором зліва */}
        <View style={styles.goalCard}>
          <View style={styles.leftBorderIndicator} />
          
          <View style={styles.cardHeader}>
            <Text style={styles.completedBadge}>COMPLETED</Text>
            <View style={styles.checkCircle}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
          </View>
          
          <Text style={styles.goalName} numberOfLines={2}>{goalTitle}</Text>

          {/* Сітка статистики */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{monthsCount}</Text>
              <Text style={styles.statLabel}>{monthsCount === 1 ? 'Month' : 'Months'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalTasks}</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#4caf50' }]}>100%</Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
          </View>
        </View>

        {/* Інформаційний блок про архів */}
        <View style={styles.archiveBox}>
          <View style={styles.archiveIconWrapper}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M21 8V21H3V8" stroke="#9aa1ad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M23 3H1V8H23V3Z" stroke="#9aa1ad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M10 12H14" stroke="#9aa1ad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </View>
          <Text style={styles.archiveText}>
            This goal will be moved to your archive where you can review it anytime.
          </Text>
        </View>
      </View>

      {/* Нижні кнопки */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.replace('/addgoal')}
        >
          <Text style={styles.primaryButtonText}>Continue with Other Goals   →</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.replace('/addgoal')} 
        >
          <Text style={styles.secondaryButtonText}>+   Create New Goal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 40 },
  trophyWrapper: { marginBottom: 15, marginTop: 20 },
  glowCircle: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center',
  },
  photoContainer: {
    width: 110,          // Повернув оригінальний розмір білого кола з макету (110)
    height: 110,         
    borderRadius: 55,    // Рівно половина, щоб коло було ідеальним
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 4, 
    shadowColor: '#4caf50', 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',  // Маскує кути картинки за контуром цього кола
  },


  userPhoto: {
    width: '80%',       
    height: '80%',      
    resizeMode: 'cover', 
  },

  title: { fontSize: 28, fontWeight: '800', color: '#2d3142', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#9aa1ad', textAlign: 'center', marginBottom: 35, paddingHorizontal: 15 },
  goalCard: {
    width: '100%', backgroundColor: '#fff', borderRadius: 24, padding: 24,
    position: 'relative', overflow: 'hidden', borderWidth: 1, borderColor: '#f1f3f7',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }
  },
  leftBorderIndicator: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, backgroundColor: '#4caf50'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  completedBadge: { color: '#4caf50', fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center' },
  checkMark: { color: '#4caf50', fontSize: 13, fontWeight: '800' },
  goalName: { fontSize: 20, fontWeight: '800', color: '#1c1f2c', marginBottom: 25 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1c1f2c' },
  statLabel: { fontSize: 12, color: '#9aa1ad', marginTop: 4 },
  divider: { width: 1, height: 30, backgroundColor: '#f1f3f7' },
  archiveBox: {
    flexDirection: 'row', backgroundColor: '#f8fafc', padding: 16, borderRadius: 20,
    marginTop: 30, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#f1f5f9'
  },
  archiveIconWrapper: { marginRight: 14 },
  archiveText: { flex: 1, fontSize: 13, color: '#9aa1ad', lineHeight: 18 },
  footer: { padding: 24, paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
  primaryButton: {
    backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 18,
    alignItems: 'center', marginBottom: 12
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    backgroundColor: '#fff', paddingVertical: 16, borderRadius: 18,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#3b82f6'
  },
  secondaryButtonText: { color: '#3b82f6', fontSize: 16, fontWeight: '700' }
});