const express = require('express');
const admin = require('firebase-admin');
const User = require('../modules/userSchema'); // Path to your User model
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { verificationLink } = require('../utils/email');
const bcrypt = require('bcrypt');

exports.googleAuthLogin = async (req, res) => {
  const { name, email, uid, imageUrl } = req.body;
  // console.log("user data ", name, email, uid, imageUrl);
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        name,
        imageUrl,
        provider: 'google',
        verified: true,
        googleId: uid,
      });
      await user.save();
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie('auth-cookie', token, {
      httpOnly: true,
      sameSite: 'Strict',
    });
    res.status(200).send("auth successfully completed");
  } catch (error) {
    console.error('Error during Google authentication:', error);
    res.status(400).send({ error: 'Authentication failed' });
  }
};

exports.registerAuth = async (req, res) => {
  const { name, email, password, phoneNo } = req.body;
  if (!name || !email || !password || !phoneNo) return res.status(400).send("all fields are required");
  try {
    validateInputs({ name, email, password, phoneNo })
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = User({
      name,
      email,
      password: hashedPassword,
      provider: 'email',
      phoneNo
    });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie('auth-cookie', token, {
      httpOnly: true,
      sameSite: 'Strict',
    });
    const success = await verificationLink(email, user._id);
    // console.log("email sending status is ", success);
    res.status(200).send("auth successfully completed")
  } catch (err) {
    console.error("Error registering user:", err.code);
    if (err.code == 11000) {
      res.status(300).send("error: email already used");
    }
    res.status(500).send("Internal server error");
  }
}

exports.loginAuth = async (req, res) => {
  const { email, password } = req.body;
  // console.log(email, password)
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).send("user not found");
    }
    const correct = await bcrypt.compare(password, user.password);
    if (correct) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      res.cookie('auth-cookie', token, {
        httpOnly: true,
        sameSite: 'Strict',
      });
      return res.status(200).send("auth successfully completed");
    } else {
      return res.status(400).send("Invalid username or password");
    }
  } catch (err) {
    // console.log(err.message);
    return res.status(500).send("Something went wrong");
  }
}
exports.isAuth = async (req, res, next) => {
  // console.log("auth");
  const authCookie = req.cookies['auth-cookie'];
  if (authCookie) {
    try {
      const decoded = jwt.verify(authCookie, process.env.JWT_SECRET);
      // console.log("Hello", decoded.userId)
      const user = await User.findOne({ _id: decoded.userId });
      if (user) {
        req.user_name = user.name || "";
        req.user_email = user.email || "";
        req.user_imageUrl = user.imageUrl || "";
        req.user_verified = user.verified || false;
        req.user_id = user._id || "";
        req.user_phoneNo = user.phoneNo ||  "";
      } else {
        req.user_name = "";
        req.user_email = "";
        req.user_imageUrl = "";
        req.user_verified = false;
        req.user_id = "";
        req.user_phoneNo = "";
      }
    } catch (err) {
      console.log(err.message);
      res.status(500).send("error : ", err.message)
    }
  }
  next();
}

const validateInputs = ({ name, email, password, phoneNo }) => {
  const errors = [];

  // Name validation
  if (!name || name.trim().length < 3) {
    errors.push("Name must be at least 3 characters long.");
  }

  // Email validation (basic regex for email format)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Invalid email address.");
  }

  // Password validation (must contain at least one number, one letter, and be at least 8 characters)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    errors.push(
      "Password must be at least 8 characters long and contain both letters and numbers."
    );
  }

  // Phone number validation (must be 10 digits)
  const phoneRegex = /^\d{10}$/;
  if (!phoneNo || !phoneRegex.test(phoneNo)) {
    errors.push("Phone number must be 10 digits long.");
  }

  return errors;
};