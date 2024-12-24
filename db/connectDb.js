require('dotenv').config();
const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        await mongoose.connect(`${process.env.DATA_BASE}/smart-drive`);
        console.log("Data-Base connected successfully");
    } catch (err) {
        console.error("Database connection error:", err);
    }
};

module.exports = connectDb;
