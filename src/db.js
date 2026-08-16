'use strict';

const { MongoClient } = require('mongodb');

let client = null;
let db = null;

async function connect() {
  if (db) return db;
  const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
  const dbName = process.env.DB_NAME || 'vrndavan';
  client = new MongoClient(url, { maxPoolSize: 20 });
  await client.connect();
  db = client.db(dbName);
  console.log(`[db] connected to ${dbName}`);
  return db;
}

function getDb() {
  if (!db) throw new Error('DB not initialised. Call connect() first.');
  return db;
}

async function close() {
  if (client) await client.close();
  db = null;
  client = null;
}

module.exports = { connect, getDb, close };
