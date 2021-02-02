const Joi = require('@hapi/joi');


//REGISTER VALIDATION
const registerValidation = (data) => {
    const schema = Joi.object({
        firstName:Joi.string().min(2).required(),
        lastName:Joi.string().min(2).required(),
        email:Joi.string().min(4).required().email(),
        password:Joi.string().min(6).required(),
<<<<<<< HEAD
        country:Joi.string().min(2).required(),
        type:Joi.required()
=======
        nationality:Joi.string().min(6).required(),
        type:Joi.required(),
        description:Joi.string().required(),
        education:Joi.string().required(),

>>>>>>> login
    });
    return schema.validate(data)

}
// login validation
const loginValidation = (data) => {
    const schema = Joi.object({
      
        email:Joi.string().min(6).required().email(),
        password:Joi.string().min(6).required() 
      
    });
    return schema.validate(data)
}
// profiledetials validation

const profileValidation = (data) => {
    const schema = Joi.object({
      
     description:Joi.string(),
     education:Joi.string(),
     jobtitle:Joi.string(),
     skills:Joi.string(),
     workhistory:Joi.string(),
     price:Joi.string(),
     langauage:Joi.string()
      
    });
    return schema.validate(data)
}


module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation
module.exports.profileValidation = profileValidation