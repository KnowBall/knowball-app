import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { app } from '../lib/firebase';

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const SEEN_QUESTIONS_KEY = 'seenQuestionIds';
const QUESTIONS_PER_GAME = 3;
const DIFFICULTY_DISTRIBUTION = {
  easy: 1,
  medium: 1,
  hard: 1
};

function selectQuestionsByDifficulty(questions, targetCount, difficulty, fallbackDifficulties = []) {
  console.log(`Selecting ${targetCount} ${difficulty} questions. Available questions:`, questions.length);
  let selected = questions.filter(q => q.difficulty === difficulty);
  console.log(`Found ${selected.length} questions of ${difficulty} difficulty`);
  
  // If we don't have enough questions of the target difficulty, use fallback difficulties
  if (selected.length < targetCount && fallbackDifficulties.length > 0) {
    console.log(`Not enough ${difficulty} questions, using fallbacks:`, fallbackDifficulties);
    for (const fallbackDifficulty of fallbackDifficulties) {
      const remaining = targetCount - selected.length;
      const fallbackQuestions = questions.filter(q => q.difficulty === fallbackDifficulty);
      console.log(`Found ${fallbackQuestions.length} questions of fallback difficulty ${fallbackDifficulty}`);
      selected = [...selected, ...fallbackQuestions.slice(0, remaining)];
      
      if (selected.length >= targetCount) break;
    }
  }
  
  const result = shuffleArray(selected).slice(0, targetCount);
  console.log(`Selected ${result.length} questions for ${difficulty} difficulty`);
  return result;
}

export function useQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        console.log('Starting to fetch questions...');
        // Get seen question IDs from AsyncStorage
        let seenQuestionIds = [];
        try {
          const storedIds = await AsyncStorage.getItem(SEEN_QUESTIONS_KEY);
          seenQuestionIds = storedIds ? JSON.parse(storedIds) : [];
          console.log('Retrieved seen question IDs:', seenQuestionIds.length);
        } catch (e) {
          console.warn('Error reading from AsyncStorage:', e);
        }

        const db = getFirestore(app);
        const questionsCollection = collection(db, 'questions');
        const querySnapshot = await getDocs(questionsCollection);
        console.log('Fetched questions from Firestore:', querySnapshot.size);
        
        let allQuestions = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Convert individual option fields into an array
          const options = [
            data.option1,
            data.option2,
            data.option3,
            data.option4
          ].filter(option => option !== undefined);

          // Shuffle the options
          const shuffledOptions = shuffleArray([...options]);

          return {
            id: doc.id,
            question: data.question,
            options: shuffledOptions,
            correctAnswer: data.answer,
            explanation: data.explanation,
            difficulty: (data.difficulty || 'medium').toLowerCase() // Default to medium if not specified
          };
        });

        console.log('Processed questions:', allQuestions.length);
        console.log('Difficulty distribution:', 
          allQuestions.reduce((acc, q) => {
            acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
            return acc;
          }, {})
        );

        // If we have questions from Firestore
        if (allQuestions.length > 0) {
          // Filter out seen questions
          let unseenQuestions = allQuestions.filter(q => !seenQuestionIds.includes(q.id));
          console.log('Unseen questions available:', unseenQuestions.length);
          
          // If we don't have enough unseen questions, reset the seen list
          if (unseenQuestions.length < QUESTIONS_PER_GAME) {
            console.log('Resetting seen questions list - starting fresh');
            unseenQuestions = allQuestions;
            seenQuestionIds = [];
          }

          // Select questions for each difficulty level
          const easyQuestions = selectQuestionsByDifficulty(
            unseenQuestions, 
            DIFFICULTY_DISTRIBUTION.easy, 
            'easy', 
            ['medium']
          );

          const mediumQuestions = selectQuestionsByDifficulty(
            unseenQuestions.filter(q => !easyQuestions.includes(q)), 
            DIFFICULTY_DISTRIBUTION.medium, 
            'medium', 
            ['easy', 'hard']
          );

          const hardQuestions = selectQuestionsByDifficulty(
            unseenQuestions.filter(q => ![...easyQuestions, ...mediumQuestions].includes(q)), 
            DIFFICULTY_DISTRIBUTION.hard, 
            'hard', 
            ['medium']
          );

          // Combine questions in the desired order (easy → medium → hard)
          const gameQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
          console.log('Final game questions selected:', gameQuestions.length);
          
          // Update seen questions list with new IDs
          const newSeenIds = [...seenQuestionIds, ...gameQuestions.map(q => q.id)];
          await AsyncStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(newSeenIds));
          console.log('Updated seen questions list, new total:', newSeenIds.length);
          
          setQuestions(gameQuestions);
        } else {
          console.log('No Firestore questions available, using fallback questions');
          // Use fallback questions if no Firestore questions available
          const fallbackQuestions = [
            {
              id: '1',
              question: "Which NFL team has won the most Super Bowl championships?",
              options: shuffleArray([
                "New England Patriots",
                "Pittsburgh Steelers",
                "San Francisco 49ers",
                "Green Bay Packers"
              ]),
              correctAnswer: "New England Patriots",
              explanation: "The New England Patriots have won 6 Super Bowl championships.",
              difficulty: "easy"
            },
            {
              id: '2',
              question: "Who holds the NBA record for most points scored in a single game?",
              options: shuffleArray([
                "Kobe Bryant",
                "Michael Jordan",
                "Wilt Chamberlain",
                "LeBron James"
              ]),
              correctAnswer: "Wilt Chamberlain",
              explanation: "Wilt Chamberlain scored 100 points on March 2, 1962.",
              difficulty: "medium"
            },
            {
              id: '3',
              question: "In which year did the Chicago Cubs break their World Series championship drought?",
              options: shuffleArray([
                "2015",
                "2016",
                "2017",
                "2018"
              ]),
              correctAnswer: "2016",
              explanation: "The Cubs won in 2016, breaking a 108-year championship drought.",
              difficulty: "hard"
            }
          ];
          setQuestions(fallbackQuestions);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  return { questions, loading, error };
}

// Utility to fetch 10 random questions for challenge mode
export async function fetchRandomQuestions(count = 10) {
  const db = getFirestore(app);
  const questionsCollection = collection(db, 'questions');
  const querySnapshot = await getDocs(questionsCollection);
  let allQuestions = querySnapshot.docs.map(doc => {
    const data = doc.data();
    const options = [
      data.option1,
      data.option2,
      data.option3,
      data.option4
    ].filter(option => option !== undefined);
    const shuffledOptions = shuffleArray([...options]);
    return {
      id: doc.id,
      question: data.question,
      options: shuffledOptions,
      correctAnswer: data.answer,
      explanation: data.explanation,
      difficulty: (data.difficulty || 'medium').toLowerCase()
    };
  });
  return shuffleArray(allQuestions).slice(0, count);
} 