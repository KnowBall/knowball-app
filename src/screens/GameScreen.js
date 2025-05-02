import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, ImageBackground, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useQuestions } from '../hooks/useQuestions';

export default function GameScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { questions: challengeQuestions, challengeId, isChallenge } = route.params || {};
  const { questions: normalQuestions, loading, error } = useQuestions();
  const [questions, setQuestions] = useState(challengeQuestions || []);
  const [questionsLoading, setQuestionsLoading] = useState(isChallenge && !challengeQuestions);
  const [questionsError, setQuestionsError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [currentCorrectStreak, setCurrentCorrectStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [pointChange, setPointChange] = useState(null);
  const [showPointChange, setShowPointChange] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const pointAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isChallenge) {
      if (challengeQuestions && Array.isArray(challengeQuestions) && challengeQuestions.length > 0) {
        setQuestions(challengeQuestions);
        setQuestionsLoading(false);
        setQuestionsError(null);
      } else {
        setQuestionsError('Error loading challenge questions.');
        setQuestionsLoading(false);
      }
    } else {
      setQuestions(normalQuestions);
      setQuestionsLoading(loading);
      setQuestionsError(error);
    }
  }, [isChallenge, challengeQuestions, normalQuestions, loading, error]);

  // Reset game state when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setCurrentQuestionIndex(0);
      setScore(0);
      setCurrentCorrectStreak(0);
      setMaxStreak(0);
      setCorrectCount(0);
      setPointChange(null);
      setShowPointChange(false);
      setShowExplanation(false);
      setSelectedAnswer(null);
      setTimeLeft(15);
      setTimerActive(false);
      
      // Start timer if we have questions
      if (!loading && questions.length > 0) {
        setTimerActive(true);
      }
    }, [loading, questions])
  );

  // Start timer when questions are loaded
  useEffect(() => {
    if (!loading && questions.length > 0) {
      setTimerActive(true);
    }
  }, [loading, questions]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0 && !showExplanation) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showExplanation) {
      setShowExplanation(true);
      setTimerActive(false);
    }

    return () => clearInterval(timer);
  }, [timeLeft, timerActive, showExplanation]);

  // Auto-advance effect
  useEffect(() => {
    let advanceTimer;
    if (showExplanation) {
      advanceTimer = setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setShowExplanation(false);
          setSelectedAnswer(null);
          setTimeLeft(15);
          setTimerActive(true);
        } else {
          // Direct navigation without handleGameComplete function
          navigation.navigate('EndGame', {
            score: score,
            totalQuestions: questions.length,
            correctCount: correctCount,
            maxStreak: maxStreak,
            isChallenge,
            challengeId
          });
        }
      }, 1500);
    }
    return () => clearTimeout(advanceTimer);
  }, [showExplanation, currentQuestionIndex, questions.length, score, navigation, correctCount, maxStreak, isChallenge, challengeId]);

  const triggerPointChange = (text) => {
    setPointChange(text);
    setShowPointChange(true);
    pointAnim.setValue(0);
    Animated.timing(pointAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start(() => setShowPointChange(false));
  };

  const handleAnswer = (answer) => {
    setTimerActive(false);
    setSelectedAnswer(answer);
    setShowExplanation(true);
    if (answer === questions[currentQuestionIndex].correctAnswer) {
      let newScore = score + 10;
      let newStreak = currentCorrectStreak + 1;
      triggerPointChange('+10');
      // Streak bonus
      if (newStreak % 3 === 0) {
        newScore += 5;
        triggerPointChange('🔥 Streak +5');
      }
      setScore(newScore);
      setCurrentCorrectStreak(newStreak);
      setCorrectCount(correctCount + 1);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      setScore(score - 3);
      setCurrentCorrectStreak(0);
      triggerPointChange('–3');
    }
  };

  if (questionsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (questionsError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#dc2626', fontSize: 18, textAlign: 'center' }}>
          {questionsError}
        </Text>
        <TouchableOpacity
          style={{ marginTop: 16, padding: 12, backgroundColor: '#16a34a', borderRadius: 8 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#4b5563', fontSize: 18, textAlign: 'center' }}>
          No questions available. Please try again later.
        </Text>
        <TouchableOpacity
          style={{ marginTop: 16, padding: 12, backgroundColor: '#16a34a', borderRadius: 8 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>Go Back</Text>
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: 24, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '100%', maxWidth: 600, backgroundColor: 'rgba(255,255,255,0.95)', padding: 32, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}>
            {/* Score, Progress, and Timer */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
              <Text style={{ fontSize: 18, color: '#4b5563' }}>
                Question {currentQuestionIndex + 1}/{questions.length}
              </Text>
              <Text style={{ fontSize: 18, color: '#16a34a', fontWeight: '600' }}>
                Score: {score}
              </Text>
            </View>

            {/* Animated Point Change Indicator */}
            {showPointChange && (
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 60,
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                  opacity: pointAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                  transform: [{ translateY: pointAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) }],
                  zIndex: 10,
                }}
              >
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: pointChange?.includes('+') ? '#16a34a' : pointChange?.includes('–') ? '#dc2626' : '#f59e42', textShadowColor: '#000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                  {pointChange}
                </Text>
              </Animated.View>
            )}

            {/* Timer Display */}
            <View style={{ 
              alignItems: 'center', 
              marginBottom: 16, 
              padding: 8,
              backgroundColor: timeLeft <= 5 ? '#fee2e2' : '#f3f4f6',
              borderRadius: 8
            }}>
              <Text style={{ 
                fontSize: 20, 
                fontWeight: '600',
                color: timeLeft <= 5 ? '#dc2626' : '#4b5563'
              }}>
                Time Left: {timeLeft}s
              </Text>
            </View>

            {/* Question */}
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 24, textAlign: 'left' }}>
              {questions[currentQuestionIndex]?.question}
            </Text>

            {/* Options */}
            <View style={{ marginBottom: 24 }}>
              {questions[currentQuestionIndex]?.options && Array.isArray(questions[currentQuestionIndex].options) ? (
                questions[currentQuestionIndex].options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => !showExplanation && handleAnswer(option)}
                    disabled={showExplanation}
                    style={{
                      width: '100%',
                      padding: 16,
                      marginBottom: 12,
                      borderRadius: 12,
                      backgroundColor: showExplanation
                        ? option === questions[currentQuestionIndex].correctAnswer
                          ? '#dcfce7'
                          : selectedAnswer === option
                            ? '#fee2e2'
                            : 'white'
                        : selectedAnswer === option
                          ? '#f3f4f6'
                          : 'white',
                      borderWidth: 2,
                      borderColor: showExplanation
                        ? option === questions[currentQuestionIndex].correctAnswer
                          ? '#16a34a'
                          : selectedAnswer === option
                            ? '#dc2626'
                            : '#e5e7eb'
                        : selectedAnswer === option
                          ? '#4b5563'
                          : '#e5e7eb',
                    }}
                  >
                    <Text style={{
                      fontSize: 16,
                      color: showExplanation
                        ? option === questions[currentQuestionIndex].correctAnswer
                          ? '#16a34a'
                          : selectedAnswer === option
                            ? '#dc2626'
                            : '#1f2937'
                        : '#1f2937',
                      fontWeight: selectedAnswer === option ? '600' : 'normal'
                    }}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ color: '#dc2626', fontSize: 16 }}>Error: Options not available</Text>
              )}
            </View>

            {/* Explanation */}
            {showExplanation && (
              <View style={{ marginBottom: 24, padding: 16, backgroundColor: '#f3f4f6', borderRadius: 12 }}>
                <Text style={{ fontSize: 16, color: '#4b5563' }}>
                  {timeLeft === 0 ? "Time's up! " : ""}{questions[currentQuestionIndex]?.explanation}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
} 