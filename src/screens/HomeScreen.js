import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';
import { getAuth, signOut } from 'firebase/auth';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const auth = getAuth(app);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    rank: 0,
    streak: 0,
  });

  useEffect(() => {
    async function fetchUserStats() {
      if (!user?.uid) return;
      try {
        const db = getFirestore(app);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('totalPoints', 'desc'));
        const querySnapshot = await getDocs(q);
        let rank = 0;
        let totalPoints = 0;
        querySnapshot.forEach((doc, index) => {
          if (doc.id === user.uid) {
            rank = index + 1;
            totalPoints = doc.data().totalPoints || 0;
          }
        });
        setUserStats({
          totalPoints,
          rank,
          streak: user.loginStreak || 0,
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserStats();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1 px-4 pt-8 pb-20" showsVerticalScrollIndicator={false}>
        {/* Sign Out Button */}
        <View className="flex-row justify-end mb-4">
          <TouchableOpacity
            onPress={handleSignOut}
            className="px-4 py-2 rounded-lg bg-red-600"
          >
            <Text className="text-white font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Card */}
        <View className="rounded-xl bg-gray-100 dark:bg-gray-800 shadow p-6 mb-6">
          <Text className="text-gray-900 dark:text-white text-xl font-bold mb-2">
            Welcome back, {user?.username || user?.displayName || 'Player'}!
          </Text>
          <View className="flex-row justify-between mt-2">
            <View className="items-center flex-1">
              <Text className="text-green-600 dark:text-green-400 text-2xl font-bold">{userStats.totalPoints}</Text>
              <Text className="text-gray-500 dark:text-gray-300 text-xs mt-1">Score</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-blue-600 dark:text-blue-400 text-2xl font-bold">{userStats.rank > 0 ? `#${userStats.rank}` : '-'}</Text>
              <Text className="text-gray-500 dark:text-gray-300 text-xs mt-1">Rank</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-red-600 dark:text-red-400 text-2xl font-bold">{userStats.streak}</Text>
              <Text className="text-gray-500 dark:text-gray-300 text-xs mt-1">Streak</Text>
            </View>
          </View>
        </View>

        {/* Game Mode Buttons */}
        <TouchableOpacity
          className="rounded-xl p-5 mb-4 bg-gray-200 dark:bg-gray-700"
          onPress={() => navigation.navigate('Game')}
          activeOpacity={0.85}
        >
          <Text className="text-gray-900 dark:text-white text-lg font-semibold text-center">Classic Quiz</Text>
          <Text className="text-gray-500 dark:text-gray-300 text-sm text-center mt-1">Test your sports knowledge</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-xl p-5 mb-4 bg-gray-200 dark:bg-gray-700"
          onPress={() => navigation.navigate('FlickFootball')}
          activeOpacity={0.85}
        >
          <Text className="text-gray-900 dark:text-white text-lg font-semibold text-center">Flick Football</Text>
          <Text className="text-gray-500 dark:text-gray-300 text-sm text-center mt-1">Quick-fire football questions</Text>
        </TouchableOpacity>

        <View className="rounded-xl p-5 mb-4 bg-gray-200 dark:bg-gray-700 opacity-50">
          <Text className="text-gray-900 dark:text-white text-lg font-semibold text-center">Challenge a Friend</Text>
          <Text className="text-gray-500 dark:text-gray-300 text-sm text-center mt-1">Coming soon</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
