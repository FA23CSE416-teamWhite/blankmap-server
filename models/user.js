const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
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
    comments:{
        type: Array,
        default:[]
    },
    dataJoined:{
        type: Date,
        default: Date()
    },
    privateMaps:{
        type: Array,
        default:[]
    },
    publicMaps:{
        type: Array,
        default:[]
    },
    profilePicture:{
        type: String,
        default:""
    },
    userId:{
        type:Number,
        default:0
    },
    userType:{
        type:String,
        default:"registered"
    }


})
module.exports = mongoose.model("User", userSchema, "users")