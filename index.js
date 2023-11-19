const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path')
const PORT = process.env.PORT || 8000;
const app = express();
const User = require('./models/user');
require('./db/database');

// app.use(bodyParser.json());
app.use(cors({
    origin: ['http://localhost:3000', 'https://blankmap-front-1626f242c2d7.herokuapp.com'],
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true
  }));
app.use(express.json());
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
  
app.post('/api/users', async (req, res) => {
    const { name, email } = req.body;
    console.log(req.body);
    const newUser = new User(req.body);

    newUser.save()
        .then(() => {
            console.log("Account created successfully", newUser);
            res.json({
                message: "Created account successfully"
            });
        })
        .catch(err => {
            console.error("Error creating account:", err);
            res.status(400).json({
                error: err,
                message: "Error creating account"
            });
        });
});
app.get('/api/users', (req, res) => {
    User.findOne(req.query)
        .then((found) => {
            if(found){
              res.send(found);
            }else{
              res.json({
                success: false,
                error: "No document found"
              }, 400)
            }
        }
      )
        .catch(err => console.log(err))
})

app.put('/api/users', (req, res) => {
  console.log(req)
  User.updateOne(req.query,req.body)
      .then(res.send("success"))
      .catch(err => console.log(err))
})

app.get('/hello', (req, res) => {
    res.send('Hello World!');
  });

app.put('/put', (req, res) => {
    res.send('put hear!');
});
  
module.exports = app;