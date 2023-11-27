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

describe('Basic GET Tests', () => {
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
describe('Basic Invalid Tests', () => {
  it('GET should return a 404 status code for invalid routes', async () => {
    const res = await request(app).get('/invalid-route');
    expect(res.statusCode).toEqual(404);
  });
});

describe('Basic PUT Tests', () => {
  it('PUT / should return "put hear!"', async () => {
    const res = await request(app).put('/put');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('put hear!');
  });
});

describe('Basic get question test', () => {
  it('get /question:email should return 401, no user foundy', async () => {
    const res = await request(app).get('/auth/question/fakeEmaikl');
    expect(res.statusCode).toEqual(401);
    expect(res.body.errorMessage).toEqual("No user found.");
  });
});
describe('Basic update test', () => {
  it('get /update should return 404, you must provide a body', async () => {
    const res = await request(app).post('/auth/update');
    expect(res.statusCode).toEqual(404);
    expect(res.body.errorMessage).toEqual("User not updated!");
  });
});
// describe('Map POST Tests', () => {
//   it('POST /api/map/createMap should return a 201 status code', async () => {
//     const newMapData = {
//       title: 'JEST Example Map',
//       description: 'This is an example map.',
//       publicStatus: true,
//       selectedCategory: 'choropleth',
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

describe("Logout Tests", () => {
  it("GET /auth/logout should return a 200 status code", async () => {
    const res = await request(app).get("/auth/logout").set("Cookie", cookie);
    expect(res.statusCode).toEqual(200);
  });
});

describe("Get logged in user", () => {
  it("GET /auth/user should return a 200 status code", async () => {
    const res = await request(app).get("/auth/loggedIn").set("Cookie", cookie);
    console.log(res.body.loggedIn);
    expect(res.body.loggedIn).toEqual(true);
    expect(res.statusCode).toEqual(200);
  });
});

describe("Post User Repeat Registration", () => {
  it("POST /auth/register should return a 400 status code with already exist message", async () => {
    const newUser = {
      firstName: "jest",
      lastName: "jest",
      email: "jest@jest",
      userName: "testUser",
      password: "12345678",
      passwordVerify: "12345678",
      recoveryQuestion: "What is your favorite color?",
      recoveryAnswer: "blue",
    };
    const res = await request(app).post("/auth/register").send(newUser);
    expect(res.body.errorMessage).toEqual("An account with this email address already exists.");
    expect(res.statusCode).toEqual(400);
  }
  );
}
);


afterAll(async () => {
  await mongoose.connection.close();
});