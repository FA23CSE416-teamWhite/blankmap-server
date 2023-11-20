const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId

const commentSchema = new Schema({
    commenter: {
        type: ObjectId,
        ref: 'User',
        required: true,
    },
    commentId: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        required: true
    },
    dislikes: {
        type: Number,
        required: true
    },
    replies: {
        type: ObjectId,
        ref: 'Comment'
    },
})
module.exports = mongoose.model("Comment", commentSchema, "comments")