const express = require('express');
const auth = express.Router();
const googleAuth = require('../utils/googleAuth');
const User = require('../modules/userSchema');
const {isAuth} = require('../utils/googleAuth');
const {verificationLink} = require('../utils/email');

auth.post('/google-auth', googleAuth.googleAuthLogin);

auth.post('/register', googleAuth.registerAuth)

auth.post('/login', googleAuth.loginAuth);

auth.get('/logout', (req, res)=>{
    res.clearCookie('auth-cookie');
    res.redirect('/login')
});

auth.get('/update-profile', isAuth, async (req, res)=>{
    const {name, phoneNo} = req.query;
    // console.log(req.user_id, name, phoneNo);
    try{
        const user = await User.findOne({_id: req.user_id});
        if(!user){
            return res.send("Invalid Gateway");
        }
        user.name = name;
        user.phoneNo = phoneNo;
        user.save();
        res.redirect(`/profile/${req.user_id}`);
    }catch(err){
        console.log(err);
        res.status(500).send("Internal server error")
    }
})

auth.get('/resend-verification-link', isAuth, async (req, res)=>{
    try{
        await verificationLink(req.user_email, req.user_id);
        return res.redirect('/verification');
    }catch(error){
        console.log(err);
        return res.send("Something went wrong");
    }
})

auth.get('/:id',async (req, res)=>{
    const {id} = req.params;
    try{
        const user = await User.findOne({_id: id});
        if(user){
            user.verified = true;
            await user.save();
            return res.send("verified successfully");
        }
        return res.send("invalid verification link");
    }catch(err){
        console.log(err);
        return res.send("Something want wrong"+ err.message);
    }
})
module.exports = auth;