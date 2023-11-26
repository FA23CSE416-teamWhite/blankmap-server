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
    privateMaps:[{
        type: ObjectId, 
        ref: 'Map'
    }],
    publicMaps:[{
        type: ObjectId, 
        ref: 'Map'
    }],
    comments: [{
        type: ObjectId, 
        ref: 'Comment'
    }],
    profilePicture:String,
    dateJoined: {
        type: Date, 
        default: Date.now
    },
    phone: String,
    bio: {
        type: String, 
        default: "Enter a Bio"
    },
    userType:{
        type:String,
        default:"registered"
    }
})
module.exports = mongoose.model("User", userSchema, "users")