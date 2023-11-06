const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');

describe('API Tests', () => {
  it('GET / should return "Hello World!"', async () => {
    const res = await request(app).get('/hello');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('Hello World!');
  });
});
// describe('Basic Server Tests', () => {
//   it('should return a 200 status code for GET /', (done) => {
//     request(app)
//       .get('/')
//       .expect(200, done);
//   });
// });
describe('Basic Server Tests', () => {
  it('should return a 404 status code for invalid routes', async () => {
    const res = await request(app).get('/invalid-route');
    expect(res.statusCode).toEqual(404);
  });
});

describe('PUT Tests', () => {
  it('put / should return "put hear!"', async () => {
    const res = await request(app).put('/put');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('put hear!');
  });
});
// Close the database connection after all tests have run
afterAll(async () => {
  await mongoose.connection.close();
});