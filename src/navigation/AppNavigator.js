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
import OnboardingScreen from '../screens/OnboardingScreen';
import ChallengeAcceptScreen from '../screens/ChallengeAcceptScreen';
import FlickFootballScreen from '../screens/FlickFootballScreen';
import { useUser } from '../contexts/UserContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useUser();
  const [hasUsername, setHasUsername] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(null);

  useEffect(() => {
    async function checkUsernameAndOnboarding() {
      if (!user?.uid) {
        setCheckingUsername(false);
        setOnboardingComplete(null);
        return;
      }

      try {
        const db = getFirestore(app);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const hasName = userDoc.exists() && userDoc.data().username;
        setHasUsername(hasName);
        if (hasName) {
          setOnboardingComplete(userDoc.data().onboardingComplete);
        } else {
          setOnboardingComplete(null);
        }
      } catch (error) {
        console.error('Error checking username/onboarding:', error);
      } finally {
        setCheckingUsername(false);
      }
    }

    checkUsernameAndOnboarding();
  }, [user]);

  if (loading || checkingUsername || (hasUsername && onboardingComplete === null)) {
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
        ) : !onboardingComplete ? (
          // Onboarding for new users
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
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
            <Stack.Screen
              name="ChallengeAccept"
              component={ChallengeAcceptScreen}
              options={{ headerShown: false }}
              initialParams={{}}
            />
            <Stack.Screen
              name="FlickFootball"
              component={FlickFootballScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
