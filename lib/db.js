import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ── Low-level Turso adapter ──
// Preserves db.get / db.run semantics so upstream code needs zero changes.
const db = {
  async get(sql, args = []) {
    const result = await client.execute({ sql, args });
    return result.rows.length > 0 ? result.rows[0] : null;
  },

  async run(sql, args = []) {
    return await client.execute({ sql, args });
  },

  async all(sql, args = []) {
    const result = await client.execute({ sql, args });
    return result.rows;
  },
};

export default db;

// ── Init tables ──

export async function initTables() {
  await db.run(`
    CREATE TABLE IF NOT EXISTS word_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_type TEXT NOT NULL,
      word TEXT NOT NULL,
      review_score INTEGER DEFAULT 0,
      status TEXT DEFAULT 'learning',
      UNIQUE(book_type, word)
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS ldoce_words (
      word TEXT PRIMARY KEY,
      ldoce_pron TEXT,
      ldoce_syllable TEXT,
      ldoce_pos TEXT,
      chinese_def TEXT,
      examples TEXT,
      ldoce_phrases TEXT,
      ldoce_phrasal_verbs TEXT,
      ldoce_idioms TEXT
    )
  `);
}

// ── ldoce_words ──

export async function getAllWords() {
  const rows = await db.all('SELECT * FROM ldoce_words');
  const map = {};
  for (const r of rows) {
    if (r) map[String(r.word).toLowerCase()] = r;
  }
  return map;
}

export async function getWord(word) {
  const r = await db.get('SELECT * FROM ldoce_words WHERE word = ?', [word.toLowerCase()]);
  return r || null;
}

// ── word_reviews ──

export async function getReview(bookType, word) {
  return await db.get(
    'SELECT * FROM word_reviews WHERE book_type = ? AND word = ?',
    [bookType, word.toLowerCase()]
  );
}

export async function upsertReview(bookType, word, score, status) {
  await db.run(
    `INSERT INTO word_reviews (book_type, word, review_score, status)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(book_type, word) DO UPDATE SET review_score = ?, status = ?`,
    [bookType, word.toLowerCase(), score, status, score, status]
  );
}

export async function getNextWord(bookType) {
  const review = await db.get(
    `SELECT r.word, r.review_score
     FROM word_reviews r
     WHERE r.book_type = ? AND r.status = 'learning'
     ORDER BY r.review_score ASC
     LIMIT 1`,
    [bookType]
  );

  if (!review) return null;

  const wd = await getWord(review.word);
  return {
    word: review.word,
    review_score: review.review_score,
    ldoce_pron: wd?.ldoce_pron || null,
    ldoce_syllable: wd?.ldoce_syllable || null,
    chinese_def: wd?.chinese_def || null,
    examples: wd?.examples ? JSON.parse(wd.examples) : [],
    ldoce_phrases: wd?.ldoce_phrases || null,
    ldoce_phrasal_verbs: wd?.ldoce_phrasal_verbs || null,
    ldoce_idioms: wd?.ldoce_idioms || null,
  };
}
