import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Linking, Image, Platform } from 'react-native';
import { router } from 'expo-router';

export default function SupportScreen() {
  
  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.text}>
          In case of technical issues or problems with payment, please contact our support team:
        </Text>
        
        <TouchableOpacity onPress={() => handleEmailPress('evolvenotesupport@gmail.com')}>
          <Text style={styles.link}>evolvenotesupport@gmail.com</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />

        <Text style={styles.text}>
          For feedback or advice on how to improve the app, please write to us at:
        </Text>

        <TouchableOpacity onPress={() => handleEmailPress('evolvenotefidoffer@gmail.com')}>
          <Text style={styles.link}>evolvenotefidoffer@gmail.com</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ОНОВЛЕНА НАВІГАЦІЯ (ТАК САМА ЯК НА Settings) */}
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
    paddingBottom: 130, // Збільшив відступ, щоб контент не перекривався навігацією
  },
  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
  link: {
    fontSize: 16,
    color: '#333',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },

  // СТИЛІ НАВІГАЦІЇ (КОПІЯ З SettingsScreen)
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