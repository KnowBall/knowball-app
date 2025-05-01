import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import GameScreen from '../screens/GameScreen';
import EndGameScreen from '../screens/EndGameScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import { useUser } from '../contexts/UserContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useUser();

  if (loading) {
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
