const request = require('supertest');
const app = require('../index');

describe('API Tests', () => {
  it('GET / should return "Hello World!"', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('Hello World!');
  });
});
describe('Basic Server Tests', () => {
  it('should return a 200 status code for GET /', (done) => {
    request(app)
      .get('/')
      .expect(200, done);
  });
});
describe('Basic Server Tests', () => {
  it('should return a 404 status code for invalid routes', (done) => {
    request(app)
      .get('/invalid-route')
      .expect(404, done);
  });
});