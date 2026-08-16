'use strict';

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'vrndavan-dev-secret-change-in-production';
const JWT_EXPIRES = '30d';
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@vrndavan.example')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, isAdmin: !!user.isAdmin }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_) {
    return null;
  }
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function upsertUser({ email, name = null, provider = 'email' }) {
  const db = getDb();
  const normalized = String(email).trim().toLowerCase();
  const isAdmin = ADMIN_EMAILS.includes(normalized);
  const existing = await db.collection('users').findOne({ email: normalized });
  if (existing) {
    const update = { $set: { isAdmin, provider } };
    if (name && !existing.name) update.$set.name = name;
    await db.collection('users').updateOne({ _id: existing._id }, update);
    return { ...existing, isAdmin, provider, name: name || existing.name };
  }
  const doc = {
    id: uuidv4(),
    email: normalized,
    name,
    isAdmin,
    provider,
    altar: [],
    createdAt: new Date().toISOString(),
  };
  await db.collection('users').insertOne(doc);
  return doc;
}

async function findUserById(id) {
  if (!id) return null;
  const db = getDb();
  return db.collection('users').findOne({ id }, { projection: { _id: 0 } });
}

async function saveCode(email, code) {
  const db = getDb();
  const normalized = String(email).trim().toLowerCase();
  await db.collection('sign_in_codes').updateOne(
    { email: normalized },
    { $set: { email: normalized, code, expiresAt: Date.now() + CODE_TTL_MS } },
    { upsert: true }
  );
}

async function consumeCode(email, code) {
  const db = getDb();
  const normalized = String(email).trim().toLowerCase();
  const doc = await db.collection('sign_in_codes').findOne({ email: normalized });
  if (!doc) return false;
  if (doc.code !== code) return false;
  if (doc.expiresAt < Date.now()) return false;
  await db.collection('sign_in_codes').deleteOne({ email: normalized });
  return true;
}

function contextFromRequest(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  return {
    userId: payload?.sub || null,
    userEmail: payload?.email || null,
    isAdmin: !!payload?.isAdmin,
  };
}

module.exports = {
  ADMIN_EMAILS,
  JWT_SECRET,
  issueToken,
  verifyToken,
  generateCode,
  upsertUser,
  findUserById,
  saveCode,
  consumeCode,
  contextFromRequest,
};
