const express = require('express');
const { model } = require('mongoose');
const api = express.Router();
const authRouter = require('../router/authRouter');

api.use('/userAuth', authRouter);

module.exports = api;