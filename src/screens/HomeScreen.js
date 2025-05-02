import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';
import { getAuth, signOut } from 'firebase/auth';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [userStats, setUserStats] = useState({ totalPoints: 0, rank: 0, totalUsers: 0, totalGamesPlayed: 0, longestStreak: 0 });
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

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

  return (
    <View style={{ height: '100%', width: '100%' }}>
      <ImageBackground
        source={require('../assets/sports-bg.jpg')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 }}>
          {/* Header Section */}
          <View style={{ paddingTop: 48, paddingBottom: 24 }}>
            <Text style={{ color: 'white', fontSize: 16, textAlign: 'right', opacity: 0.9 }}>
              {userEmail}
            </Text>
          </View>

          {/* Main Content */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '100%', maxWidth: 500, backgroundColor: 'rgba(255,255,255,0.95)', padding: 32, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}>
              {/* Username Greeting */}
              <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16, textAlign: 'center' }}>
                Welcome, {user.username || user.displayName || 'Anonymous'}!
              </Text>
              <Text style={{ fontSize: 40, fontWeight: '800', color: '#16a34a', marginBottom: 12, textAlign: 'center' }}>
                🏈 Ready to Play?
              </Text>
              
              <Text style={{ fontSize: 18, color: '#4b5563', marginBottom: 32, textAlign: 'center' }}>
                Test your sports knowledge and climb the leaderboard!
              </Text>

              {/* Lifetime Stats Card */}
              <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, marginBottom: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 12 }}>Your Lifetime Stats</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 24, fontWeight: '800', color: '#FFD700' }}>🏆 {userStats.totalPoints}</Text>
                    <Text style={{ color: '#4b5563', fontSize: 14 }}>Total Points</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 24, fontWeight: '800', color: '#2563eb' }}>🎮 {userStats.totalGamesPlayed}</Text>
                    <Text style={{ color: '#4b5563', fontSize: 14 }}>Games Played</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 24, fontWeight: '800', color: '#dc2626' }}>🔥 {userStats.longestStreak}</Text>
                    <Text style={{ color: '#4b5563', fontSize: 14 }}>Longest Streak</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'center', marginTop: 16 }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#2563eb' }}>📅 Login Streak: {user?.loginStreak || 0} days</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                style={{ width: '100%', backgroundColor: '#16a34a', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2, marginBottom: 16 }}
                onPress={() => navigation.navigate('Game')}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 20, textAlign: 'center' }}>
                  Start New Game 🎮
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ width: '100%', backgroundColor: 'white', padding: 20, borderRadius: 16, borderWidth: 2, borderColor: '#16a34a' }}
                onPress={() => navigation.navigate('Leaderboard')}
              >
                <Text style={{ color: '#16a34a', fontWeight: '700', fontSize: 20, textAlign: 'center' }}>
                  View Leaderboard 🏆
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Section */}
          <TouchableOpacity
            style={{ paddingVertical: 24 }}
            onPress={async () => {
              try {
                await signOut(auth);
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
              } catch (e) {
                console.error('Sign out error:', e);
              }
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, opacity: 0.8 }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}
