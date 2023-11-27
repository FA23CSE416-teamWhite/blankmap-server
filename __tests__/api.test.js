const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
let cookie;
let userId;
beforeAll(async () => {
  // Perform a login to get a JWT token
  const response = await request(app)
    .post('/auth/login')
    .send({
      userName: 'test3',
      password: '12345678',
    });
    expect(response.status).toBe(200);
    // console.log(response.status);
  // token = response.body.token;
  cookie = response.headers['set-cookie'];
  userId = response.body.userId;
  // console.log(response)
});
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

// describe('Map POST Tests', () => {
//   it('POST /api/map/createMap should return a 201 status code', async () => {
//     const newMapData = {
//       title: 'Example Map',
//       description: 'This is an example map.',
//       publicStatus: true,
//       tags: ['tag1', 'tag2'],
//       file: 'https://datavizcatalogue.com/methods/images/top_images/choropleth.png',
//     };
//     const res = await request(app).post('/api/map/createMap').set('Cookie', cookie).send(newMapData);
//     expect(res.statusCode).toEqual(201);
//   });
// });

describe('Get Maps tests', () => {
  it('GET /api/map should return a 200 status code', async () => {
    const res = await request(app).get('/api/map/maps?q=""');
    expect(res.statusCode).toEqual(200);
  });
}); 

afterAll(async () => {
  await mongoose.connection.close();
});