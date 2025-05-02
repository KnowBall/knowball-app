import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { app } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const { user: currentUser } = useUser();

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        console.log('Starting to fetch leaderboard data...');
        const db = getFirestore(app);
        console.log('Got Firestore instance');
        
        const usersRef = collection(db, 'users');
        console.log('Got users collection reference');
        
        const q = query(
          usersRef,
          orderBy('totalPoints', 'desc'),
          limit(10)
        );
        console.log('Created query for totalPoints');
        
        const querySnapshot = await getDocs(q);
        console.log('Got query snapshot, size:', querySnapshot.size);
        
        const leaderboardData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            isCurrentUser: doc.id === currentUser?.uid
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#dc2626', fontSize: 18, textAlign: 'center', marginBottom: 16 }}>
          Error loading leaderboard: {error}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: '#dc2626',
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" style={{ marginRight: 8 }} />
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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
              fontSize: 48,
              fontWeight: '800',
              color: '#111827',
              marginBottom: 32,
              textAlign: 'center'
            }}>
              Global Leaderboard
            </Text>

            {/* User Stats */}
            {currentUser && (
              <View style={{
                width: '100%',
                backgroundColor: '#f0fdf4',
                padding: 16,
                borderRadius: 12,
                marginBottom: 24,
                borderWidth: 2,
                borderColor: '#16a34a'
              }}>
                <Text style={{
                  fontSize: 18,
                  color: '#111827',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Your Total Points: {users.find(u => u.isCurrentUser)?.totalPoints || 0}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#4b5563',
                  textAlign: 'center',
                  marginTop: 4
                }}>
                  Keep playing to climb the ranks!
                </Text>
              </View>
            )}

            {/* Users List */}
            <View style={{ width: '100%', marginBottom: 32 }}>
              {users.length === 0 ? (
                <Text style={{
                  fontSize: 18,
                  color: '#6b7280',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  No scores yet. Be the first to play!
                </Text>
              ) : (
                users.map((user, index) => (
                  <View
                    key={user.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      marginBottom: 12,
                      backgroundColor: user.isCurrentUser ? '#f0fdf4' : index < 3 ? '#f0fdf4' : '#f9fafb',
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: user.isCurrentUser ? '#16a34a' : index < 3 ? '#16a34a' : '#e5e7eb'
                    }}
                  >
                    <Text style={{
                      fontSize: 24,
                      marginRight: 12,
                      color: user.isCurrentUser ? '#16a34a' : index < 3 ? '#16a34a' : '#6b7280'
                    }}>
                      {user.isCurrentUser ? '👤' : index < 3 ? MEDALS[index] : `${index + 1}.`}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 18,
                        color: '#111827',
                        fontWeight: user.isCurrentUser || index < 3 ? '600' : 'normal'
                      }}>
                        {user.displayName || 'Anonymous'} — {user.totalPoints || 0} points
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Action Buttons */}
            <View style={{ width: '100%', gap: 12 }}>
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