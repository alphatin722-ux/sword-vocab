import { getNextWord } from '../../../lib/db';

export default async function handler(req, res) {
  const { bookType } = req.query;

  if (!bookType) {
    return res.status(400).json({ error: 'bookType is required' });
  }

  const wordData = await getNextWord(bookType);

  if (!wordData) {
    return res.status(200).json({ message: 'All words mastered!' });
  }

  if (bookType === 'ket') {
    return res.status(200).json({
      word: wordData.word,
      review_score: wordData.review_score,
      ldoce_pron: wordData.ldoce_pron,
      ldoce_syllable: wordData.ldoce_syllable,
      chinese_def: wordData.chinese_def,
      examples: Array.isArray(wordData.examples) ? wordData.examples : [],
    });
  }

  return res.status(200).json({
    ...wordData,
    examples: Array.isArray(wordData.examples) ? wordData.examples : [],
  });
}
