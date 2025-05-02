import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useUser();

  const handleLetsPlay = async () => {
    if (user?.uid) {
      const db = getFirestore(app);
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { onboardingComplete: true }, { merge: true });
      // Fetch updated user doc and update context
      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        setUser({ ...user, ...updatedDoc.data() });
      }
    } else {
      // fallback for guests: localStorage (web only)
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('onboardingComplete', 'true');
      }
    }
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <View style={{ height: '100%', width: '100%' }}>
      <ImageBackground
        source={require('../assets/sports-bg.jpg')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', padding: 24, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '100%', maxWidth: 500, backgroundColor: 'white', borderRadius: 24, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}>
            <Text style={{ fontSize: 36, fontWeight: '800', color: '#16a34a', marginBottom: 24, textAlign: 'center' }}>
              Welcome to KnowBall
            </Text>
            <Text style={{ fontSize: 18, color: '#4b5563', marginBottom: 40, textAlign: 'center' }}>
              Test your sports knowledge and climb the global leaderboard. Score points, rank up, and become the #1 Ball Knower.
            </Text>
            <TouchableOpacity
              onPress={handleLetsPlay}
              style={{ width: '100%', backgroundColor: '#16a34a', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 22, textAlign: 'center' }}>
                Let's Play
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
} 