/**
 * tests/health.test.js
 * Basic smoke tests for the API health check and 404 handling.
 */

const request = require('supertest');
const app = require('../app');

describe('API Health', () => {
  it('GET / should return 200 with status OK', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ status: 'OK' });
    expect(res.body.message).toMatch(/running/i);
  });

  it('Unknown route should return 404', async () => {
    const res = await request(app).get('/api/doesnotexist');
    expect(res.statusCode).toBe(404);
  });

  it('Should return JSON content-type on error responses', async () => {
    const res = await request(app).get('/api/doesnotexist');
    expect(res.headers['content-type']).toMatch(/json/);
  });
});
