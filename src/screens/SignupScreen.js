import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';

export default function SignUpScreen() {
  const navigation = useNavigation();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const auth = getAuth(app);
      const db = getFirestore(app);

      // Create user in Firebase Auth
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      // Create user profile in Firestore
      const userProfile = {
        userId: firebaseUser.uid,
        email: email,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);

      // Update context with the new user data
      setUser({
        ...firebaseUser,
        ...userProfile
      });

      // Navigate to Username screen
      navigation.replace('Username');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ height: '100%', width: '100%' }}>
      <ImageBackground
        source={require('../assets/sports-bg.jpg')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: 24,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            width: '100%',
            maxWidth: 400,
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 32,
            alignItems: 'center'
          }}>
            <Text style={{
              fontSize: 32,
              fontWeight: '800',
              color: '#111827',
              marginBottom: 32
            }}>
              Create Account
            </Text>

            {error ? (
              <Text style={{
                color: '#dc2626',
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
                backgroundColor: '#f3f4f6',
                borderRadius: 12,
                fontSize: 16
              }}
              placeholder="Email"
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
                backgroundColor: '#f3f4f6',
                borderRadius: 12,
                fontSize: 16
              }}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={{
                width: '100%',
                backgroundColor: '#16a34a',
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
                opacity: loading ? 0.7 : 1
              }}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{
                  color: 'white',
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '600'
                }}>
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={{ padding: 8 }}
            >
              <Text style={{
                color: '#4b5563',
                fontSize: 14
              }}>
                Already have an account? <Text style={{ color: '#16a34a', fontWeight: '600' }}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
