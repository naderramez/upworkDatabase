const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const {registerValidation} = require('../validations');

router.post('/', async (req, res)=>{
    //VALIDATION
    const {error} = registerValidation(req.body);
    if(error) {return res.status(400).send(error.details[0].message);}

    //TO NOT DUPLICATE DTAT
    const emailExist = await User.findOne({email:req.body.email});
    if(emailExist){return res.status(400).send('Email is already exists');}

    
// reem hashed password 
//const salt = await bcrypt.genSalt(10);
//const hashPassword = await bcrypt.hash(req.body.password, salt);

//reem 
    const user = await new User({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        country:req.body.country,
        password:req.body.password,
        type:req.body.type,
        paymentAccount: req.body.type === "freelancer"?{
            totalAmount: 0,
            holdAmount:0,
            availableAmount:0 
        }: {
            totalAmount: 5000,
            holdAmount:0,
            availableAmount:5000 
        },
        userImage:""
    });
    try{
        const savedUser = await user.save();
        res.send(savedUser);
    }catch(err){
        res.status(400).send(err)
    }
})

module.exports = router;