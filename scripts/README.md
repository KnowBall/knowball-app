# Question Upload Script

This script uploads sports trivia questions from a JSON/TXT file to Firestore.

## Prerequisites

1. Firebase Admin SDK credentials set up
2. Questions file in the root directory named either:
   - `Complete Sports Trivia Questions with Difficulty.json` or
   - `Complete Sports Trivia Questions with Difficulty.txt`

## Input File Format

The input file should contain an array of question objects with this structure:

```json
[
  {
    "question": "Which NFL team has won the most Super Bowl championships?",
    "options": [
      "New England Patriots",
      "Pittsburgh Steelers",
      "San Francisco 49ers",
      "Green Bay Packers"
    ],
    "answer": "New England Patriots",
    "explanation": "The New England Patriots have won 6 Super Bowl championships.",
    "difficulty": "medium"
  }
]
```

## Running the Script

1. Make sure your Firebase Admin credentials are set:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
   ```

2. Run the script:
   ```bash
   node scripts/uploadQuestions.js
   ```

## Features

- Transforms options array into separate fields (option1, option2, etc.)
- Skips duplicate questions based on question text
- Processes questions in batches to avoid rate limiting
- Adds metadata (createdAt, updatedAt) to each question
- Provides detailed upload statistics

## Firestore Document Format

Each question is stored with this structure:

```javascript
{
  question: string,
  option1: string,
  option2: string,
  option3: string,
  option4: string,
  answer: string,
  explanation: string,
  difficulty: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
``` 