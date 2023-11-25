const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId

const userSchema = new Schema({
    firstName: {
        type: String, 
        required: true 
    },
    lastName: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    userName: { 
        type: String, 
        required: true
    },
    passwordHash: { 
        type: String, 
        required: true 
    },
    
    recoveryQuestion: {
        type: String, 
        required: true 
    },
    recoveryAnswer: {
        type: String, 
        required: true 
    },
    maps: [{
        type: ObjectId, 
        ref: 'MapPage'
    }],
    dateJoined: {
        type: Date, 
        default: Date.now
    },
    phone: {
        type: String, 
        default: null
    },
    bio: {
        type: String, 
        default: null
    }
})
module.exports = mongoose.model("User", userSchema, "users")