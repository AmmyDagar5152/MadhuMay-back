'use strict';

const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const {
  issueToken,
  generateCode,
  saveCode,
  consumeCode,
  upsertUser,
  findUserById,
} = require('../auth');
const { sendEkadashiReminders } = require('../reminders');
const { sendEmail } = require('../email');

const BUDGET_MAP = {
  lt2k: [0, 2000],
  '2to5': [2000, 5000],
  '5to10': [5000, 10000],
  gt10: [10000, Infinity],
};
const FEELING_TO_CATEGORY = {
  daily: ['daily-bhakti'],
  altar: ['home-temple'],
  'first-mala': ['daily-bhakti'],
  study: ['books'],
  'festival-kit': ['gifting'],
};
const RECIPIENT_PHRASE = {
  parent: 'a parent or elder',
  partner: 'a partner',
  friend: 'a close friend',
  mentor: 'a guru or mentor',
  self: 'yourself',
};
const FEELING_PHRASE = {
  daily: 'quiet daily practice',
  altar: 'a devotional home',
  'first-mala': 'a beginning',
  study: 'time to sit with books',
  'festival-kit': 'a festival kept beautifully',
};

function curate(products, answers) {
  const [minB, maxB] = BUDGET_MAP[answers.budget] || [0, Infinity];
  const preferredCats = FEELING_TO_CATEGORY[answers.feeling] || [];
  const samp = answers.sampradaya;

  const scored = products
    .map((p) => {
      let score = 0;
      if (preferredCats.includes(p.category)) score += 5;
      if (samp && samp !== 'any' && p.sampradaya.includes(samp)) score += 3;
      if (p.price >= minB && p.price <= maxB) score += 4;
      else score -= 2;
      if (answers.feeling === 'first-mala' && p.slug.includes('mala')) score += 6;
      if (answers.feeling === 'festival-kit' && p.slug.includes('ekadashi')) score += 5;
      if (answers.feeling === 'study' && p.category === 'books') score += 4;
      if (answers.occasion === 'housewarming' && p.category === 'home-temple') score += 3;
      if (answers.recipient === 'mentor' && p.price >= 3000) score += 1;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .filter((x) => x.score > 0)
    .slice(0, 3)
    .map((x) => x.p);

  if (scored.length < 3) {
    const filler = products.filter((p) => !scored.includes(p)).slice(0, 3 - scored.length);
    return [...scored, ...filler];
  }
  return scored;
}

function requireAdmin(ctx) {
  if (!ctx.isAdmin) throw new Error('Admin access required. Sign in as an admin-listed email.');
}
function requireAuth(ctx) {
  if (!ctx.userId) throw new Error('Please sign in.');
}

async function shapeUser(userDoc) {
  if (!userDoc) return null;
  const db = getDb();
  const altarSlugs = userDoc.altar || [];
  let altarProducts = [];
  if (altarSlugs.length) {
    altarProducts = await db
      .collection('products')
      .find({ slug: { $in: altarSlugs } }, { projection: { _id: 0 } })
      .toArray();
  }
  return {
    id: userDoc.id,
    email: userDoc.email,
    name: userDoc.name || null,
    isAdmin: !!userDoc.isAdmin,
    provider: userDoc.provider || 'email',
    altar: altarSlugs,
    altarProducts,
    createdAt: userDoc.createdAt,
  };
}

const resolvers = {
  Query: {
    health: () => 'ok',

    products: async (_, { category, sampradaya, sort }) => {
      const db = getDb();
      const query = {};
      if (category && category !== 'all') query.category = category;
      if (sampradaya && sampradaya.length > 0) query.sampradaya = { $in: sampradaya };
      const cursor = db.collection('products').find(query, { projection: { _id: 0 } }).limit(200);
      let docs = await cursor.toArray();
      if (sort === 'price-asc') docs.sort((a, b) => a.price - b.price);
      else if (sort === 'price-desc') docs.sort((a, b) => b.price - a.price);
      return docs;
    },
    product: async (_, { slug }) => {
      const db = getDb();
      return db.collection('products').findOne({ slug }, { projection: { _id: 0 } });
    },
    articles: async () => {
      const db = getDb();
      return db.collection('articles').find({}, { projection: { _id: 0 } }).limit(200).toArray();
    },
    article: async (_, { slug }) => {
      const db = getDb();
      return db.collection('articles').findOne({ slug }, { projection: { _id: 0 } });
    },
    sampradayas: async () => getDb().collection('sampradayas').find({}, { projection: { _id: 0 } }).limit(50).toArray(),
    categories: async () => getDb().collection('categories').find({}, { projection: { _id: 0 } }).limit(50).toArray(),
    sevaTiers: async () => getDb().collection('seva_tiers').find({}, { projection: { _id: 0 } }).limit(20).toArray(),
    festivals: async (_, { limit }) => {
      const db = getDb();
      const cursor = db.collection('festivals').find({}, { projection: { _id: 0 } }).sort({ date: 1 });
      if (limit) cursor.limit(limit);
      return cursor.toArray();
    },
    upcomingFestivals: async (_, { limit = 5 }) => {
      const db = getDb();
      const today = new Date().toISOString().slice(0, 10);
      return db
        .collection('festivals')
        .find({ date: { $gte: today } }, { projection: { _id: 0 } })
        .sort({ date: 1 })
        .limit(limit)
        .toArray();
    },
    me: async (_, __, ctx) => {
      if (!ctx.userId) return null;
      const doc = await findUserById(ctx.userId);
      return shapeUser(doc);
    },
    allSubscribers: async (_, __, ctx) => {
      requireAdmin(ctx);
      return getDb().collection('subscribers').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(1000).toArray();
    },
    allUsers: async (_, __, ctx) => {
      requireAdmin(ctx);
      const docs = await getDb().collection('users').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(1000).toArray();
      return Promise.all(docs.map(shapeUser));
    },
    allOrders: async (_, __, ctx) => {
      requireAdmin(ctx);
      return getDb().collection('orders').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(500).toArray();
    },
    outboundEmails: async (_, { limit = 50 }, ctx) => {
      requireAdmin(ctx);
      return getDb()
        .collection('outbound_emails')
        .find({}, { projection: { _id: 0, html: 0, text: 0, providerResponse: 0 } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
    },
    myOrders: async (_, __, ctx) => {
      requireAuth(ctx);
      return getDb().collection('orders').find({ userId: ctx.userId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(100).toArray();
    },
    myOrder: async (_, { id }, ctx) => {
      requireAuth(ctx);
      const doc = await getDb().collection('orders').findOne({ id, userId: ctx.userId }, { projection: { _id: 0 } });
      return doc;
    },
  },

  Mutation: {
    subscribeNewsletter: async (_, { email }) => {
      const db = getDb();
      const normalized = String(email).trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(normalized)) throw new Error('Please provide a valid email.');
      const now = new Date().toISOString();
      await db.collection('subscribers').updateOne(
        { email: normalized },
        { $setOnInsert: { id: uuidv4(), email: normalized, createdAt: now } },
        { upsert: true }
      );
      return db.collection('subscribers').findOne({ email: normalized }, { projection: { _id: 0 } });
    },

    submitGiftingQuiz: async (_, { input }) => {
      const db = getDb();
      const products = await db.collection('products').find({}, { projection: { _id: 0 } }).limit(200).toArray();
      const curated = curate(products, input);
      const narrative = `For ${RECIPIENT_PHRASE[input.recipient] || 'someone dear'} — keeping in mind ${
        FEELING_PHRASE[input.feeling] || 'a devotional life'
      }.`;
      const rec = {
        id: uuidv4(),
        narrative,
        products: curated,
        createdAt: new Date().toISOString(),
        answers: input,
      };
      await db.collection('gifting_sessions').insertOne({ ...rec });
      return { id: rec.id, narrative: rec.narrative, products: rec.products, createdAt: rec.createdAt };
    },

    // ---------- Auth ----------
    requestSignInCode: async (_, { email }) => {
      const normalized = String(email).trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(normalized)) throw new Error('Please provide a valid email.');
      const code = generateCode();
      await saveCode(normalized, code);
      // TODO: send via SES/Resend in prod. For MVP, echo the code back in dev mode.
      const isDev = !process.env.EMAIL_PROVIDER;
      console.log(`[auth] sign-in code for ${normalized}: ${code}`);
      return { ok: true, devCode: isDev ? code : null };
    },

    verifySignInCode: async (_, { email, code }) => {
      const ok = await consumeCode(email, code);
      if (!ok) throw new Error('That code is not right, or has expired. Please request a new one.');
      const user = await upsertUser({ email });
      const shaped = await shapeUser(user);
      const token = issueToken(user);
      return { token, user: shaped };
    },

    signOut: async () => true, // Client discards the token; nothing to invalidate server-side in this MVP.

    // ---------- Altar ----------
    addToAltar: async (_, { productSlug }, ctx) => {
      requireAuth(ctx);
      const db = getDb();
      await db.collection('users').updateOne({ id: ctx.userId }, { $addToSet: { altar: productSlug } });
      const user = await findUserById(ctx.userId);
      return shapeUser(user);
    },
    removeFromAltar: async (_, { productSlug }, ctx) => {
      requireAuth(ctx);
      const db = getDb();
      await db.collection('users').updateOne({ id: ctx.userId }, { $pull: { altar: productSlug } });
      const user = await findUserById(ctx.userId);
      return shapeUser(user);
    },

    // ---------- Orders ----------
    createOrder: async (_, { input }, ctx) => {
      requireAuth(ctx);
      const db = getDb();
      const productSlugs = input.items.map((i) => i.productSlug);
      const products = await db.collection('products').find({ slug: { $in: productSlugs } }, { projection: { _id: 0 } }).toArray();
      const sevaTiers = await db.collection('seva_tiers').find({}, { projection: { _id: 0 } }).toArray();
      const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));

      const items = input.items.map((it) => {
        const p = bySlug[it.productSlug];
        if (!p) throw new Error(`Product not found: ${it.productSlug}`);
        const seva = it.sevaId ? sevaTiers.find((s) => s.id === it.sevaId) : null;
        const price = p.price;
        const sevaAddOn = seva?.priceAddOn || 0;
        const qty = Math.max(1, parseInt(it.qty, 10) || 1);
        return {
          productSlug: p.slug,
          productName: p.name,
          image: p.images?.[0] || null,
          price,
          qty,
          sevaName: seva?.name || null,
          sevaPriceAddOn: sevaAddOn || null,
          lineTotal: (price + sevaAddOn) * qty,
        };
      });

      const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
      const shipping = subtotal >= 5000 ? 0 : 250; // free above ₹5000
      const total = subtotal + shipping;

      const user = await findUserById(ctx.userId);
      const now = new Date().toISOString();
      const order = {
        id: uuidv4(),
        userId: ctx.userId,
        userEmail: user?.email || ctx.userEmail,
        items,
        subtotal,
        shipping,
        total,
        currency: 'INR',
        status: 'pending_payment',
        address: { country: 'India', ...input.address },
        note: input.note || null,
        events: [
          { at: now, status: 'pending_payment', message: 'Order placed. Awaiting payment confirmation.' },
        ],
        createdAt: now,
      };
      await db.collection('orders').insertOne({ ...order });

      // Fire-and-forget confirmation email
      try {
        const previewLines = items
          .map((i) => `${i.qty} \u00d7 ${i.productName}${i.sevaName ? ' + ' + i.sevaName : ''}`)
          .join('\n');
        await sendEmail({
          to: order.userEmail,
          subject: `Your Vrndavan order \u2014 ${order.id.slice(0, 8)}`,
          text: `We have received your order.\n\n${previewLines}\n\nTotal: \u20b9${total.toLocaleString('en-IN')}\n\nStatus: awaiting payment. We will write again as soon as your objects begin their journey.`,
          html: `<div style=\"font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2B2420;background:#F7F3EC;padding:40px;\">\n            <p style=\"font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#C9A15A;margin:0 0 12px;\">Order Placed</p>\n            <h1 style=\"font-family:Georgia,serif;font-weight:400;font-size:28px;color:#1B3A4B;margin:0 0 8px;\">Received, and kept.</h1>\n            <p style=\"color:#7A6B5D;margin:0 0 24px;font-size:14px;\">Order \u00b7 ${order.id.slice(0, 8)}</p>\n            ${items.map((i) => `<p style=\"margin:0 0 6px;\">${i.qty} \u00d7 <b>${i.productName}</b>${i.sevaName ? ' <span style=\"color:#C9A15A;\">+ ' + i.sevaName + '</span>' : ''}</p>`).join('')}\n            <hr style=\"border:none;border-top:1px solid #E2D8C1;margin:24px 0;\"/>\n            <p style=\"font-family:Georgia,serif;font-size:24px;color:#1B3A4B;margin:0;\">Total: \u20b9${total.toLocaleString('en-IN')}</p>\n            <p style=\"color:#7A6B5D;margin:24px 0 0;font-size:14px;\">Status: awaiting payment. We will write again as your objects begin their journey.</p>\n          </div>`,
          kind: 'order_confirmation',
        });
      } catch (_e) {}

      return order;
    },

    cancelOrder: async (_, { id }, ctx) => {
      requireAuth(ctx);
      const db = getDb();
      const order = await db.collection('orders').findOne({ id, userId: ctx.userId });
      if (!order) throw new Error('Order not found.');
      if (['shipped', 'delivered', 'cancelled'].includes(order.status)) throw new Error('This order cannot be cancelled.');
      const now = new Date().toISOString();
      await db.collection('orders').updateOne(
        { id },
        {
          $set: { status: 'cancelled' },
          $push: { events: { at: now, status: 'cancelled', message: 'Cancelled by the devotee.' } },
        }
      );
      return db.collection('orders').findOne({ id }, { projection: { _id: 0 } });
    },

    setOrderStatus: async (_, { id, status, message }, ctx) => {
      requireAdmin(ctx);
      const db = getDb();
      const now = new Date().toISOString();
      await db.collection('orders').updateOne(
        { id },
        {
          $set: { status },
          $push: { events: { at: now, status, message: message || null } },
        }
      );
      return db.collection('orders').findOne({ id }, { projection: { _id: 0 } });
    },

    sendEkadashiRemindersNow: async (_, { force = true }, ctx) => {
      requireAdmin(ctx);
      const r = await sendEkadashiReminders({ force });
      return {
        sent: r.sent,
        festivalName: r.festival?.name || null,
        festivalDate: r.festival?.date || null,
        reason: r.reason || null,
      };
    },

    // ---------- Admin ----------
    upsertProduct: async (_, { input }, ctx) => {
      requireAdmin(ctx);
      const db = getDb();
      const doc = {
        id: 'p-' + input.slug,
        slug: input.slug,
        name: input.name,
        subtitle: input.subtitle || '',
        devotionalContext: input.devotionalContext || '',
        price: input.price,
        currency: input.currency || 'INR',
        images: input.images,
        category: input.category,
        sampradaya: input.sampradaya,
        material: input.material || '',
        sourcingStory: input.sourcingStory || '',
        inventory: input.inventory,
        authenticity: {
          materialOrigin: input.materialOrigin || '',
          verifiedBy: input.verifiedBy || '',
        },
      };
      await db.collection('products').updateOne({ slug: input.slug }, { $set: doc }, { upsert: true });
      return db.collection('products').findOne({ slug: input.slug }, { projection: { _id: 0 } });
    },
    deleteProduct: async (_, { slug }, ctx) => {
      requireAdmin(ctx);
      const res = await getDb().collection('products').deleteOne({ slug });
      return res.deletedCount > 0;
    },

    upsertArticle: async (_, { input }, ctx) => {
      requireAdmin(ctx);
      const db = getDb();
      await db.collection('articles').updateOne({ slug: input.slug }, { $set: input }, { upsert: true });
      return db.collection('articles').findOne({ slug: input.slug }, { projection: { _id: 0 } });
    },
    deleteArticle: async (_, { slug }, ctx) => {
      requireAdmin(ctx);
      const res = await getDb().collection('articles').deleteOne({ slug });
      return res.deletedCount > 0;
    },

    upsertFestival: async (_, { input }, ctx) => {
      requireAdmin(ctx);
      const db = getDb();
      await db.collection('festivals').updateOne(
        { date: input.date, name: input.name },
        { $set: input },
        { upsert: true }
      );
      return db.collection('festivals').findOne({ date: input.date, name: input.name }, { projection: { _id: 0 } });
    },
    deleteFestival: async (_, { date, name }, ctx) => {
      requireAdmin(ctx);
      const res = await getDb().collection('festivals').deleteOne({ date, name });
      return res.deletedCount > 0;
    },
  },
};

module.exports = { resolvers };
