import React, { useRef, useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, Animated, PanResponder, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

const QUESTIONS = [
  {
    question: 'Which country won the 2018 FIFA World Cup?',
    options: ['France', 'Brazil', 'Germany'],
    correctAnswer: 'France',
  },
  {
    question: 'How many points is a touchdown worth in American football?',
    options: ['3', '6', '7'],
    correctAnswer: '6',
  },
  {
    question: 'Which sport uses the term "home run"?',
    options: ['Baseball', 'Soccer', 'Basketball'],
    correctAnswer: 'Baseball',
  },
];

export default function FlickFootballScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null); // 'correct' | 'incorrect' | null
  const [showNext, setShowNext] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'correct'|'incorrect', points: number }
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  // Feedback animation
  React.useEffect(() => {
    if (feedback) {
      feedbackOpacity.setValue(0);
      Animated.timing(feedbackOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(feedbackOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => setFeedback(null));
        }, 1500);
      });
    }
  }, [feedback]);

  const footballY = useRef(new Animated.Value(0)).current;
  const footballX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([
        null,
        { dx: footballX, dy: footballY },
      ], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        const { dx, dy, vx, vy } = gesture;
        let chosen = null;
        if (vy < -0.7 || dy < -height * 0.18) {
          if (dx < -width * 0.15) chosen = 0; // left
          else if (dx > width * 0.15) chosen = 2; // right
          else chosen = 1; // center
        }
        if (chosen !== null && !showNext) {
          setSelected(chosen);
          const visibleOptions = QUESTIONS[current].options.slice(0, 3);
          const isCorrect = visibleOptions[chosen] === QUESTIONS[current].correctAnswer;
          setFeedback({ type: isCorrect ? 'correct' : 'incorrect', points: isCorrect ? 10 : -3 });
          setResult(isCorrect ? 'correct' : 'incorrect');
          setShowNext(true);
        }
        Animated.spring(footballX, { toValue: 0, useNativeDriver: false }).start();
        Animated.spring(footballY, { toValue: 0, useNativeDriver: false }).start();
      },
    })
  ).current;

  const handleNext = () => {
    setSelected(null);
    setResult(null);
    setShowNext(false);
    setCurrent((prev) => (prev + 1) % QUESTIONS.length);
  };

  const q = QUESTIONS[current];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, touchAction: 'none' }}>
      <ImageBackground
        source={require('../assets/football-field.jpg')} // Placeholder image
        style={{ flex: 1, width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        {/* Feedback Overlay */}
        {feedback && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 60,
              left: 0,
              right: 0,
              alignItems: 'center',
              zIndex: 20,
              opacity: feedbackOpacity,
            }}
          >
            <View style={{
              backgroundColor: feedback.type === 'correct' ? 'rgba(34,197,94,0.95)' : 'rgba(220,38,38,0.95)',
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 16,
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
            }}>
              <Text style={{
                color: '#fff',
                fontSize: 22,
                fontWeight: '800',
                textAlign: 'center',
                letterSpacing: 0.2,
              }}>
                {feedback.type === 'correct' ? '✅ Correct! +10 points' : '❌ Wrong! –3 points'}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ position: 'absolute', top: 48, left: 24, zIndex: 10, backgroundColor: colors.card, borderRadius: 20, padding: 10 }}
        >
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18 }}>← Back</Text>
        </TouchableOpacity>

        {/* Question */}
        <View style={{
          marginTop: 100,
          marginBottom: 40,
          alignItems: 'center',
          paddingHorizontal: 24,
        }}>
          <View style={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 16,
            borderRadius: 12,
            maxWidth: 500,
            alignSelf: 'center',
          }}>
            <Text style={{
              color: '#fff',
              fontSize: 24,
              fontWeight: '700',
              textAlign: 'center',
              letterSpacing: 0.2,
            }}>{q.question}</Text>
          </View>
        </View>

        {/* Targets/Goals */}
        <View style={{ position: 'absolute', bottom: 160, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 32 }}>
          {q.options.slice(0, 3).map((choice, idx) => (
            <View key={choice} style={{ alignItems: 'center', width: '30%' }}>
              <View style={{
                width: 70, height: 70, borderRadius: 35, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center',
                borderWidth: 4,
                borderColor:
                  selected === idx && result === 'correct' ? '#22c55e' :
                  selected === idx && result === 'incorrect' ? '#dc2626' :
                  '#444',
                shadowColor: selected === idx && result === 'correct' ? '#22c55e' : selected === idx && result === 'incorrect' ? '#dc2626' : '#000',
                shadowOpacity: selected === idx ? 0.5 : 0.2,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 5,
              }}>
                {selected === idx && result === 'correct' && (
                  <Text style={{ fontSize: 32, color: '#22c55e', fontWeight: 'bold' }}>✓</Text>
                )}
                {selected === idx && result === 'incorrect' && (
                  <Text style={{ fontSize: 32, color: '#dc2626', fontWeight: 'bold' }}>✗</Text>
                )}
              </View>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 8, textAlign: 'center' }}>{choice}</Text>
            </View>
          ))}
        </View>

        {/* Football (Draggable) */}
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            position: 'absolute',
            left: width / 2 - 40,
            bottom: 50,
            width: 80,
            height: 80,
            zIndex: 10,
            transform: [
              { translateX: footballX },
              { translateY: footballY },
            ],
          }}
        >
          <Image
            source={require('../assets/football.png')} // Placeholder football image
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Next Button */}
        {showNext && (
          <TouchableOpacity
            onPress={handleNext}
            style={{ position: 'absolute', bottom: 40, left: width / 2 - 80, width: 160, backgroundColor: colors.primary, borderRadius: 20, padding: 16, alignItems: 'center', zIndex: 20 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>Next Question</Text>
          </TouchableOpacity>
        )}
      </ImageBackground>
    </View>
  );
} 