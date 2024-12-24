const express = require('express');
const view = express.Router();
const jwt = require('jsonwebtoken');
const { isAuth, getAuth } = require('../utils/googleAuth');
const { forgetPassword } = require('../utils/email');
const User = require('../modules/userSchema');
const bcrypt = require('bcrypt');
const { getCars } = require('../utils/carsUtils');
const Cars = require('../modules/carSchema');
// pages

view.get('/', isAuth, async (req, res) => {
    try{
        const cars = await Cars.find().limit(6);
        res.render('index', { verified: req.user_verified, profile: req.user_id , domain: process.env.DOMAIN, cars});    
    }catch(err){
        return res.status(500).send("Something went wrong");
    }
});

view.get('/about', isAuth, (req, res) => {
    res.render('about', { verified: req.user_verified, profile: req.user_id });
})

view.get('/services', isAuth, (req, res) => {
    res.render('services', { verified: req.user_verified, profile: req.user_id });
})

view.get('/verification', isAuth, (req, res) => {
    res.render('auth/verifyMail', { verified: req.user_verified, profile: req.user_id });
})

view.get('/pricing', isAuth, (req, res) => {
    res.render('cars/pricing', { verified: req.user_verified, profile: req.user_id });
})

view.get('/car', isAuth, getCars)

view.get('/contact', isAuth, (req, res) => {
    res.render('contact', { verified: req.user_verified, profile: req.user_id });
});

view.get('/profile/:id', isAuth, async (req, res) => {
    try{
        let cars = await User.findOne({_id: req.params.id}).select('carRequest').populate({
            path: 'carRequest',
            populate : {
                path: 'car',
                select: 'name thumbnail pricePerDay Date'
            }
        })
        cars = cars.carRequest;
        // console.log(cars)
        res.render('user/profile', { verified: req.user_verified, profile: req.user_id, name: req.user_name, email: req.user_email, phoneNo: req.user_phoneNo, imageUrl: req.user_imageUrl, cars: cars || [] });
    }catch(err){
        res.status(500).send("error : "+err.message)
    }
});

view.get('/car-details', isAuth, (req, res) => {
    res.render('cars/car-single', { verified: req.user_verified, profile: req.user_id });
})

// password forget
view.get('/forget-password', (req, res)=>{
    res.render('auth/setPassordMail');
})

view.post('/forget-password', async (req, res) => {
    const { email } = req.body;
    // console.log(email)
    try {
        const user = await User.findOne({ email: email });
        // console.log(user);
        if (!user) return res.status(404).send("Invalid email");
        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '15m'
        });
        await forgetPassword(email, token);
        res.status(200).send("successfully send mail");
    } catch (err) {
        res.status(500).send("Something went wrong");
    }
})

// 

view.get('/set-password/:token', (req, res) => {
    res.render("auth/setPassword", { url: req.params.token });
});

view.post('/set-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(400).send("Invalid token.");
        }
        const { userId, email, exp } = decoded;
        const currentTime = Math.floor(Date.now() / 1000);
        if (exp < currentTime) {
            return res.status(401).send("Token has expired.");
        }
        // console.log(password, confirmPassword)
        if (password !== confirmPassword) {
            return res.status(400).send("Passwords do not match.");
        }
        const user = await User.findOne({_id: userId});
        if(!user) return res.status(400).send("bad gateway");
        const hashedPass = await bcrypt.hash(password, 10);
        user.password = hashedPass;
        await user.save();
        res.status(200).send("password changed successfully");
    } catch (err) {
        // console.log(err)
        res.status(500).send("An error occurred while processing the token.");
    }
});

// auth 

view.get('/login', isAuth, async (req, res) => {
    if (req.user_verified == true) {
        res.redirect('/car#cars')
    }
    res.render('auth/login');
})

view.get('/register', (req, res) => {
    res.render('auth/register', { verified: req.user_verified, profile: req.user_id });
})


module.exports = view;