const express = require('express');
const car = express.Router();
const {displayCar, requestCar, acceptRequestCar} = require('../utils/carsUtils');
const {isAuth} = require('../utils/googleAuth');


car.get('/details/:id', displayCar);
car.get('/request/:id', isAuth,requestCar);
car.post('/request', isAuth, acceptRequestCar);

module.exports = car;