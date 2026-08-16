'use strict';

const cron = require('node-cron');
const { getDb } = require('./db');
const { sendEmail } = require('./email');

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function reminderTemplate(festival, subscriberEmail) {
  const isEkadashi = festival.kind === 'Ekadashi';
  const subject = isEkadashi
    ? `Tomorrow is ${festival.name} — a quiet note`
    : `Tomorrow: ${festival.name}`;

  const opening = isEkadashi
    ? `Tomorrow is ${festival.name}, the eleventh day of the lunar fortnight.`
    : `Tomorrow is ${festival.name}.`;

  const body = [
    opening,
    festival.note ? `“${festival.note}”` : null,
    isEkadashi
      ? 'The house changes its pattern for a day. No grains, no legumes — fruit, milk, kuttu, sabudana, and a book you have been meaning to open. If you have never fasted, begin with fruit and one chapter of the Bhagavatam. See what the next morning feels like.'
      : 'A day kept quietly, with a small aarti and a moment before the altar.',
    'From all of us at Vrndavan.',
  ].filter(Boolean);

  const text = body.join('\n\n');
  const html = `<div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2B2420; background: #F7F3EC; padding: 40px;">
    <p style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #C9A15A; margin: 0 0 12px;">The Vaishnav Calendar</p>
    <h1 style="font-family: Georgia, serif; font-weight: 400; font-size: 32px; color: #1B3A4B; margin: 0 0 6px; letter-spacing: -0.01em;">${festival.name}</h1>
    <p style="color: #7A6B5D; margin: 0 0 24px; font-size: 14px;">${fmtDate(festival.date)}</p>
    ${body.map((p, i) => `<p style="font-size: ${i === 1 ? '18px; font-style: italic;' : '16px;'} line-height: 1.7; color: #2B2420; margin: 0 0 18px;">${p}</p>`).join('\n')}
    <hr style="border: none; border-top: 1px solid #E2D8C1; margin: 32px 0;"/>
    <p style="font-size: 12px; color: #7A6B5D; margin: 0;">You are receiving this because you signed up for the Daily Shloka at vrndavan. To stop, reply with “quiet”.</p>
  </div>`;

  return { subject, text, html };
}

async function sendEkadashiReminders({ force = false, dryRun = false } = {}) {
  const db = getDb();
  // Find festivals dated "tomorrow" (IST-ish: use UTC date + 1 day)
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const query = force
    ? { date: { $gte: new Date().toISOString().slice(0, 10) } }
    : { date: tomorrowStr };
  const festivals = await db.collection('festivals').find(query).sort({ date: 1 }).limit(1).toArray();
  if (festivals.length === 0) {
    return { sent: 0, festival: null, reason: force ? 'no upcoming festival' : 'no festival tomorrow' };
  }
  const festival = festivals[0];

  // Prevent duplicate sends for the same festival
  const already = await db.collection('reminders_sent').findOne({ date: festival.date, name: festival.name });
  if (already && !force) {
    return { sent: 0, festival, reason: 'already sent' };
  }

  const subscribers = await db.collection('subscribers').find({}, { projection: { email: 1, _id: 0 } }).limit(10000).toArray();
  if (subscribers.length === 0) {
    return { sent: 0, festival, reason: 'no subscribers' };
  }

  let sent = 0;
  for (const sub of subscribers) {
    const { subject, text, html } = reminderTemplate(festival, sub.email);
    if (dryRun) continue;
    await sendEmail({ to: sub.email, subject, text, html, kind: 'ekadashi_reminder' });
    sent++;
  }

  if (!dryRun) {
    await db.collection('reminders_sent').updateOne(
      { date: festival.date, name: festival.name },
      { $set: { date: festival.date, name: festival.name, sentTo: subscribers.length, sentAt: new Date().toISOString() } },
      { upsert: true }
    );
  }

  return { sent, festival };
}

function start() {
  // 18:00 IST daily → 12:30 UTC. Sends reminders for anything happening tomorrow.
  cron.schedule('30 12 * * *', async () => {
    try {
      const result = await sendEkadashiReminders();
      if (result.sent > 0) {
        console.log(`[reminders] sent ${result.sent} for ${result.festival.name} on ${result.festival.date}`);
      } else {
        console.log(`[reminders] daily check — ${result.reason}`);
      }
    } catch (err) {
      console.error('[reminders] error:', err);
    }
  });
  console.log('[reminders] scheduler active (daily 12:30 UTC / 18:00 IST)');
}

module.exports = { start, sendEkadashiReminders };
