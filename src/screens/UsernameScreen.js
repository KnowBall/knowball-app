import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';

// Basic profanity filter
const PROFANITY_LIST = ['admin', 'mod', 'moderator', 'fuck', 'shit', 'ass', 'bitch', 'cunt', 'dick', 'pussy'];
const isProfane = (username) => PROFANITY_LIST.some(word => username.toLowerCase().includes(word));

// Generate random username suggestions
const generateUsername = () => {
  const prefixes = ['Ball', 'Sports', 'Game', 'Play', 'Score', 'Champ', 'Pro', 'Star'];
  const suffixes = ['Master', 'Expert', 'Legend', 'King', 'Queen', 'Pro', 'Star', 'Champ'];
  const numbers = Math.floor(Math.random() * 1000);
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${prefix}${suffix}${numbers}`;
};

export default function UsernameScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [username, setUsername] = useState(generateUsername());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      navigation.navigate('Login');
    }
  }, [user, navigation]);

  const handleGenerateNew = () => {
    setUsername(generateUsername());
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (isProfane(username)) {
      setError('Please choose a more appropriate username');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const db = getFirestore(app);
      
      // Check if username is already taken
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setError('This username is already taken');
        setLoading(false);
        return;
      }

      // Save username to user's document
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        username,
        displayName: user.displayName || '',
        email: user.email || '',
        totalPoints: 0,
        createdAt: new Date()
      }, { merge: true });

      // Navigate to HomeScreen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error saving username:', error);
      setError('An error occurred. Please try again.');
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
          {/* Main Card */}
          <View style={{
            width: '100%',
            maxWidth: 600,
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 32,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}>
            {/* Title */}
            <Text style={{
              fontSize: 32,
              fontWeight: '800',
              color: '#111827',
              marginBottom: 24,
              textAlign: 'center'
            }}>
              What should we call you?
            </Text>

            {/* Username Input */}
            <View style={{ width: '100%', marginBottom: 24 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f3f4f6',
                borderRadius: 12,
                padding: 16,
                marginBottom: 8
              }}>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  style={{
                    flex: 1,
                    fontSize: 18,
                    color: '#111827'
                  }}
                  placeholder="Enter your username"
                  placeholderTextColor="#6b7280"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={handleGenerateNew}
                  style={{
                    padding: 8,
                    backgroundColor: '#e5e7eb',
                    borderRadius: 8,
                    marginLeft: 8
                  }}
                >
                  <MaterialCommunityIcons name="dice-multiple" size={24} color="#4b5563" />
                </TouchableOpacity>
              </View>

              {error && (
                <Text style={{
                  color: '#dc2626',
                  fontSize: 14,
                  marginTop: 8,
                  textAlign: 'center'
                }}>
                  {error}
                </Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={{
                backgroundColor: '#16a34a',
                borderRadius: 12,
                padding: 16,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: '600',
                    marginRight: 8
                  }}>
                    Continue
                  </Text>
                  <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
} 