/**
 * tests/setup.js
 * Jest global setup/teardown using mongodb-memory-server.
 * Spins up an in-memory MongoDB instance so tests need no
 * external database — they run anywhere, including CI.
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

// ── Start in-memory MongoDB before all tests ──────────────────────────────────
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}, 60000); // allow up to 60s for binary download on first run

// ── Clean all collections between each test ───────────────────────────────────
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ── Stop server and disconnect after all tests ────────────────────────────────
afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}, 30000);
