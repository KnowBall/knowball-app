import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { Platform, ToastAndroid, Alert } from 'react-native';

const UserContext = createContext();

// Helper to show toast cross-platform
function showToast(message) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert('Streak Reward', message);
  }
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch their profile from Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          let userData = userDoc.exists() ? userDoc.data() : {};

          // Daily login streak logic
          const today = new Date();
          const todayStr = today.toISOString().slice(0, 10); // 'YYYY-MM-DD'
          let lastLoginDate = userData.lastLoginDate || null;
          let loginStreak = userData.loginStreak || 0;
          let totalPoints = userData.totalPoints || 0;
          let reward = 0;
          let updateNeeded = false;

          if (lastLoginDate !== todayStr) {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().slice(0, 10);
            if (lastLoginDate === yesterdayStr) {
              // Continue streak
              loginStreak += 1;
              reward = Math.min(loginStreak * 5, 50);
            } else {
              // Missed a day or first login
              loginStreak = 1;
              reward = 5;
            }
            totalPoints += reward;
            updateNeeded = true;
            showToast(`🔥 +${reward} points for Day ${loginStreak} login streak!`);
          }

          // Always update lastLoginDate
          if (lastLoginDate !== todayStr) {
            updateNeeded = true;
          }

          if (updateNeeded) {
            await setDoc(userRef, {
              lastLoginDate: todayStr,
              loginStreak,
              totalPoints
            }, { merge: true });
            userData = { ...userData, lastLoginDate: todayStr, loginStreak, totalPoints };
          }

          setUser({
            ...firebaseUser,
            ...userData
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(firebaseUser);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 