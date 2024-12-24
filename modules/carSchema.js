const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mileage: { type: Number, required: true },
  transmission: { type: String, enum: ['Manual', 'Automatic'], required: true },
  seats: { type: Number, required: true },
  fuel: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], required: true },
  image: { type: String, required: true },
  thumbnail: { type: String},
  pricePerDay: {type: Number},
  path: String,
  features: {
    airConditioning: { type: Boolean, default: false },
    luggage: { type: Boolean, default: false },
    music: { type: Boolean, default: false },
    seatBelt: { type: Boolean, default: false },
    bluetooth: { type: Boolean, default: false },
    audioInput: { type: Boolean, default: false },
    longTermTrips: { type: Boolean, default: false },
    carKit: { type: Boolean, default: false },
    remoteCentralLocking: { type: Boolean, default: false },
    climateControl: { type: Boolean, default: false },
    frontSensors: {type: Boolean, default: false},
    backCamera : {type: Boolean, default: false}
  },
}, { timestamps: true });

const Car = mongoose.model('Car', carSchema);

module.exports = Car;