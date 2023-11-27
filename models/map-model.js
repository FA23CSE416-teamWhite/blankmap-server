const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mapSchema = new Schema({
    addedFeatures: {
        type: [{ type: Schema.Types.Mixed }], // no set type yet, just an array of mixed types
        required: true,
    },
    baseData: {
        type: Buffer, // no set type yet
        required: true,
    },
    mapType: {
        type: String, 
        required: true,
    },
})

const Map = mongoose.model('Map', mapSchema); // Define the model directly here

module.exports = Map;
