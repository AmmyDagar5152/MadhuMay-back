'use strict';

const { getDb } = require('./db');
const { PRODUCTS, ARTICLES, FESTIVALS, SAMPRADAYAS, CATEGORIES, SEVA_TIERS } = require('./data/seed-data');

// Idempotent seed: only inserts collections that are empty.
async function seedIfEmpty() {
  const db = getDb();
  const seedPairs = [
    ['products', PRODUCTS],
    ['articles', ARTICLES],
    ['festivals', FESTIVALS],
    ['sampradayas', SAMPRADAYAS],
    ['categories', CATEGORIES],
    ['seva_tiers', SEVA_TIERS],
  ];

  for (const [collName, docs] of seedPairs) {
    const coll = db.collection(collName);
    const count = await coll.countDocuments();
    if (count === 0) {
      await coll.insertMany(docs);
      console.log(`[seed] inserted ${docs.length} into ${collName}`);
    } else {
      console.log(`[seed] ${collName} already has ${count} docs, skipping`);
    }
  }

  // Ensure indexes for fast lookup.
  await db.collection('products').createIndex({ slug: 1 }, { unique: true });
  await db.collection('articles').createIndex({ slug: 1 }, { unique: true });
  await db.collection('festivals').createIndex({ date: 1 });
  await db.collection('subscribers').createIndex({ email: 1 }, { unique: true });
  await db.collection('gifting_sessions').createIndex({ createdAt: -1 });
}

module.exports = { seedIfEmpty };
