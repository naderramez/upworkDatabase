const router = require('express').Router();
const User = require('../models/user');
const {loginValidation} = require('../validations');
const bcrypt = require('bcryptjs');
const jwt = require ('jsonwebtoken');
const auth = require('../middleware/auth');

router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const userLogin = await User.find({ email: req.body.email, password: req.body.password})
        if(userLogin){
            console.log(userLogin)
        }
        const token = await user.generateAuthToken()
        console.log(user,token)
        res.send ({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

/*
router.post('/login', async (req, res)=>{

    try{
        const user = await User.findByCredentials(req.body.email , req.body.password)
        res.send(user)
    } catch(e){
        res.status(400).send()

    }
}) */

module.exports = router;
