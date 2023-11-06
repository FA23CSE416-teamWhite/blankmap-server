const request = require('supertest');
const app = require('../index');

describe('API Tests', () => {
  it('GET / should return "Hello World!"', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('Hello World!');
  });
});