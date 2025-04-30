import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';

export default function HomeScreen() {
  const navigation = useNavigation();
  const auth = getAuth();
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16a34a" />
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
              <Text style={{ fontSize: 40, fontWeight: '800', color: '#16a34a', marginBottom: 12, textAlign: 'center' }}>
                🏈 Ready to Play?
              </Text>
              
              <Text style={{ fontSize: 18, color: '#4b5563', marginBottom: 32, textAlign: 'center' }}>
                Test your sports knowledge and climb the leaderboard!
              </Text>

              {/* Game Stats Preview */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 32, backgroundColor: 'rgba(22,163,74,0.1)', padding: 16, borderRadius: 16 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#16a34a' }}>0</Text>
                  <Text style={{ color: '#4b5563', fontSize: 14 }}>Games Played</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#16a34a' }}>0</Text>
                  <Text style={{ color: '#4b5563', fontSize: 14 }}>High Score</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#16a34a' }}>0</Text>
                  <Text style={{ color: '#4b5563', fontSize: 14 }}>Rank</Text>
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
            onPress={() => auth.signOut()}
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
