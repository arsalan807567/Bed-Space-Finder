import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    if (!fullName || !email || !phone || !password) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        phone: phone,
      });
    }
    setLoading(false);
  }

  return (
    <LinearGradient colors={['#0A1628', '#1E3A5F']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner}>
          <Text style={styles.logo}>🏠</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Bed Space Finder</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#8BA7C7"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8BA7C7"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="WhatsApp Number (e.g. 971501234567)"
            placeholderTextColor="#8BA7C7"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8BA7C7"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#0A1628" /> : <Text style={styles.buttonText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logo: { fontSize: 64, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFD700', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#8BA7C7', textAlign: 'center', marginBottom: 40 },
  error: { backgroundColor: '#4A1020', color: '#FF6B6B', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  input: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2E5A8F',
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buttonText: { color: '#0A1628', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#8BA7C7', textAlign: 'center', fontSize: 14 },
  linkBold: { color: '#FFD700', fontWeight: 'bold' },
});
