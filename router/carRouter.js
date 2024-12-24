const express = require('express');
const car = express.Router();
const {displayCar, requestCar, acceptRequestCar, getPreviewImage} = require('../utils/carsUtils');
const {isAuth} = require('../utils/googleAuth');


car.get('/details/:id', displayCar);
car.get('/request/:id', isAuth,requestCar);
car.get('/preview/:key',getPreviewImage)
car.post('/request', isAuth, acceptRequestCar);
module.exports = car;