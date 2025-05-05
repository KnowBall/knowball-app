import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Animated, Modal, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';

const getMotivationalMessage = (score, totalQuestions) => {
  const ratio = score / totalQuestions;
  if (ratio >= 0.9) return { text: "You're a sports genius!", icon: "trophy" };
  if (ratio >= 0.6) return { text: "Strong showing!", icon: "star" };
  if (ratio >= 0.3) return { text: "Not bad, keep practicing!", icon: "thumb-up" };
  return { text: "Tough round — try again!", icon: "reload" };
};

const EndGameScreen = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useUser();
  const { score = 0, totalQuestions = 10, correctCount = 0, maxStreak = 0 } = route?.params || {};
  const [animatedScore, setAnimatedScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;
  const { isChallenge, challengeId } = route?.params || {};
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const challengeLink = challengeId ? `https://knowball-app.vercel.app/challenge/${challengeId}` : '';
  
  useEffect(() => {
    // Animate the score count-up
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    const listener = anim.addListener(({ value }) => setAnimatedScore(Math.round(value)));
    return () => anim.removeListener(listener);
  }, [score]);

  useEffect(() => {
    async function saveScore() {
      if (!user || !user.uid) return;
      try {
        const db = getFirestore(app);
        // Save the game score
        const scoresRef = collection(db, 'scores');
        await addDoc(scoresRef, {
          userId: user.uid,
          score: score,
          total: totalQuestions,
          percentage: (score / totalQuestions) * 100,
          timestamp: serverTimestamp(),
          username: user.username || user.displayName || ''
        });
        // Update user's total points, games played, and longest streak
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        let prevTotal = (userDoc.exists() && userDoc.data().totalPoints) || 0;
        let newTotal = prevTotal + score;
        if (newTotal < 0) newTotal = 0;
        let prevGames = (userDoc.exists() && userDoc.data().totalGamesPlayed) || 0;
        let prevLongestStreak = (userDoc.exists() && userDoc.data().longestStreak) || 0;
        let newLongestStreak = Math.max(prevLongestStreak, maxStreak);
        await setDoc(userRef, {
          totalPoints: newTotal,
          totalGamesPlayed: prevGames + 1,
          longestStreak: newLongestStreak,
          email: user.email || '',
          updatedAt: serverTimestamp()
        }, { merge: true });
        // Fetch and set updated total points
        const updatedDoc = await getDoc(userRef);
        setTotalPoints((updatedDoc.exists() && updatedDoc.data().totalPoints) || 0);
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
    saveScore();
  }, [user, score, totalQuestions, maxStreak]);
  
  const { text: motivationalText, icon: motivationalIcon } = getMotivationalMessage(score, totalQuestions);

  const handlePlayAgain = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Game' }],
    });
  };

  const handleViewLeaderboard = () => {
    navigation.navigate('Leaderboard');
  };

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

  useEffect(() => {
    if (isChallenge && challengeId) {
      setShowChallengeModal(true);
    }
  }, [isChallenge, challengeId]);

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
              Game Over!
            </Text>

            {/* Score Display */}
            <View style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 16,
              padding: 24,
              marginBottom: 32,
              width: '100%',
              alignItems: 'center'
            }}>
              <Animated.Text style={{
                fontSize: 32,
                fontWeight: '800',
                color: animatedScore >= 0 ? '#16a34a' : '#dc2626',
                marginBottom: 8,
                textAlign: 'center'
              }}>
                {animatedScore >= 0 ? `+${animatedScore}` : `${animatedScore}`}
              </Animated.Text>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: 8,
                textAlign: 'center'
              }}>
                You got {correctCount} out of {totalQuestions} questions right!
              </Text>
              
              {/* Motivational Message */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 16
              }}>
                <MaterialCommunityIcons
                  name={motivationalIcon}
                  size={24}
                  color="#4b5563"
                  style={{ marginRight: 8 }}
                />
                <Text style={{
                  fontSize: 18,
                  color: '#4b5563',
                  fontStyle: 'italic'
                }}>
                  {motivationalText}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              onPress={handlePlayAgain}
              style={{
                backgroundColor: '#22c55e',
                borderRadius: 12,
                padding: 16,
                width: '100%',
                marginBottom: 16,
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
              onPress={handleViewLeaderboard}
              style={{
                backgroundColor: '#2563eb',
                borderRadius: 12,
                padding: 16,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}
            >
              <MaterialCommunityIcons name="trophy" size={24} color="white" style={{ marginRight: 8 }} />
              <Text style={{
                color: 'white',
                fontSize: 18,
                fontWeight: '600'
              }}>
                View Leaderboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
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
              <MaterialCommunityIcons name="home" size={24} color="white" style={{ marginRight: 8 }} />
              <Text style={{
                color: 'white',
                fontSize: 18,
                fontWeight: '600'
              }}>
                Go Home
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      {/* Modal for Challenge Link (only for challenge games) */}
      <Modal
        visible={showChallengeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChallengeModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 28, width: 320, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 5 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 12, textAlign: 'center' }}>Challenge Ready!</Text>
            <Text style={{ fontSize: 16, color: '#4b5563', marginBottom: 16, textAlign: 'center' }}>Send this link to your friend to challenge them:</Text>
            <View style={{ backgroundColor: '#f3f4f6', borderRadius: 10, padding: 10, marginBottom: 16, width: '100%' }}>
              <Text selectable style={{ fontSize: 14, color: '#2563eb', textAlign: 'center' }}>{challengeLink}</Text>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24, marginBottom: 16 }}
              onPress={() => copyToClipboard(challengeLink)}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Copy Link</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 8 }}
              onPress={() => setShowChallengeModal(false)}
            >
              <Text style={{ color: '#dc2626', fontSize: 15 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EndGameScreen; 