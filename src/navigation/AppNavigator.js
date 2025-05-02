import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import GameScreen from '../screens/GameScreen';
import EndGameScreen from '../screens/EndGameScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import UsernameScreen from '../screens/UsernameScreen';
import { useUser } from '../contexts/UserContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useUser();
  const [hasUsername, setHasUsername] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(true);

  useEffect(() => {
    async function checkUsername() {
      if (!user?.uid) {
        setCheckingUsername(false);
        return;
      }

      try {
        const db = getFirestore(app);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setHasUsername(userDoc.exists() && userDoc.data().username);
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setCheckingUsername(false);
      }
    }

    checkUsername();
  }, [user]);

  if (loading || checkingUsername) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          // Auth screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : !hasUsername ? (
          // Username setup for new users
          <Stack.Screen
            name="Username"
            component={UsernameScreen}
            options={{ headerShown: false }}
          />
        ) : (
          // Protected screens
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Game"
              component={GameScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EndGame"
              component={EndGameScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Leaderboard"
              component={LeaderboardScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
