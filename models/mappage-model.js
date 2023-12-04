const mongoose = require('mongoose');
const MapPageSchema = new mongoose.Schema({
  comments: [
    // {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Comment',
    // },
    {
      commenter: {
          type: String, // Assuming commenter's name or identifier is a string
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
      replies: [], // Array of replies (each reply can be an object with similar properties)
    }
  ], // Array of comments on this map

  creationDate: {
    type: Date,
    default: Date.now,
  }, // Map creation date

  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: 1,
  }, // Description of the map

  lastModified: {
    type: Date,
  }, // Date that the map was previously modified

  map: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Map',
    required: [true, 'Map data is required'],
  }, // Actual map data

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
  }, // User that created this map

  publicStatus: {
    type: Boolean,
    default: false,
  }, // Is this map public or private

  tags: [
    {
      type: String,
      required: [true, 'At least one tag is required'],
    },
  ],

  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: 1,
  }, // Name of this map

  upvotes: {
    type: Number,
    default: 0,
  }, // Number of upvotes

  downvotes: {
    type: Number,
    default: 0,
  }, // Number of downvotes
});
const MapPage = mongoose.model('MapPage', MapPageSchema); // Define the model directly here

module.exports = MapPage;