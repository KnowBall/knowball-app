import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { app } from '../lib/firebase';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const db = getFirestore(app);
        const scoresRef = collection(db, 'scores');
        const q = query(
          scoresRef,
          orderBy('percentage', 'desc'),
          orderBy('timestamp', 'desc'),
          limit(10)
        );

        const querySnapshot = await getDocs(q);
        const leaderboardData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));

        setScores(leaderboardData);
        setError(null);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  const handlePlayAgain = () => {
    navigation.navigate('Game');
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
        <Text style={{ color: '#dc2626', fontSize: 18, textAlign: 'center' }}>
          Error loading leaderboard. Please try again later.
        </Text>
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
              Leaderboard
            </Text>

            {/* Scores List */}
            <View style={{ width: '100%', marginBottom: 32 }}>
              {scores.length === 0 ? (
                <Text style={{
                  fontSize: 18,
                  color: '#6b7280',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  No scores yet. Be the first to play!
                </Text>
              ) : (
                scores.map((score, index) => (
                  <View
                    key={score.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      marginBottom: 12,
                      backgroundColor: index < 3 ? '#f0fdf4' : '#f9fafb',
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: index < 3 ? '#16a34a' : '#e5e7eb'
                    }}
                  >
                    <Text style={{
                      fontSize: 24,
                      marginRight: 12,
                      color: index < 3 ? '#16a34a' : '#6b7280'
                    }}>
                      {index < 3 ? MEDALS[index] : `${index + 1}.`}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 18,
                        color: '#111827',
                        fontWeight: index < 3 ? '600' : 'normal'
                      }}>
                        {score.score}/{score.total} — {Math.round(score.percentage)}%
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: '#6b7280',
                        marginTop: 4
                      }}>
                        {formatDistanceToNow(score.timestamp, { addSuffix: true })}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Play Again Button */}
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
          </View>
        </View>
      </ImageBackground>
    </View>
  );
} 