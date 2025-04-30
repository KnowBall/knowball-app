const admin = require('firebase-admin');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Initialize Firebase Admin with service account
const serviceAccount = require('./serviceAccount.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Generate a stable ID for a question based on its content
function generateQuestionId(question) {
  const hash = crypto.createHash('md5')
    .update(question.question + JSON.stringify(question.options))
    .digest('hex');
  return hash.substring(0, 12); // Use first 12 characters for a shorter ID
}

async function uploadQuestions() {
  try {
    const jsonPath = path.join(__dirname, '..', 'Complete Sports Trivia Questions with Difficulty.json');
    console.log('Reading questions from:', jsonPath);
    
    const jsonContent = await fs.readFile(jsonPath, 'utf8');
    let questions = JSON.parse(jsonContent);

    // Add IDs to questions if they don't have them
    questions = questions.map(q => ({
      ...q,
      id: q.id || generateQuestionId(q)
    }));

    // Save the updated JSON with IDs back to the file
    await fs.writeFile(jsonPath, JSON.stringify(questions, null, 2));
    console.log(`Found ${questions.length} questions to process`);

    // Clear existing questions
    console.log('Clearing existing questions...');
    const existingQuestions = await db.collection('questions').get();
    const deletePromises = existingQuestions.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    console.log(`Cleared ${existingQuestions.size} existing questions`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Get unique questions by ID
    const uniqueQuestions = Array.from(
      new Map(questions.map(q => [q.id, q])).values()
    );

    // Process questions in batches to avoid overwhelming Firestore
    const batchSize = 50;
    for (let i = 0; i < uniqueQuestions.length; i += batchSize) {
      const batch = uniqueQuestions.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (q) => {
        try {
          // Transform the question format
          const questionDoc = {
            id: q.id,
            question: q.question,
            option1: q.options[0],
            option2: q.options[1],
            option3: q.options[2],
            option4: q.options[3],
            answer: q.answer,
            explanation: q.explanation,
            difficulty: q.difficulty.toLowerCase(),
            // Add metadata
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };

          // Validate the document
          if (!questionDoc.question || !questionDoc.option1 || !questionDoc.answer) {
            throw new Error('Missing required fields');
          }

          // Add to Firestore using the generated ID
          await db.collection('questions').doc(questionDoc.id).set(questionDoc);
          console.log(`Successfully uploaded: "${q.question.substring(0, 50)}..." (ID: ${q.id})`);
          successCount++;
        } catch (error) {
          console.error(`Error uploading question: "${q.question.substring(0, 50)}..." (ID: ${q.id})`, error);
          errorCount++;
        }
      }));

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < uniqueQuestions.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\nUpload Summary:');
    console.log('----------------');
    console.log(`Total questions processed: ${questions.length}`);
    console.log(`Unique questions: ${uniqueQuestions.length}`);
    console.log(`Successfully uploaded: ${successCount}`);
    console.log(`Failed: ${errorCount}`);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the upload
uploadQuestions().then(() => {
  console.log('\nUpload process completed');
  process.exit(0);
}).catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 