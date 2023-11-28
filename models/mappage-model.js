const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const MapPageSchema = new mongoose.Schema({
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
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

  mapId: {
    type: Number,
    required: [true, 'Map ID is required'],
    unique: true,
  }, // Id number of this map

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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
      required: [true, 'At least one tag is required'],
    },
  ], // Tags of map indicating the general kind of map

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
MapPageSchema.plugin(AutoIncrement, { id: 'mapId_seq', inc_field: 'mapId' });
const MapPage = mongoose.model('MapPage', MapPageSchema); // Define the model directly here

module.exports = MapPage;