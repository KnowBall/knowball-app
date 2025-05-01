import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Animated, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%'
  },
  backgroundImage: {
    width: '100%',
    height: '100%'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: 'rgba(255,255,255,0.97)',
    padding: 32,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center'
  },
  divider: {
    height: 4,
    width: 80,
    backgroundColor: '#2563eb',
    borderRadius: 2,
    marginBottom: 32
  },
  scoreContainer: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 32,
    marginBottom: 32,
    alignItems: 'center'
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  percentageText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1e40af'
  },
  fractionText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e40af',
    textAlign: 'center'
  },
  labelText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32
  },
  messageText: {
    fontSize: 20,
    color: '#374151',
    fontStyle: 'italic',
    flex: 1,
    marginLeft: 12
  },
  button: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playAgainButton: {
    backgroundColor: '#22c55e'
  },
  leaderboardButton: {
    backgroundColor: '#2563eb'
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8
  }
});

const getMotivationalMessage = (score, totalQuestions) => {
  const percentage = (score / totalQuestions) * 10;
  if (percentage >= 9) return {
    message: "You're a sports genius!",
    icon: "trophy",
    color: "#fbbf24"
  };
  if (percentage >= 6) return {
    message: "Strong showing!",
    icon: "star",
    color: "#60a5fa"
  };
  if (percentage >= 3) return {
    message: "Not bad, keep practicing!",
    icon: "thumb-up",
    color: "#34d399"
  };
  return {
    message: "Tough round — try again!",
    icon: "reload",
    color: "#6b7280"
  };
};

const EndGameScreen = ({ route }) => {
  const navigation = useNavigation();
  const { score, totalQuestions } = route.params;
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const motivationalData = getMotivationalMessage(score, totalQuestions);
  const scorePercentage = Math.round((score / totalQuestions) * 100);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/sports-bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Animated.View style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            <Text style={styles.title}>Game Over!</Text>
            <View style={styles.divider} />
            
            <View style={styles.scoreContainer}>
              <View style={styles.scoreCircle}>
                <Text style={styles.percentageText}>{scorePercentage}%</Text>
              </View>
              <Text style={styles.fractionText}>
                {score} / {totalQuestions}
              </Text>
              <Text style={styles.labelText}>
                Final Score
              </Text>
            </View>

            <View style={styles.messageContainer}>
              <MaterialCommunityIcons 
                name={motivationalData.icon} 
                size={32} 
                color={motivationalData.color}
              />
              <Text style={styles.messageText}>
                {motivationalData.message}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.replace('Game')}
              style={[styles.button, styles.playAgainButton]}
            >
              <MaterialCommunityIcons name="reload" size={24} color="white" />
              <Text style={styles.buttonText}>
                Play Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Leaderboard')}
              style={[styles.button, styles.leaderboardButton]}
            >
              <MaterialCommunityIcons name="trophy-outline" size={24} color="white" />
              <Text style={styles.buttonText}>
                View Leaderboard
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default EndGameScreen; 