// import mongoose from 'mongoose';
const mongoose = require("mongoose");
var FeatureSchema = mongoose.Schema({
  data: {
    geometry: {
      type: {
        type: String,
        default: "Point"
      },
      coordinates: [Number]
    },
    properties: {
      id: Number,
      price: Number,
      street: String,
      bedrooms: Number,
      bathrooms: Number,
      sq_ft: Number
    }
  }
});

module.exports = mongoose.model('Feature', FeatureSchema);
