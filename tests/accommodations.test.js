/**
 * tests/accommodations.test.js
 * Tests for accommodation CRUD endpoints:
 *   GET    /api/accommodations
 *   GET    /api/accommodations/:id
 *   POST   /api/accommodations   (protected)
 *   PUT    /api/accommodations/:id (protected)
 *   DELETE /api/accommodations/:id (protected)
 */

const request = require('supertest');
const app = require('../app');

// ── Helpers ───────────────────────────────────────────────────────────────────
const registerAndLogin = async (role = 'host') => {
  const user = {
    username: `Test ${role}`,
    email: `${role}${Date.now()}@example.com`,
    password: 'password123',
    role,
  };
  const res = await request(app).post('/api/users/register').send(user);
  return { token: res.body.token, user: res.body.user };
};

const validListing = {
  title: 'Beautiful Beach House',
  location: 'Cape Town',
  description: 'A stunning beach house with ocean views.',
  type: 'Beach house',
  price: 250,
  guests: 4,
  bedrooms: 2,
  bathrooms: 1,
  amenities: ['WiFi', 'Pool'],
  cleaningFee: 40,
  serviceFee: 30,
  occupancyTaxes: 20,
};

// ── GET all ───────────────────────────────────────────────────────────────────
describe('GET /api/accommodations', () => {
  it('should return an object with accommodations array and pagination', async () => {
    const res = await request(app).get('/api/accommodations');

    expect(res.statusCode).toBe(200);
    // API returns { accommodations: [], pagination: {} }
    expect(res.body).toHaveProperty('accommodations');
    expect(Array.isArray(res.body.accommodations)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('should filter by location query param', async () => {
    const { token } = await registerAndLogin('host');
    // Create a listing in New York
    await request(app)
      .post('/api/accommodations')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validListing, location: 'New York' });

    const res = await request(app).get('/api/accommodations?location=New York');
    expect(res.statusCode).toBe(200);
    const listings = res.body.accommodations || res.body;
    const arr = Array.isArray(listings) ? listings : listings.accommodations;
    expect(arr.every((l) => l.location.toLowerCase().includes('new york'))).toBe(true);
  });

  it('should support pagination via page and limit params', async () => {
    const res = await request(app).get('/api/accommodations?page=1&limit=5');
    expect(res.statusCode).toBe(200);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 5 });
  });
});

// ── GET by ID ─────────────────────────────────────────────────────────────────
describe('GET /api/accommodations/:id', () => {
  let listingId;
  let token;

  beforeEach(async () => {
    const auth = await registerAndLogin('host');
    token = auth.token;
    const res = await request(app)
      .post('/api/accommodations')
      .set('Authorization', `Bearer ${token}`)
      .send(validListing);
    listingId = res.body.accommodation._id;
  });

  it('should return a single accommodation by valid ID', async () => {
    const res = await request(app).get(`/api/accommodations/${listingId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(listingId);
    expect(res.body.title).toBe(validListing.title);
  });

  it('should return 400 for an invalid ID format', async () => {
    const res = await request(app).get('/api/accommodations/invalid-id-format');
    expect(res.statusCode).toBe(400);
  });

  it('should return 404 for a valid but non-existent ID', async () => {
    const res = await request(app).get('/api/accommodations/507f1f77bcf86cd799439011');
    expect(res.statusCode).toBe(404);
  });
});

// ── POST (create) ─────────────────────────────────────────────────────────────
describe('POST /api/accommodations', () => {
  let token;

  beforeEach(async () => {
    const auth = await registerAndLogin('host');
    token = auth.token;
  });

  it('should create a new accommodation when authenticated', async () => {
    const res = await request(app)
      .post('/api/accommodations')
      .set('Authorization', `Bearer ${token}`)
      .send(validListing);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('accommodation');
    expect(res.body.accommodation.title).toBe(validListing.title);
    expect(res.body.accommodation.location).toBe(validListing.location);
    expect(res.body.accommodation.price).toBe(validListing.price);
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/accommodations')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Incomplete Listing' }); // missing location, description, type, price

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should return 401 without authentication', async () => {
    const res = await request(app)
      .post('/api/accommodations')
      .send(validListing);

    expect(res.statusCode).toBe(401);
  });
});

// ── PUT (update) ──────────────────────────────────────────────────────────────
describe('PUT /api/accommodations/:id', () => {
  let token;
  let listingId;

  beforeEach(async () => {
    const auth = await registerAndLogin('host');
    token = auth.token;
    const res = await request(app)
      .post('/api/accommodations')
      .set('Authorization', `Bearer ${token}`)
      .send(validListing);
    listingId = res.body.accommodation._id;
  });

  it('should update a listing when authenticated', async () => {
    const updates = { title: 'Updated Beach House', price: 300 };
    const res = await request(app)
      .put(`/api/accommodations/${listingId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(res.statusCode).toBe(200);
    expect(res.body.accommodation.title).toBe(updates.title);
    expect(res.body.accommodation.price).toBe(updates.price);
  });

  it('should return 401 without a token', async () => {
    const res = await request(app)
      .put(`/api/accommodations/${listingId}`)
      .send({ title: 'Hacked' });

    expect(res.statusCode).toBe(401);
  });

  it('should return 404 for a non-existent listing ID', async () => {
    const res = await request(app)
      .put('/api/accommodations/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Ghost' });

    expect(res.statusCode).toBe(404);
  });
});

// ── DELETE ────────────────────────────────────────────────────────────────────
describe('DELETE /api/accommodations/:id', () => {
  let token;
  let listingId;

  beforeEach(async () => {
    const auth = await registerAndLogin('host');
    token = auth.token;
    const res = await request(app)
      .post('/api/accommodations')
      .set('Authorization', `Bearer ${token}`)
      .send(validListing);
    listingId = res.body.accommodation._id;
  });

  it('should delete an accommodation when authenticated', async () => {
    const res = await request(app)
      .delete(`/api/accommodations/${listingId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('should return 404 after deletion when trying to GET it', async () => {
    await request(app)
      .delete(`/api/accommodations/${listingId}`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app).get(`/api/accommodations/${listingId}`);
    expect(res.statusCode).toBe(404);
  });

  it('should return 401 without a token', async () => {
    const res = await request(app).delete(`/api/accommodations/${listingId}`);
    expect(res.statusCode).toBe(401);
  });
});
