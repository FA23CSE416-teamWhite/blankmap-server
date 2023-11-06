const request = require('supertest');
const app = require('../index');

describe('Routes Tests', () => {
  it('GET /api should return a JSON response', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  });
});