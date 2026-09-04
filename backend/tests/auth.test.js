/**
 * tests/auth.test.js
 * Tests for user authentication endpoints:
 *   POST /api/users/register
 *   POST /api/users/login
 *   GET  /api/users/profile  (protected)
 */

const request = require('supertest');
const app = require('../app');

// ── Fixtures ──────────────────────────────────────────────────────────────────
const validUser = {
  username: 'Test User',
  email: 'testuser@example.com',
  password: 'password123',
  role: 'user',
};

const adminUser = {
  username: 'Admin',
  email: 'admin@example.com',
  password: 'adminpass123',
  role: 'admin',
};

// ── Register ──────────────────────────────────────────────────────────────────
describe('POST /api/users/register', () => {
  it('should register a new user and return a JWT token', async () => {
    const res = await request(app).post('/api/users/register').send(validUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({
      username: validUser.username,
      email: validUser.email,
      role: 'user',
    });
    // Password should never be returned
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ email: 'incomplete@example.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should return 400 for an invalid email format', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ ...validUser, email: 'not-an-email' });

    expect(res.statusCode).toBe(400);
  });

  it('should return 409 if email already exists', async () => {
    // Register once
    await request(app).post('/api/users/register').send(validUser);
    // Register again with same email
    const res = await request(app).post('/api/users/register').send(validUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────
describe('POST /api/users/login', () => {
  beforeEach(async () => {
    // Seed a user before each login test
    await request(app).post('/api/users/register').send(validUser);
  });

  it('should log in with correct credentials and return a JWT', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: validUser.email, password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.statusCode).toBe(401);
  });

  it('should return 400 if email or password is missing', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: validUser.email });

    expect(res.statusCode).toBe(400);
  });
});

// ── Profile (protected) ───────────────────────────────────────────────────────
describe('GET /api/users/profile', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/users/register').send(validUser);
    token = res.body.token;
  });

  it('should return profile for authenticated user', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(validUser.email);
    expect(res.body).not.toHaveProperty('password');
  });

  it('should return 401 without a token', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.statusCode).toBe(401);
  });

  it('should return 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.statusCode).toBe(401);
  });
});
