const router = require('express').Router();
const verfiy  =require('./verfiyToken');

router.get('/' , verfiy, (req , res) =>{
 res.json({
    profile: {
        name: 'reem' ,
        email:'reem@gmail.com' ,
        title: 'web developer'
    }
});

});
module.exports = router ;