import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!email.trim()) return Alert.alert("Error", "Please enter your email.");
    if (!emailPattern.test(email)) return Alert.alert("Error", "Invalid email format! Please use a @gmail.com address.");
    if (!password.trim()) return Alert.alert("Error", "Please enter your password.");

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Login successful! Welcome back.");
        router.replace('/onboarding');
      } else {
        Alert.alert("Error", data.error);
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

        <TouchableOpacity 
          style={styles.remember} 
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
          <Text style={styles.rememberText}>Keep me signed in</Text>
        </TouchableOpacity>

        <View style={styles.buttons}>
          <TouchableOpacity style={[styles.btn, styles.login]} onPress={handleLogin}>
            <Text style={styles.btnTextLogin}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.btn, styles.register]} 
            onPress={() => router.push('/register')}
          >
            <Text style={styles.btnTextRegister}>Registration</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hr} />

        <TouchableOpacity>
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleBtn}>
          <Image source={require('../assets/google.png')} style={styles.googleIcon} />
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
  remember: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginVertical: 15,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#6fa3ff',
  },
  rememberText: {
    fontSize: 14,
  },
  buttons: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  login: {
    backgroundColor: '#a9c4f5',
  },
  register: {
    backgroundColor: '#6fa3ff',
  },
  btnTextLogin: {
    fontSize: 16,
    color: '#000',
  },
  btnTextRegister: {
    fontSize: 16,
    color: '#fff',
  },
  hr: {
    width: '100%',
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 25,
  },
  forgot: {
    marginBottom: 20,
    fontSize: 14,
    color: '#333',
  },
  googleBtn: {
    padding: 10,
  },
  googleIcon: {
    width: 40,
    height: 40,
  },
});