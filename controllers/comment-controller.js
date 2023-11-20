const Comment = require('../models/comment-model'); 
const User = require('../models/user-model');
const auth = require('../auth')

// GET all comments
getComments = async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST a new comment
postComments = async (req, res) => {
  const comment = new Comment({
    commenter: req.body.commenter,
    commentId: req.body.commentId,
    content: req.body.content,
    likes: req.body.likes,
    dislikes: req.body.dislikes,
  });

  try {
    const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET a specific comment by ID
getCommentById = async (req, res) => {
  res.json(res.comment);
};

// Middleware function to get a specific comment by ID
async function getComment(req, res, next) {
  let comment;
  try {
    comment = await Comment.findById(req.params.id);
    if (comment == null) {
      return res.status(404).json({ message: 'Comment not found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.comment = comment;
  next();
}

// DELETE a comment
deleteComment =  async (req, res) => {
  try {
    await res.comment.remove();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getComments,
  postComments,
  getCommentById,
  deleteComment,
}