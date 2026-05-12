import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Використовуємо URL з .env файлу
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ProfileScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Завантаження реальних даних з бекенду при вході на екран
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        
        // СПЕЦІАЛЬНИЙ ЛОГ ДЛЯ ПЕРЕВІРКИ: подивись у термінал Expo!
        console.log("МІЙ ТОКЕН В ПРОФІЛІ:", token);

        if (!token) {
          router.replace('/'); // Викидаємо на логін, якщо немає токена
          return;
        }

        const response = await fetch(`${API_URL}/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          setUsername(data.username || '');
          setEmail(data.email || '');
        } else {
          console.error("Помилка завантаження профілю:", data.error);
        }
      } catch (error) {
        console.error("Мережева помилка", error);
      }
    };

    fetchProfile();
  }, []);

  // Збереження нових даних на бекенд
  const handleSave = async () => {
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        Alert.alert("Помилка", "Паролі не співпадають!");
        return;
      }
    }
    
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      const updateData = {
        username,
        email,
        ...(password ? { password } : {}) 
      };

      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Успіх", "Профіль успішно оновлено!");
        setPassword('');
        setConfirmPassword('');
        await AsyncStorage.setItem('username', username);
      } else {
        Alert.alert("Помилка", data.error || "Не вдалося оновити профіль");
      }
    } catch (e) {
      console.error("Failed to save data", e);
      Alert.alert("Помилка", "Проблема з мережею. Спробуйте ще раз.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          
          {/* Кнопка назад */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#9aa1ad" />
            <Text style={styles.backText}>BACK</Text>
          </TouchableOpacity>

          <Text style={styles.mainTitle}>My Profile</Text>

          {/* Поле Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#9aa1ad" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
              />
            </View>
          </View>

          {/* Поле Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#9aa1ad" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter email"
              />
            </View>
          </View>

          {/* Поле Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9aa1ad" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Leave blank to keep current"
              />
            </View>
          </View>

          {/* Поле Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9aa1ad" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Confirm new password"
              />
            </View>
          </View>

          {/* Кнопка збереження */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save changes</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Нижня навігація */}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 120,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    left: -5,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9aa1ad',
    marginLeft: 4,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    marginBottom: 35,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#9aa1ad',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fb',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 56,
    borderWidth: 1,
    borderColor: '#f1f3f7',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
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