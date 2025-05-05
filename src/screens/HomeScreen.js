import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView, Modal, Platform, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';
import { getAuth, signOut } from 'firebase/auth';
import { fetchRandomQuestions } from '../hooks/useQuestions';
import { useTheme } from '../contexts/ThemeContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const { theme, colors, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    totalGamesPlayed: 0,
    longestStreak: 0,
    rank: 0,
    totalUsers: 0
  });

  useEffect(() => {
    async function fetchUserStats() {
      if (!user?.uid) return;
      
      try {
        const db = getFirestore(app);
        const usersRef = collection(db, 'users');
        
        // Get all users ordered by totalPoints
        const q = query(usersRef, orderBy('totalPoints', 'desc'));
        const querySnapshot = await getDocs(q);
        
        // Find user's rank and total points
        let rank = 0;
        let totalPoints = 0;
        let totalGamesPlayed = 0;
        let longestStreak = 0;
        const totalUsers = querySnapshot.size;
        
        querySnapshot.forEach((doc, index) => {
          if (doc.id === user.uid) {
            rank = index + 1;
            totalPoints = doc.data().totalPoints || 0;
            totalGamesPlayed = doc.data().totalGamesPlayed || 0;
            longestStreak = doc.data().longestStreak || 0;
          }
        });
        
        setUserStats({ totalPoints, rank, totalUsers, totalGamesPlayed, longestStreak });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserStats();
  }, [user]);

  const userEmail = user?.email || 'Guest';

  function handleChallengeFriend() {
    (async () => {
      try {
        if (!user?.uid) {
          alert('You must be signed in to challenge a friend.');
          return;
        }
        const questions = await fetchRandomQuestions(10);
        const db = getFirestore(app);
        const challengesRef = collection(db, 'challenges');
        const challengeDoc = await addDoc(challengesRef, {
          questions,
          createdAt: serverTimestamp(),
          status: 'pending',
          player1: {
            uid: user.uid,
            username: user.username || user.displayName || 'Anonymous',
            score: null,
            finished: false
          },
          player2: {
            uid: null,
            username: null,
            score: null,
            finished: false
          }
        });
        navigation.navigate('Game', { questions, challengeId: challengeDoc.id, isChallenge: true });
      } catch (err) {
        console.error('Error creating challenge:', err);
        alert('Error creating challenge. Please try again.');
      }
    })();
  }

  // Cross-platform clipboard copy
  async function copyToClipboard(text) {
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(text);
        alert('Link copied to clipboard!');
      } catch (e) {
        alert('Failed to copy link.');
      }
    } else {
      const { default: Clipboard } = await import('expo-clipboard');
      await Clipboard.setStringAsync(text);
      alert('Link copied to clipboard!');
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  return (
    <View style={{ flex: 1, minHeight: '100%', backgroundColor: colors.background }}>
      <ImageBackground
        source={require('../assets/sports-bg.jpg')}
        style={{ flex: 1, minHeight: '100%' }}
        resizeMode="cover"
      >
        <View style={{ flex: 1, backgroundColor: colors.overlay }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
            {/* Header Section */}
            <View style={{ paddingTop: 48, paddingBottom: 24, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'flex-end' }}>
                <Text style={{ color: colors.text, fontSize: 16 }}>{user.email}</Text>
                <TouchableOpacity
                  onPress={handleSignOut}
                  style={{
                    backgroundColor: colors.error,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Main Content */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ width: '100%', maxWidth: 500, backgroundColor: colors.card, padding: 32, borderRadius: 24, shadowColor: colors.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}>
                {/* Username Greeting */}
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 16, textAlign: 'center' }}>
                  Welcome, {user?.username || user?.displayName || 'Anonymous'}!
                </Text>
                <Text style={{ fontSize: 40, fontWeight: '800', color: colors.primary, marginBottom: 12, textAlign: 'center' }}>
                  🏈 Ready to Play?
                </Text>
                
                <Text style={{ fontSize: 18, color: colors.text, marginBottom: 32, textAlign: 'center' }}>
                  Test your sports knowledge and climb the leaderboard!
                </Text>

                {/* Lifetime Stats Card */}
                <View style={{ backgroundColor: colors.background, borderRadius: 20, padding: 28, paddingHorizontal: 20, marginBottom: 32, alignItems: 'center', shadowColor: colors.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 }}>
                  <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12, textAlign: 'center', alignSelf: 'center' }}>Your Lifetime Stats</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 24, fontWeight: '800', color: '#FFD700', textAlign: 'center' }}>🏆 {userStats?.totalPoints ?? 0}</Text>
                      <Text style={{ color: '#fff', fontSize: 15, textAlign: 'center', fontWeight: '700' }}>Total Points</Text>
                    </View>
                    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 24, fontWeight: '800', color: colors.secondary, textAlign: 'center' }}>🎮 {userStats?.totalGamesPlayed ?? 0}</Text>
                      <Text style={{ color: '#fff', fontSize: 15, textAlign: 'center', fontWeight: '700' }}>Games Played</Text>
                    </View>
                    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 24, fontWeight: '800', color: colors.error, textAlign: 'center' }}>🔥 {userStats?.longestStreak ?? 0}</Text>
                      <Text style={{ color: '#fff', fontSize: 15, textAlign: 'center', fontWeight: '700' }}>Longest Streak</Text>
                    </View>
                  </View>
                  {/* Divider */}
                  <View style={{ width: '80%', height: 1, backgroundColor: colors.border, marginVertical: 14, alignSelf: 'center' }} />
                  <View style={{ alignItems: 'center', width: '100%' }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#fbbf24', textAlign: 'center' }}>📅 Login Streak: {user?.loginStreak || 0} days</Text>
                  </View>
                </View>

                {/* Classic Mode Button */}
                <TouchableOpacity
                  style={{ width: '100%', backgroundColor: colors.primary, padding: 20, borderRadius: 16, shadowColor: colors.text, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2, marginBottom: 12 }}
                  onPress={() => navigation.navigate('Game')}
                >
                  <Text style={{ color: colors.background, fontWeight: '700', fontSize: 20, textAlign: 'center' }}>
                    Classic Mode 🎮
                  </Text>
                </TouchableOpacity>

                {/* Flick Football Button */}
                <TouchableOpacity
                  style={{ width: '100%', backgroundColor: '#2563eb', padding: 20, borderRadius: 16, marginBottom: 12, shadowColor: colors.text, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 1.41, elevation: 2 }}
                  onPress={() => navigation.navigate('FlickFootball')}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 20, textAlign: 'center' }}>
                    Flick Football 🏈
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ width: '100%', backgroundColor: colors.background, padding: 20, borderRadius: 16, borderWidth: 2, borderColor: colors.primary, marginBottom: 16 }}
                  onPress={() => navigation.navigate('Leaderboard')}
                >
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 20, textAlign: 'center' }}>
                    View Leaderboard 🏆
                  </Text>
                </TouchableOpacity>

                {/* Challenge a Friend Button */}
                <TouchableOpacity
                  style={{ width: '100%', backgroundColor: colors.accent, padding: 20, borderRadius: 16, marginBottom: 8, shadowColor: colors.text, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 1.41, elevation: 2 }}
                  onPress={handleChallengeFriend}
                >
                  <Text style={{ color: colors.background, fontWeight: '700', fontSize: 20, textAlign: 'center' }}>
                    Challenge a Friend 🥊
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
}
