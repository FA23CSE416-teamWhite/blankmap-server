const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose
    .connect('mongodb+srv://SkyLei:<password>@cluster0.mongodb.net/<dbname>', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((e) => {
        console.error('Connection error', e.message);
    });

const db = mongoose.connection;

module.exports = db;
