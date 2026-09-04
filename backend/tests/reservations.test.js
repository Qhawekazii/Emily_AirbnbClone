/**
 * tests/reservations.test.js
 * Tests for reservation CRUD endpoints:
 *   POST   /api/reservations          (protected)
 *   GET    /api/reservations/host     (protected)
 *   GET    /api/reservations/user     (protected)
 *   DELETE /api/reservations/:id      (protected)
 */

const request = require('supertest');
const app = require('../app');

// ── Helpers ───────────────────────────────────────────────────────────────────
const registerAndLogin = async (role = 'user', suffix = '') => {
  const res = await request(app).post('/api/users/register').send({
    username: `Test ${role} ${suffix}`,
    email: `${role}${suffix}${Date.now()}@example.com`,
    password: 'password123',
    role,
  });
  return { token: res.body.token, user: res.body.user };
};

const createListing = async (token) => {
  const res = await request(app)
    .post('/api/accommodations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Test Apartment',
      location: 'New York',
      description: 'A nice place to stay.',
      type: 'Entire apartment',
      price: 150,
      guests: 4,
      bedrooms: 2,
      bathrooms: 1,
      cleaningFee: 25,
      serviceFee: 20,
      occupancyTaxes: 15,
    });
  return res.body.accommodation;
};

// ── Create Reservation ────────────────────────────────────────────────────────
describe('POST /api/reservations', () => {
  let guestToken;
  let listingId;

  beforeEach(async () => {
    const host = await registerAndLogin('host', 'h');
    const guest = await registerAndLogin('user', 'g');
    guestToken = guest.token;
    const listing = await createListing(host.token);
    listingId = listing._id;
  });

  it('should create a reservation for an authenticated user', async () => {
    const checkIn = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ accommodation: listingId, checkIn, checkOut, guests: 2 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('reservation');
    expect(res.body.reservation.nights).toBe(6);
    expect(res.body.reservation.totalCost).toBeGreaterThan(0);
  });

  it('should return 400 if check-out is before check-in', async () => {
    const checkIn = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ accommodation: listingId, checkIn, checkOut, guests: 1 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/check-out/i);
  });

  it('should return 400 if guests exceeds listing maximum', async () => {
    const checkIn = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ accommodation: listingId, checkIn, checkOut, guests: 99 }); // listing max is 4

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/maximum/i);
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ accommodation: listingId }); // missing checkIn/checkOut/guests

    expect(res.statusCode).toBe(400);
  });

  it('should return 401 without authentication', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send({ accommodation: listingId, guests: 1 });

    expect(res.statusCode).toBe(401);
  });

  it('should return 404 for a non-existent accommodation', async () => {
    const checkIn = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        accommodation: '507f1f77bcf86cd799439011',
        checkIn, checkOut, guests: 1,
      });

    expect(res.statusCode).toBe(404);
  });
});

// ── Get by User ───────────────────────────────────────────────────────────────
describe('GET /api/reservations/user', () => {
  let guestToken;
  let listingId;

  beforeEach(async () => {
    const host = await registerAndLogin('host', 'h2');
    const guest = await registerAndLogin('user', 'g2');
    guestToken = guest.token;
    const listing = await createListing(host.token);
    listingId = listing._id;

    // Create a reservation
    const checkIn = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0];
    await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ accommodation: listingId, checkIn, checkOut, guests: 1 });
  });

  it('should return reservations for the authenticated user', async () => {
    const res = await request(app)
      .get('/api/reservations/user')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should return 401 without a token', async () => {
    const res = await request(app).get('/api/reservations/user');
    expect(res.statusCode).toBe(401);
  });
});

// ── Get by Host ───────────────────────────────────────────────────────────────
describe('GET /api/reservations/host', () => {
  let hostToken;

  beforeEach(async () => {
    const host = await registerAndLogin('host', 'h3');
    hostToken = host.token;
    const listing = await createListing(hostToken);

    const guest = await registerAndLogin('user', 'g3');
    const checkIn = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
    await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guest.token}`)
      .send({ accommodation: listing._id, checkIn, checkOut, guests: 1 });
  });

  it('should return all reservations for the host listings', async () => {
    const res = await request(app)
      .get('/api/reservations/host')
      .set('Authorization', `Bearer ${hostToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should return 401 without a token', async () => {
    const res = await request(app).get('/api/reservations/host');
    expect(res.statusCode).toBe(401);
  });
});

// ── Delete Reservation ────────────────────────────────────────────────────────
describe('DELETE /api/reservations/:id', () => {
  let guestToken;
  let reservationId;

  beforeEach(async () => {
    const host = await registerAndLogin('host', 'h4');
    const guest = await registerAndLogin('user', 'g4');
    guestToken = guest.token;
    const listing = await createListing(host.token);

    const checkIn = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ accommodation: listing._id, checkIn, checkOut, guests: 1 });

    reservationId = res.body.reservation._id;
  });

  it('should cancel a reservation when authenticated as the owner', async () => {
    const res = await request(app)
      .delete(`/api/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/cancelled/i);
  });

  it('should return 403 when another user tries to cancel', async () => {
    const other = await registerAndLogin('user', 'other');
    const res = await request(app)
      .delete(`/api/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${other.token}`);

    expect(res.statusCode).toBe(403);
  });

  it('should return 401 without a token', async () => {
    const res = await request(app).delete(`/api/reservations/${reservationId}`);
    expect(res.statusCode).toBe(401);
  });

  it('should return 404 for already-deleted reservation', async () => {
    // Delete once
    await request(app)
      .delete(`/api/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${guestToken}`);
    // Try to delete again
    const res = await request(app)
      .delete(`/api/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.statusCode).toBe(404);
  });
});
