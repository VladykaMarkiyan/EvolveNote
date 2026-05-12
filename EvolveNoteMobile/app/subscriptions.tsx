import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Image, Dimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface PlanProps {
  tag: string;
  tagColor: string;
  title: string;
  goals: string;
  goalsLabel: string;
  price: string;
  benefit: string;
  benefitLabel: string;
  isActive?: boolean;
  accentColor: string;
}

const SubscriptionCard = ({ 
  tag, tagColor, title, goals, goalsLabel, price, benefit, benefitLabel, isActive, accentColor 
}: PlanProps) => (
  <TouchableOpacity 
    style={[styles.card, isActive && styles.activeCard]}
    activeOpacity={0.8}
  >
    {/* Кольорова смужка зліва */}
    <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
    
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.tag, { color: tagColor }]}>{tag}</Text>
          <Text style={styles.planTitle}>{title}</Text>
        </View>
        {isActive && (
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={16} color="#4caf50" />
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{goals}</Text>
          <Text style={styles.statLabel}>{goalsLabel}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{price}</Text>
          <Text style={styles.statLabel}>Price</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: accentColor }]}>{benefit}</Text>
          <Text style={styles.statLabel}>{benefitLabel}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function SubscriptionsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#9aa1ad" />
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>Subscriptions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <SubscriptionCard 
          tag="BEST FOR START"
          tagColor="#4caf50"
          accentColor="#4caf50"
          title="Freemium"
          goals="3"
          goalsLabel="Goals"
          price="$0"
          benefit="100%"
          benefitLabel="FREE"
          isActive={true}
        />

        <SubscriptionCard 
          tag="MOST POPULAR"
          tagColor="#3b82f6"
          accentColor="#3b82f6"
          title="Premium"
          goals="15"
          goalsLabel="Goals"
          price="$15"
          benefit="1 week"
          benefitLabel="FREE"
        />

        <SubscriptionCard 
          tag="FOR GROUPS"
          tagColor="#3b82f6"
          accentColor="#3b82f6"
          title="Family Premium"
          goals="15"
          goalsLabel="Goals/user"
          price="$35"
          benefit="Up to 5"
          benefitLabel="Users"
        />
      </ScrollView>

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
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 24, paddingTop: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, left: -5 },
  backText: { fontSize: 14, fontWeight: '700', color: '#9aa1ad', marginLeft: 4 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: '#111', marginBottom: 10 },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 120 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f3f7',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  activeCard: { borderColor: '#e8f5e9' },
  accentBar: { width: 6, height: '100%' },
  cardContent: { flex: 1, padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  tag: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  planTitle: { fontSize: 22, fontWeight: '800', color: '#111' },
  checkCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center' },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fb',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#111' },
  statLabel: { fontSize: 11, color: '#9aa1ad', marginTop: 4, fontWeight: '600' },
  divider: { width: 1, height: 30, backgroundColor: '#e0e6ed' },
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