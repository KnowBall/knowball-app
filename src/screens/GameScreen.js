import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuestions } from '../hooks/useQuestions';

export default function GameScreen() {
  const navigation = useNavigation();
  const { questions, loading, error } = useQuestions();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);

  // Debug: Log when component mounts and questions load
  useEffect(() => {
    console.log('GameScreen mounted');
    console.log('Navigation available:', !!navigation);
    console.log('Navigation methods:', Object.keys(navigation));
  }, []);

  useEffect(() => {
    if (!loading && questions.length > 0) {
      console.log(`Questions loaded. Total questions: ${questions.length}`);
      setTimerActive(true);
    }
  }, [loading, questions]);

  // Debug: Log question index changes
  useEffect(() => {
    console.log(`Question index updated: ${currentQuestionIndex + 1} of ${questions.length}`);
    if (currentQuestionIndex === questions.length - 1) {
      console.log('On final question!');
    }
  }, [currentQuestionIndex, questions.length]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0 && !showExplanation) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showExplanation) {
      console.log('Time up for question:', currentQuestionIndex + 1);
      setShowExplanation(true);
      setTimerActive(false);
    }

    return () => clearInterval(timer);
  }, [timeLeft, timerActive, showExplanation, currentQuestionIndex]);

  // Auto-advance effect with enhanced debugging
  useEffect(() => {
    let advanceTimer;
    if (showExplanation) {
      advanceTimer = setTimeout(() => {
        console.log('Checking for game progression...');
        console.log(`Current index: ${currentQuestionIndex}, Total questions: ${questions.length}`);
        
        if (currentQuestionIndex < questions.length - 1) {
          console.log('Moving to next question');
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setShowExplanation(false);
          setSelectedAnswer(null);
          setTimeLeft(15);
          setTimerActive(true);
        } else {
          console.log('GAME OVER - Preparing to navigate');
          console.log('Final score:', score);
          console.log('Total questions:', questions.length);
          
          // Show alert before navigation
          Alert.alert(
            'Game Complete!',
            `Your score: ${score}/${questions.length}`,
            [
              {
                text: 'See Results',
                onPress: () => {
                  console.log('Attempting navigation to EndGame screen...');
                  try {
                    navigation.replace('EndGame', {
                      score: score,
                      totalQuestions: questions.length
                    });
                    console.log('Navigation command executed');
                  } catch (error) {
                    console.error('Navigation failed:', error);
                    // Fallback attempts
                    console.log('Trying fallback navigation...');
                    try {
                      navigation.navigate('EndGame', {
                        score: score,
                        totalQuestions: questions.length
                      });
                    } catch (error2) {
                      console.error('All navigation attempts failed:', error2);
                      Alert.alert(
                        'Navigation Error',
                        'Unable to show results screen. Please return to home.',
                        [
                          {
                            text: 'Return Home',
                            onPress: () => navigation.navigate('Home')
                          }
                        ]
                      );
                    }
                  }
                }
              }
            ]
          );
        }
      }, 1500);
    }
    return () => clearTimeout(advanceTimer);
  }, [showExplanation, currentQuestionIndex, questions.length, navigation, score]);

  const handleAnswer = (answer) => {
    console.log(`Answer selected for question ${currentQuestionIndex + 1}`);
    setTimerActive(false);
    setSelectedAnswer(answer);
    setShowExplanation(true);
    if (answer === questions[currentQuestionIndex].correctAnswer) {
      console.log('Correct answer!');
      setScore(score + 1);
    } else {
      console.log('Incorrect answer');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  
  // Debug logging
  useEffect(() => {
    if (currentQuestion) {
      console.log('Current question:', currentQuestion);
      console.log('Options type:', typeof currentQuestion.options);
      console.log('Options value:', currentQuestion.options);
    }
  }, [currentQuestion]);

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
          Error loading questions. Please try again later.
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
              {currentQuestion?.question}
            </Text>

            {/* Options */}
            <View style={{ marginBottom: 24 }}>
              {currentQuestion?.options && Array.isArray(currentQuestion.options) ? (
                currentQuestion.options.map((option, index) => (
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
                        ? option === currentQuestion.correctAnswer
                          ? '#dcfce7'
                          : selectedAnswer === option
                            ? '#fee2e2'
                            : 'white'
                        : selectedAnswer === option
                          ? '#f3f4f6'
                          : 'white',
                      borderWidth: 2,
                      borderColor: showExplanation
                        ? option === currentQuestion.correctAnswer
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
                        ? option === currentQuestion.correctAnswer
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
                  {timeLeft === 0 ? "Time's up! " : ""}{currentQuestion.explanation}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
} 