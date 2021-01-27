const router = require('express').Router();
const User = require('../models/user');
const {registerValidation} = require('../validations');

router.post('/', async (req, res)=>{
    //VALIDATION
    const {error} = registerValidation(req.body);
    if(error) {return res.status(400).send(error.details[0].message);}

    //TO NOT DUPLICATE DTAT
    const emailExist = await User.findOne({email:req.body.email});
    if(emailExist){return res.status(400).send('Email is already exists');}

    const user = await new User({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        password:req.body.password,
        nationality:req.body.nationality,
        type:req.body.type,
    });
    try{
        const savedUser = await user.save();
        res.send(savedUser);
    }catch(err){
        res.status(400).send(err)
    }
})

module.exports = router;