const mongoose = require('mongoose');

const requestSchema = mongoose.Schema({
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNo: {
        type: Number,
        required: true
    },
    Date: {
        type: Date,
        default: Date.now,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approve', 'cancel'],
        default: 'pending'
    }
});

module.exports = mongoose.model('RequestCar', requestSchema);
