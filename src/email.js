'use strict';

// Email abstraction. In production with RESEND_API_KEY set, delivers via Resend.
// Otherwise persists to the `outbound_emails` collection and logs to stdout so devs can inspect.

const { getDb } = require('./db');
const { v4: uuidv4 } = require('uuid');

const FROM = process.env.EMAIL_FROM || 'Vrndavan <hello@vrndavan.example>';
const RESEND_KEY = process.env.RESEND_API_KEY;

async function sendEmail({ to, subject, html, text, kind = 'transactional' }) {
  const db = getDb();
  const record = {
    id: uuidv4(),
    to,
    from: FROM,
    subject,
    kind,
    createdAt: new Date().toISOString(),
    provider: RESEND_KEY ? 'resend' : 'dev',
    status: 'queued',
  };

  if (RESEND_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: FROM, to, subject, html, text }),
      });
      const data = await res.json();
      record.status = res.ok ? 'sent' : 'failed';
      record.providerId = data.id || null;
      record.providerResponse = data;
    } catch (err) {
      record.status = 'failed';
      record.error = err?.message || String(err);
    }
  } else {
    // Dev mode: preview the email in the DB and log it
    record.status = 'preview';
    record.previewText = text || html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400);
    console.log(`[email:dev] To: ${to} · ${subject}\n---\n${record.previewText}\n---`);
  }

  await db.collection('outbound_emails').insertOne({ ...record, html, text });
  return record;
}

module.exports = { sendEmail };
