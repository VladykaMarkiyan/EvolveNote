import React from 'react';
import { Alert } from 'react-native';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, ScrollView, Dimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

interface SettingItemProps {
  title: string;
  icon: any;
  onPress: () => void;
}

const handleLogout = () => {
  Alert.alert(
    "Log Out",
    "Are you sure you want to log out of your account?",
    [
      {
        text: "Cancel",
        style: "cancel" // Ця кнопка просто закриє модалку
      },
      {
        text: "Log Out",
        style: "destructive", // На iOS ця кнопка буде червоною
        onPress: async () => {
          try {
            // Видаляємо токен і всі локальні дані, щоб "забути" юзера
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('username');
            
            // Перекидаємо на головний екран входу
            router.replace('/'); 
          } catch (error) {
            console.error("Error logging out", error);
          }
        }
      }
    ]
  );
};

const SettingCard = ({ title, icon, onPress }: SettingItemProps) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.iconContainer}>
      <Image source={icon} style={styles.icon} />
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.categoryTitle}>PERSONALISATION</Text>
        <Text style={styles.mainTitle}>Settings</Text>

        <View style={styles.grid}>
          <SettingCard 
            title="My Profile" 
            icon={require('../assets/profile.png')} 
            onPress={() => router.push('/profile')}
          />
          <SettingCard 
            title="Subscription" 
            icon={require('../assets/subscription.png')} 
            onPress={() => router.push('/subscriptions')}
          />
          <SettingCard 
            title="My Goals" 
            icon={require('../assets/goals.png')} 
            onPress={() => router.push('/addgoal')} 
          />
          <SettingCard 
            title="Notifications" 
            icon={require('../assets/notifications.png')} 
            onPress={() => router.push('/notifications')} 
          />
          <SettingCard 
            title="About Us" 
            icon={require('../assets/about.png')} 
            onPress={() => router.push('/about')} 
          />
          <SettingCard 
            title="Support" 
            icon={require('../assets/about.png')} 
            onPress={() => router.push('/support')} 
          />
          <SettingCard 
            title="Log out" 
            icon={require('../assets/logout.png')} 
            onPress={handleLogout}
          />
        </View>
      </ScrollView>

      {/* ОНОВЛЕНА НАВІГАЦІЯ З ЧОРНИМ КВАДРАТОМ */}
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
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    paddingBottom: 130 
  },
  categoryTitle: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#9aa1ad', 
    letterSpacing: 1, 
    marginBottom: 8 
  },
  mainTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#111', 
    marginBottom: 25 
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  card: { 
    width: COLUMN_WIDTH, 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 3, 
    borderWidth: 1, 
    borderColor: '#f1f3f7' 
  },
  iconContainer: { 
    width: 55, 
    height: 55, 
    borderRadius: 15, 
    backgroundColor: '#e6f9f5', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  icon: { 
    width: 35, 
    height: 35, 
    resizeMode: 'contain', 
    tintColor: '#4caf50' 
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#374151' 
  },

  // СТИЛІ НАВІГАЦІЇ (ОДНАКОВІ ДЛЯ ВСІХ ЕКРАНІВ)
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