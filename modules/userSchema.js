const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phoneNo: Number,
  imageUrl: String,
  verified: {
    type: Boolean,
    default: false,
    required: true,
  },
  password: String, 
  name: String,
  provider: { 
    type: String, 
    enum: ['email', 'google'], 
    required: true 
  },
  googleId: String, 
  carRequest : [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RequestCar'
    }
  ]
});

const User = mongoose.model('users', userSchema);
module.exports = User;
