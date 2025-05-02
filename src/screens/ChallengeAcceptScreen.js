import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function ChallengeAcceptScreen({ route }) {
  const { challengeId } = route.params || {};

  useEffect(() => {
    // TODO: Fetch challenge from Firestore using challengeId
  }, [challengeId]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 16 }}>
        Accept Challenge
      </Text>
      <Text style={{ fontSize: 16, color: '#2563eb', marginBottom: 24 }}>
        Challenge ID: {challengeId}
      </Text>
      <ActivityIndicator size="large" color="#16a34a" />
    </View>
  );
} 