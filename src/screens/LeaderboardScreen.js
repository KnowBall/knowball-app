import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';

export default function LeaderboardScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const navigation = useNavigation();
  const { user: currentUser } = useUser();

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!currentUser?.uid) return;
      try {
        const db = getFirestore(app);
        const usersRef = collection(db, 'users');

        // Get all users ordered by totalPoints
        const allUsersQuery = query(usersRef, orderBy('totalPoints', 'desc'));
        const allUsersSnapshot = await getDocs(allUsersQuery);
        setTotalUsers(allUsersSnapshot.size);

        // Find current user's rank: count users with more points than current user
        let rank = null;
        let currentUserPoints = currentUser.totalPoints || 0;
        let found = false;
        allUsersSnapshot.docs.forEach((doc, idx) => {
          if (doc.id === currentUser.uid) {
            rank = idx + 1;
            found = true;
          }
        });
        // If not found, fallback to last
        setCurrentUserRank(rank || allUsersSnapshot.size);

        // Get top 10 users
        const topUsersQuery = query(
          usersRef,
          orderBy('totalPoints', 'desc'),
          limit(10)
        );
        const topUsersSnapshot = await getDocs(topUsersQuery);

        const leaderboardData = topUsersSnapshot.docs.map((doc, idx) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            isCurrentUser: doc.id === currentUser.uid,
            leaderboardIndex: idx
          };
        });

        setUsers(leaderboardData);
        setError(null);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [currentUser]);

  const handlePlayAgain = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Game' }],
    });
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
            <Text style={{
              fontSize: 32,
              fontWeight: '800',
              color: '#111827',
              marginBottom: 32,
              textAlign: 'center'
            }}>
              Leaderboard
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#16a34a" />
            ) : error ? (
              <Text style={{ color: '#dc2626', fontSize: 16, marginBottom: 24 }}>
                {error}
              </Text>
            ) : (
              <View style={{ width: '100%', maxHeight: 400 }}>
                {users.map((user, index) => (
                  <View
                    key={user.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: 8,
                      backgroundColor: user.isCurrentUser ? '#23272f' : 'transparent',
                      borderRadius: 8,
                      marginBottom: 4
                    }}
                  >
                    <Text style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: '#fff',
                      width: 32
                    }}>
                      #{index + 1}
                    </Text>
                    <Text style={{
                      fontSize: 15,
                      color: '#fff',
                      flex: 1,
                      fontWeight: user.isCurrentUser ? '700' : '500',
                    }}>
                      {user.username || 'Anonymous'}
                    </Text>
                    <Text style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: '#16a34a',
                      minWidth: 32,
                      textAlign: 'right',
                    }}>
                      {user.totalPoints || 0}
                    </Text>
                  </View>
                ))}
                {currentUserRank > 10 && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: '#f3f4f6',
                    borderRadius: 12,
                    marginTop: 8
                  }}>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: '#111827',
                      width: 40
                    }}>
                      #{currentUserRank}
                    </Text>
                    <Text style={{
                      fontSize: 16,
                      color: '#4b5563',
                      flex: 1
                    }}>
                      {currentUser.username || 'Anonymous'}
                    </Text>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: '#16a34a'
                    }}>
                      {currentUser.totalPoints || 0}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={{ width: '100%', gap: 12, marginTop: 24 }}>
              <TouchableOpacity
                onPress={handlePlayAgain}
                style={{
                  backgroundColor: '#16a34a',
                  borderRadius: 12,
                  padding: 16,
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MaterialCommunityIcons name="reload" size={24} color="white" style={{ marginRight: 8 }} />
                <Text style={{
                  color: 'white',
                  fontSize: 18,
                  fontWeight: '600'
                }}>
                  Play Again
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  backgroundColor: '#4b5563',
                  borderRadius: 12,
                  padding: 16,
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color="white" style={{ marginRight: 8 }} />
                <Text style={{
                  color: 'white',
                  fontSize: 18,
                  fontWeight: '600'
                }}>
                  Go Back
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
} 