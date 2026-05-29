/**
 * Import ENRICHED word data from existing zhongkao.html into Turso.
 * Run AFTER creating the Turso database and setting .env.local.
 *
 * Usage:
 *   node --require dotenv/config scripts/import-data.js
 */
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const SOURCE_FILE = '/mnt/d/sword-vocab/zhongkao.html';
const WORKSPACE_FILE = path.join(__dirname, '..', 'zhongkao.html');

function loadEnriched() {
  let html;
  try {
    html = fs.readFileSync(SOURCE_FILE, 'utf-8');
  } catch {
    html = fs.readFileSync(WORKSPACE_FILE, 'utf-8');
  }

  const match = html.match(/var ENRICHED\s*=\s*(\{[\s\S]*?\});/);
  if (!match) throw new Error('Could not find var ENRICHED in source file');

  return JSON.parse(match[1]);
}

async function initTables() {
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
}

async function main() {
  console.log('Connecting to Turso...');
  await initTables();
  console.log('Tables ready.');

  console.log('Loading ENRICHED data...');
  const enriched = loadEnriched();
  const entries = Object.keys(enriched).length;
  console.log(`Found ${entries} word entries`);

  let count = 0;
  for (const key of Object.keys(enriched)) {
    const e = enriched[key];
    await client.execute({
      sql: `INSERT OR REPLACE INTO ldoce_words
            (word, ldoce_pron, ldoce_syllable, ldoce_pos, chinese_def, examples, ldoce_phrases, ldoce_phrasal_verbs, ldoce_idioms)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        key.toLowerCase(),
        e.phonetic || null,
        e.syllables || null,
        e.pos || null,
        e.cn || null,
        e.examples ? JSON.stringify(e.examples) : null,
        e.phrases ? (typeof e.phrases === 'string' ? e.phrases : JSON.stringify(e.phrases)) : null,
        e.forms ? (typeof e.forms === 'string' ? e.forms : JSON.stringify(e.forms)) : null,
        JSON.stringify({
          prov: e.prov || null,
          tips: e.tips || null,
          ants: e.ants || null,
          syns: e.syns || null,
        }),
      ],
    });
    count++;
    if (count % 200 === 0) console.log(`  ${count}/${entries}...`);
  }

  console.log(`Imported ${count} words into Turso.`);
  console.log('Done.');
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
