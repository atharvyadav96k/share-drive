const express = require('express');
const view = express.Router();
const jwt = require('jsonwebtoken');
const { isAuth, getAuth } = require('../utils/googleAuth');
const { forgetPassword } = require('../utils/email');
const User = require('../modules/userSchema');
const bcrypt = require('bcrypt');
const { getCars } = require('../utils/carsUtils');
const Cars = require('../modules/carSchema');

// Pages
view.get('/', isAuth, async (req, res) => {
    try {
        const cars = await Cars.find().limit(6);
        res.render('index', { verified: req.user_verified, profile: req.user_id, domain: process.env.DOMAIN, cars });
    } catch (err) {
        console.log(err)
        res.status(500).send("Something went wrong: " + err.message);
    }
});

view.get('/about', isAuth, (req, res) => {
    try {
        res.render('about', { verified: req.user_verified, profile: req.user_id });
    } catch (err) {
        console.log(err)
        res.status(500).send("Something went wrong: " + err.message);
    }
});

view.get('/services', isAuth, (req, res) => {
    try {
        res.render('services', { verified: req.user_verified, profile: req.user_id });
    } catch (err) {
        console.log(err)
        res.status(500).send("Something went wrong: " + err.message);
    }
});

view.get('/verification', isAuth, (req, res) => {
    try {
        res.render('auth/verifyMail', { verified: req.user_verified, profile: req.user_id });
    } catch (err) {
        console.log(err)
        res.status(500).send("Something went wrong: " + err.message);
    }
});

view.get('/pricing', isAuth, (req, res) => {
    try {
        res.render('cars/pricing', { verified: req.user_verified, profile: req.user_id });
    } catch (err) {
        console.log(err)
        res.status(500).send("Something went wrong: " + err.message);
    }
});

view.get('/car', isAuth, async (req, res) => {
    try {
        await getCars(req, res);
    } catch (err) {
        console.log(err)
        res.status(500).send("Something went wrong: " + err.message);
    }
});

view.get('/contact', isAuth, (req, res) => {
    try {
        res.render('contact', { verified: req.user_verified, profile: req.user_id });
    } catch (err) {
        console.log(err)
        res.status(500).send("Something went wrong: " + err.message);
    }
});

view.get('/profile/:id', isAuth, async (req, res) => {
    try {
        let cars = await User.findOne({ _id: req.params.id })
            .select('carRequest')
            .populate({
                path: 'carRequest',
                populate: {
                    path: 'car',
                    select: 'name thumbnail pricePerDay Date'
                }
            });
        console.log(cars)
        cars = cars?.carRequest || [];
        res.render('user/profile', {
            verified: req.user_verified,
            profile: req.user_id,
            name: req.user_name,
            email: req.user_email,
            phoneNo: req.user_phoneNo,
            imageUrl: req.user_imageUrl,
            cars
        });
    } catch (err) {
        console.log(err)
        res.status(500).send("Something went wrong: " + err.message);
    }
});

view.get('/car-details', isAuth, (req, res) => {
    try {
        res.render('cars/car-single', { verified: req.user_verified, profile: req.user_id });
    } catch (err) {
        console.log(err)
        res.status(500).send("Something went wrong: " + err.message);
    }
});

// Password forget
view.get('/forget-password', (req, res) => {
    try {
        res.render('auth/setPassordMail');
    } catch (err) {
        console.log(err)
        res.status(500).send("Something went wrong: " + err.message);
    }
});

view.post('/forget-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).send("Invalid email");
        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
        await forgetPassword(email, token);
        res.status(200).send("Successfully sent mail");
    } catch (err) {
        console.log(err)
        res.status(500).send("Something went wrong: " + err.message);
    }
});

view.get('/set-password/:token', (req, res) => {
    try {
        res.render("auth/setPassword", { url: req.params.token });
    } catch (err) {
        console.log(err)
        res.status(500).send("Something went wrong: " + err.message);
    }
});

view.post('/set-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return res.status(400).send("Invalid token.");
        const { userId, exp } = decoded;
        if (exp < Math.floor(Date.now() / 1000)) return res.status(401).send("Token has expired.");
        if (password !== confirmPassword) return res.status(400).send("Passwords do not match.");

        const user = await User.findOne({ _id: userId });
        if (!user) return res.status(400).send("User not found.");

        const hashedPass = await bcrypt.hash(password, 10);
        user.password = hashedPass;
        await user.save();

        res.status(200).send("Password changed successfully");
    } catch (err) {
        console.log(err)
        res.status(500).send("An error occurred while processing the token: " + err.message);
    }
});

// Auth
view.get('/login', isAuth, (req, res) => {
    try {
        if (req.user_verified) return res.redirect('/car#cars');
        res.render('auth/login');
    } catch (err) {
        console.log(err)
        res.status(500).send("Something went wrong: " + err.message);
    }
});

view.get('/register', (req, res) => {
    try {
        res.render('auth/register', { verified: req.user_verified, profile: req.user_id });
    } catch (err) {
        console.log(err)
        res.status(500).send("Something went wrong: " + err.message);
    }
});

module.exports = view;
