import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      return Alert.alert("Error", "Please fill in all fields.");
    }
    if (!emailPattern.test(email)) {
      return Alert.alert("Error", "Only @gmail.com addresses are allowed.");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match!");
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Registration successful!");
        router.replace('/onboarding'); 
        
      } else {
        Alert.alert("Error", data.error || "Registration failed");
      }
    } catch (error) {
      Alert.alert("Error", "Server error. Is Python running?");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <View style={styles.container}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />

        <View style={styles.field}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>👤</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Username" 
              value={username} 
              onChangeText={setUsername}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>✉️</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Email" 
              value={email} 
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>🔒</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              value={password} 
              onChangeText={setPassword}
              secureTextEntry 
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>🔒</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChangeText={setConfirmPassword}
              secureTextEntry 
            />
          </View>
        </View>

        <TouchableOpacity style={[styles.btn, styles.registerFull]} onPress={handleRegister}>
          <Text style={styles.btnText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/')} style={styles.backToLogin}>
          <Text style={styles.backText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
    backgroundColor: '#f4f6f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 380,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  logo: {
    width: 200,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  field: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    textAlign: 'left',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 44,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  btn: {
    width: '100%',
    height: 44,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerFull: {
    backgroundColor: '#6fa3ff',
  },
  btnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  backToLogin: {
    marginTop: 20,
  },
  backText: {
    color: '#333',
    fontSize: 14,
  }
});