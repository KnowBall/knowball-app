import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
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
  const { score = 0, totalQuestions = 10 } = route?.params || {};
  
  useEffect(() => {
    async function saveScore() {
      if (!user || !user.uid || score <= 0) return;
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
        console.log(`Score saved for ${user.uid}`);

        // Update user's total points
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          totalPoints: increment(score),
          email: user.email || '',
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log(`Total points updated for ${user.uid}`);
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
    
    saveScore();
  }, [user, score, totalQuestions]);
  
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
              <Text style={{
                fontSize: 24,
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: 8
              }}>
                You scored {score} out of {totalQuestions}!
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
                justifyContent: 'center'
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
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default EndGameScreen; 