import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  const slides = [
    {
      id: 0,
      title: "ACHIEVEMENT",
      desc: "Track your goals and see measurable progress in real time",
      img: require('../assets/ob1.png')
    },
    {
      id: 1,
      title: "DISCIPLINE",
      desc: "Build consistent habits with clear structure and daily focus",
      img: require('../assets/ob2.png')
    },
    {
      id: 2,
      title: "MOTIVATION",
      desc: "Stay inspired with smart reminders that keep you moving forward",
      img: require('../assets/ob3.png')
    }
  ];

  const finishOnboarding = () => {
    router.replace('/home');
  };

  const nextSlide = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      finishOnboarding();
    }
  };

  return (
    <SafeAreaView style={styles.onboarding}>
      <View style={styles.topBar}>
        <Text style={styles.progressText}>{current + 1}/3</Text>
        <TouchableOpacity onPress={finishOnboarding}>
          <Text style={styles.skip}>SKIP</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.slideContent}>
        <Image source={slides[current].img} style={styles.image} />
        <Text style={styles.title}>{slides[current].title}</Text>
        <Text style={styles.desc}>{slides[current].desc}</Text>
      </View>

      <TouchableOpacity style={styles.mainBtn} onPress={nextSlide}>
        <Text style={styles.mainBtnText}>
          {current === slides.length - 1 ? "GET STARTED" : "NEXT"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  onboarding: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  progressText: {
    fontSize: 14,
    color: '#333',
  },
  skip: {
    fontSize: 14,
    opacity: 0.6,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  image: {
    width: 220,
    height: 220,
    marginBottom: 30,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  desc: {
    color: '#4da3e3',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  mainBtn: {
    backgroundColor: '#5f8fe8',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});