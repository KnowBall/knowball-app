import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

const sampleQuestions = [
  {
    question: "Which NFL team has won the most Super Bowl championships?",
    options: [
      "New England Patriots",
      "Pittsburgh Steelers",
      "San Francisco 49ers",
      "Green Bay Packers"
    ],
    correctAnswer: "New England Patriots",
    explanation: "The New England Patriots have won 6 Super Bowl championships."
  },
  {
    question: "Who holds the NBA record for most points scored in a single game?",
    options: [
      "Kobe Bryant",
      "Michael Jordan",
      "Wilt Chamberlain",
      "LeBron James"
    ],
    correctAnswer: "Wilt Chamberlain",
    explanation: "Wilt Chamberlain scored 100 points on March 2, 1962."
  },
  {
    question: "In which year did the Chicago Cubs break their World Series championship drought?",
    options: [
      "2015",
      "2016",
      "2017",
      "2018"
    ],
    correctAnswer: "2016",
    explanation: "The Cubs won in 2016, breaking a 108-year championship drought."
  }
];

export async function addSampleQuestions() {
  try {
    for (const question of sampleQuestions) {
      await addDoc(collection(db, 'questions'), question);
    }
    console.log('Sample questions added successfully!');
  } catch (error) {
    console.error('Error adding sample questions:', error);
  }
} 