/**
 * Initialize Turso database: create tables + import word data.
 *
 * Usage:
 *   node --require dotenv/config scripts/init-turso.js
 *
 * Or if dotenv isn't installed:
 *   TURSO_DATABASE_URL="..." TURSO_AUTH_TOKEN="..." node scripts/init-turso.js
 */
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ── Helpers ──

async function createTables() {
  console.log('Creating tables...');
  await client.execute(`
    CREATE TABLE IF NOT EXISTS word_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_type TEXT NOT NULL,
      word TEXT NOT NULL,
      review_score INTEGER DEFAULT 0,
      status TEXT DEFAULT 'learning',
      UNIQUE(book_type, word)
    )
  `);
  await client.execute(`
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
  console.log('  ✓ Tables ready');
}

async function importWords() {
  const filePath = path.join(DATA_DIR, 'ldoce_words.json');
  if (!fs.existsSync(filePath)) {
    console.log('  ⚠ No ldoce_words.json found, skipping word import.');
    return;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const keys = Object.keys(data);
  console.log(`  Importing ${keys.length} words...`);

  let count = 0;
  for (const key of keys) {
    const w = data[key];
    await client.execute({
      sql: `INSERT OR REPLACE INTO ldoce_words
            (word, ldoce_pron, ldoce_syllable, ldoce_pos, chinese_def, examples, ldoce_phrases, ldoce_phrasal_verbs, ldoce_idioms)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        String(w.word || key).toLowerCase(),
        w.ldoce_pron || null,
        w.ldoce_syllable || null,
        w.ldoce_pos || null,
        w.chinese_def || null,
        w.examples ? (typeof w.examples === 'string' ? w.examples : JSON.stringify(w.examples)) : null,
        w.ldoce_phrases || null,
        w.ldoce_phrasal_verbs || null,
        w.ldoce_idioms || null,
      ],
    });
    count++;
    if (count % 300 === 0) console.log(`    ${count}/${keys.length}...`);
  }
  console.log(`  ✓ Imported ${count} words`);
}

async function importReviews() {
  const filePath = path.join(DATA_DIR, 'word_reviews.json');
  if (!fs.existsSync(filePath)) {
    console.log('  ⚠ No word_reviews.json found, skipping review import.');
    return;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const keys = Object.keys(data);
  if (keys.length === 0) {
    console.log('  ✓ No reviews to import (empty DB)');
    return;
  }
  console.log(`  Importing ${keys.length} review records...`);

  for (const key of keys) {
    const r = data[key];
    await client.execute({
      sql: `INSERT OR REPLACE INTO word_reviews
            (book_type, word, review_score, status)
            VALUES (?, ?, ?, ?)`,
      args: [r.book_type || 'ket', r.word, r.review_score || 0, r.status || 'learning'],
    });
  }
  console.log(`  ✓ Imported ${keys.length} review records`);
}

// ── Verify ──

async function verify() {
  const words = await client.execute('SELECT COUNT(*) as c FROM ldoce_words');
  const reviews = await client.execute('SELECT COUNT(*) as c FROM word_reviews');
  console.log(`\nVerification:`);
  console.log(`  ldoce_words:  ${words.rows[0].c} rows`);
  console.log(`  word_reviews: ${reviews.rows[0].c} rows`);
}

// ── Main ──

async function main() {
  console.log('🚀 Initializing Turso database...\n');

  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('❌ ERROR: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set.');
    console.error('   Usage:');
    console.error('     TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." node scripts/init-turso.js');
    console.error('   Or with dotenv:');
    console.error('     node --require dotenv/config scripts/init-turso.js');
    process.exit(1);
  }

  await createTables();
  await importWords();
  await importReviews();
  await verify();

  console.log('\n✅ Turso initialization complete!');
}

main().catch((err) => {
  console.error('\n❌ Initialization failed:', err);
  process.exit(1);
});
