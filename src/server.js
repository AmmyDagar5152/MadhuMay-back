'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');

const { connect } = require('./db');
const { seedIfEmpty } = require('./seed');
const { typeDefs } = require('./schema/typeDefs');
const { resolvers } = require('./schema/resolvers');
const { contextFromRequest, issueToken, upsertUser } = require('./auth');
const remindersScheduler = require('./reminders');

async function main() {
  await connect();
  await seedIfEmpty();
  remindersScheduler.start();

  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: process.env.CORS_ORIGINS || '*' }));

  const apollo = new ApolloServer({ typeDefs, resolvers, introspection: true });
  await apollo.start();

  app.use(
    '/api/graphql',
    bodyParser.json({ limit: '2mb' }),
    expressMiddleware(apollo, {
      context: async ({ req }) => contextFromRequest(req),
    })
  );

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'vrndavan-backend', ts: new Date().toISOString() });
  });

  // -------- Google OAuth --------
  // If GOOGLE_CLIENT_ID / SECRET / REDIRECT_URI are configured, this flow works.
  // Otherwise the endpoints respond with a helpful message.
  const googleConfigured =
    !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET && !!process.env.GOOGLE_REDIRECT_URI;

  app.get('/api/auth/google/status', (_req, res) => {
    res.json({ configured: googleConfigured });
  });

  app.get('/api/auth/google/start', (_req, res) => {
    if (!googleConfigured) {
      return res.status(503).send(
        'Google Sign-In not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI in backend/.env, then restart the backend.'
      );
    }
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account',
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    if (!googleConfigured) return res.status(503).send('Google Sign-In not configured.');
    const code = req.query.code;
    if (!code) return res.status(400).send('Missing code');
    try {
      // Exchange code for tokens
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });
      const tokens = await tokenRes.json();
      if (!tokens.access_token) throw new Error(tokens.error_description || 'No access token');

      // Fetch user profile
      const uRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const profile = await uRes.json();

      const user = await upsertUser({
        email: profile.email,
        name: profile.name || profile.given_name || null,
        provider: 'google',
      });
      const token = issueToken(user);

      const front =
        process.env.FRONTEND_URL ||
        (req.headers['x-forwarded-host']
          ? `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host']}`
          : `${req.protocol}://${req.get('host')}`);
      res.redirect(`${front}/account/callback?token=${encodeURIComponent(token)}`);
    } catch (err) {
      console.error('[google-oauth] error:', err);
      res.status(500).send('Google sign-in failed. Please try again.');
    }
  });

  app.get('/', (_req, res) => {
    res.type('text').send('Vrndavan backend · POST GraphQL queries to /api/graphql');
  });

  const port = parseInt(process.env.BACKEND_PORT || '8001', 10);
  app.listen(port, '0.0.0.0', () => {
    console.log(`[backend] listening on http://0.0.0.0:${port}`);
    console.log(`[backend] GraphQL:   http://0.0.0.0:${port}/api/graphql`);
    console.log(`[backend] Google OAuth: ${googleConfigured ? 'configured' : 'NOT configured (set env vars to enable)'}`);
  });
}

main().catch((err) => {
  console.error('[backend] fatal:', err);
  process.exit(1);
});
