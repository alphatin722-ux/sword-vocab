import { getReview, upsertReview } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bookType, word, isCorrect } = req.body;

  if (!bookType || !word || isCorrect === undefined) {
    return res.status(400).json({ error: 'bookType, word, and isCorrect are required' });
  }

  // 1. Get current record or initialize
  let record = await getReview(bookType, word);
  let currentScore = record ? record.review_score : 0;
  let currentStatus = record ? record.status : 'learning';

  // 2. Bidirectional scoring: +1 correct, -1 incorrect
  currentScore = isCorrect ? currentScore + 1 : currentScore - 1;

  // 3. Ebbinghaus retirement / return mechanism
  if (currentScore >= 7) {
    currentScore = 7;
    currentStatus = 'mastered';
  } else {
    currentStatus = 'learning';
  }

  // 4. Update store
  await upsertReview(bookType, word, currentScore, currentStatus);

  return res.status(200).json({
    success: true,
    newScore: currentScore,
    newStatus: currentStatus,
  });
}
