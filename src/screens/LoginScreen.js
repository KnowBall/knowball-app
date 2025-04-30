// src/screens/LoginScreen.js
import { View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../lib/firebase';
import { useState } from 'react';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: Add actual authentication logic here
    navigation.navigate('Home');
  };

  return (
    <View style={{ height: '100%', width: '100%' }}>
      <ImageBackground
        source={require('../assets/sports-bg.jpg')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: 24, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: 'rgba(255,255,255,0.95)', padding: 32, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}>
            <Text style={{ fontSize: 36, fontWeight: '800', color: '#16a34a', marginBottom: 24, textAlign: 'center' }}>
              🏈 Welcome to KnowBall!
            </Text>
            
            <Text style={{ fontSize: 18, color: '#4b5563', marginBottom: 32, textAlign: 'center' }}>
              Test your sports knowledge and compete with friends!
            </Text>

            <TextInput
              placeholder="Email"
              placeholderTextColor="#6b7280"
              style={{ width: '100%', padding: 16, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.8)', color: '#000' }}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor="#6b7280"
              style={{ width: '100%', padding: 16, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 24, backgroundColor: 'rgba(255,255,255,0.8)', color: '#000' }}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              style={{ width: '100%', backgroundColor: '#16a34a', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 }}
              onPress={handleLogin}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18, textAlign: 'center' }}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 24 }}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={{ color: '#16a34a', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>
                Don't have an account? <Text style={{ fontWeight: '700' }}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
