import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';

export default function ChallengeAcceptScreen({ route }) {
  const { challengeId } = route.params || {};
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchChallenge() {
      if (!challengeId) {
        setError('Challenge ID is missing.');
        setLoading(false);
        return;
      }
      try {
        const db = getFirestore(app);
        const challengeRef = doc(db, 'challenges', challengeId);
        const challengeDoc = await getDoc(challengeRef);
        if (!challengeDoc.exists()) {
          setError('Challenge not found.');
          setLoading(false);
          return;
        }
        const challengeData = challengeDoc.data();
        navigation.navigate('Game', { questions: challengeData.questions, challengeId, isChallenge: true });
      } catch (err) {
        console.error('Error fetching challenge:', err);
        setError('Error loading challenge. Please try again.');
        setLoading(false);
      }
    }
    fetchChallenge();
  }, [challengeId, navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 16 }}>
        Accept Challenge
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#16a34a" />
      ) : error ? (
        <Text style={{ fontSize: 16, color: '#dc2626', marginBottom: 24 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
} 