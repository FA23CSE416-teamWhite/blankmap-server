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
    origin: 'http://localhost:3000',
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  }));
app.use(express.json());
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
app.post('/api/users', async (req, res) => {
    const { name, email } = req.body;
    console.log(req.body);
    const newUser = new User({
        name: name,
        email: email
    });

    newUser.save()
        .then(() => {
            console.log("Account created successfully");
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

