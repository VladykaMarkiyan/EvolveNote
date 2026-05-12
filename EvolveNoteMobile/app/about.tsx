import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Image, Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const email = 'evolvenote@gmail.com';

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#9aa1ad" />
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>About Us</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.textContainer}>
  <Text style={styles.paragraph}>
    We are creating a product that helps people grow every day.
  </Text>
  
  <Text style={styles.paragraph}>
    Our team believes that personal development starts with simple steps — a clear goal, 
    discipline, motivation, and the right tools.
  </Text>

  <Text style={styles.paragraph}>
    We combine self-improvement with artificial intelligence to help you achieve your goals through 
    actionable steps. Our solutions help you plan, track progress, and stay focused amidst your daily routine.
  </Text>

  <View style={styles.contactContainer}>
    <Text style={styles.contactLabel}>Contact us: </Text>
    <TouchableOpacity onPress={handleEmailPress}>
      <Text style={styles.emailText}>{email}</Text>
    </TouchableOpacity>
  </View>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 10,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 120, // Простір для BottomNav
  },
  textContainer: {
    marginTop: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
    marginBottom: 24,
    fontWeight: '400',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  contactLabel: {
    fontSize: 16,
    color: '#374151',
  },
  emailText: {
    fontSize: 16,
    color: '#374151',
    textDecorationLine: 'underline',
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