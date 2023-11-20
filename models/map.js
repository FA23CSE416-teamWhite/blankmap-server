const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mapSchema = new Schema({
    addedFeatures: {
        type: [{ type: Schema.Types.Mixed }], // no set type yet, just an array of mixed types
        required: true,
    },
    baseData: {
        type: Schema.Types.Mixed, // no set type yet
        required: true,
    },
    mapType: {
        type: String, 
        required: true,
    },
})
module.exports = mongoose.model("Map", mapSchema, "maps")