const router = require('express').Router();
const User = require('../models/user');
const {loginValidation} = require('../validations');
const bcrypt = require('bcryptjs');
const jwt = require ('jsonwebtoken');


router.post('/login', async (req, res)=>{
    //res.send('hello sign in page')

const {error} = loginValidation(req.body);
if(error) return res.status(400).send(error.details[0].message);

// check email not exist
const user = await User.findOne({email:req.body.email});
    if(!user )return res.status(400).send('Email is not found');

    // password not correct 
    const validPass = await bcrypt.compare(req.body.password , user.password);
    if(!validPass ) return res.status(400).send('invalid password '); 
    // create and sign token

    const token = jwt.sign({_id: user._id} ,process.env.TOKEN_SECERT);
     res.header('auth-token' , token).send(token);
    
    
    res.send('logged in');

});
module.exports = router;