const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

const PORT = process.env.PORT || 8000;
const app = express();

require('./db/database');

// app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000',
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())
const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
process.on("SIGINT", () => {
    mongoose.connection.close(() => {
      console.log("Server closed. Database instance disconnected.");
      server.close(() => {
        console.log("Server closed.");
        process.exit(0);
      });
    });
  });

// SETUP OUR OWN ROUTERS AS MIDDLEWARE
const authRouter = require('./routes/auth-router')
app.use('/auth', authRouter)
// const mapRouter = require('./routes/map-router')
// app.use('/api/map', mapRouter)

//NOTE: These aren't written yet

// const commentRouter = require('./routes/comment-router.js')
// app.use('/api/comment', commentRouter)
// const mapRouter = require('./routes/map-router')
// app.use('/api/map', mapRouter)

// app.post('/api/users', async (req, res) => {
//     const { name, email } = req.body;
//     console.log(req.body);
//     const newUser = new User({
//         name: name,
//         email: email
//     });
//     newUser.save()
//         .then(() => {
//             console.log("Account created successfully");
//             res.json({
//                 message: "Created account successfully"
//             });
//         })
//         .catch(err => {
//             console.error("Error creating account:", err);
//             res.status(400).json({
//                 error: err,
//                 message: "Error creating account"
//             });
//         });
// });
// app.get('/api/users', (req, res) => {
//     User.find()
//         .then(users => res.json(users))
//         .catch(err => console.log(err))
// })

app.get('/hello', (req, res) => {
    res.send('Hello World!');
  });

app.put('/put', (req, res) => {
    res.send('put hear!');
});
  
module.exports = app;