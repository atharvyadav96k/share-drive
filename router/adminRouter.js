const express = require('express');
const admin = express.Router();
const multer = require('multer');
const jwt = require('jsonwebtoken')
const { storeCarDetails, displayCar, getRequests,updateCarDetails, deleteCar, cancelCarRequest, acceptCar, pendingCarRequest} = require('../utils/carsUtils');
const Car = require('../modules/carSchema')

const upload = multer({
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

// upload new car
admin.get('/uploadCar', checkAdmin,(req, res) => {
  res.render('admin/uploadCar');
});
admin.post('/uploadCar', checkAdmin,upload.single('image'), storeCarDetails);

// edit car information
admin.get('/editCar/:id', checkAdmin,async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id }).select("-image -thumbnail -path");
    console.log(car)
    res.render('admin/editCar', { car, id: req.params.id });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});
admin.post('/editCar/:id', checkAdmin,upload.single('image'), updateCarDetails);

// admin login
admin.get('/login', (req, res) => {
  res.render('admin/adminLogin');
});
admin.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.clearCookie('login-status');
    res.cookie('admin-auth', token, {
      httpOnly: true,
      sameSite: 'Strict'
    });
    res.redirect('/admin');
  } else {
    res.cookie('login-status', 'failed', {
      sameSite: 'Strict',
      maxAge: 5 * 60 * 1000, 
    });
    res.redirect('/admin/login');
  }
});

// admin logout
admin.get('/logout', (req, res)=>{
  res.clearCookie('admin-auth');
  res.redirect('/admin/login')
})

// admin index
admin.get('/', checkAdmin,(req, res) => {
  res.render('admin/index');
})


admin.get('/cars', checkAdmin,async (req, res) => {
  try {
    const cars = await Car.find().select("_id thumbnail name pricePerDay");
    res.render('admin/getAllCars', { cars })
  } catch (err) {
    res.status(500).send("error: " + err.message);
  }
})


admin.get('/delete/:id', checkAdmin,deleteCar)
// display all request
admin.get('/requests', checkAdmin,getRequests)

// cancel request for car
admin.get('/cancel-car-request/:id', checkAdmin, cancelCarRequest)

// accept request for car
admin.get('/verify-car-request/:id', checkAdmin, acceptCar);

// set to pending for car
admin.get('/pending-car-request/:id', checkAdmin, pendingCarRequest);

admin.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).send('File too large! Maximum size is 1 MB.');
    }
  } else if (err.message === 'Only image files are allowed!') {
    return res.status(400).send(err.message);
  }
  next(err);
});

function checkAdmin(req, res, next) {
  const token = req.cookies['admin-auth'];
  if (!token) {
    return res.redirect('/admin/login')
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.redirect('/admin/login')
    }
    next();
  } catch (err) {
    return res.redirect('/admin/login')
  }
}

module.exports = admin;