// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { setUser } = useUser();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const auth = getAuth(app);
      const db = getFirestore(app);

      // Sign in with Firebase Auth
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);

      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        // Update context with user data
        setUser({
          ...firebaseUser,
          ...userDoc.data()
        });
      } else {
        setUser(firebaseUser);
      }

      // Navigate to Home screen
      navigation.replace('Home');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ height: '100%', width: '100%', backgroundColor: colors.background }}>
      <ImageBackground
        source={require('../assets/sports-bg.jpg')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <View style={{
          flex: 1,
          backgroundColor: colors.overlay,
          padding: 24,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            width: '100%',
            maxWidth: 400,
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 32,
            alignItems: 'center'
          }}>
            <Text style={{
              fontSize: 32,
              fontWeight: '800',
              color: colors.text,
              marginBottom: 32
            }}>
              Welcome Back!
        </Text>

            {error ? (
              <Text style={{
                color: colors.error,
                marginBottom: 16,
                textAlign: 'center'
              }}>
                {error}
              </Text>
            ) : null}

        <TextInput
              style={{
                width: '100%',
                padding: 16,
                marginBottom: 16,
                backgroundColor: colors.card,
                borderRadius: 12,
                fontSize: 16,
                color: colors.text
              }}
          placeholder="Email"
              placeholderTextColor={colors.text + '99'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
              style={{
                width: '100%',
                padding: 16,
                marginBottom: 24,
                backgroundColor: colors.card,
                borderRadius: 12,
                fontSize: 16,
                color: colors.text
              }}
          placeholder="Password"
              placeholderTextColor={colors.text + '99'}
              value={password}
              onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
              style={{
                width: '100%',
                backgroundColor: colors.primary,
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
                opacity: loading ? 0.7 : 1
              }}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={{
                  color: colors.background,
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '600'
                }}>
                  Log In
                </Text>
              )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
              style={{ padding: 8 }}
        >
              <Text style={{
                color: colors.text,
                fontSize: 14
              }}>
                Don't have an account? <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
        </View>
      </ImageBackground>
    </View>
  );
}
