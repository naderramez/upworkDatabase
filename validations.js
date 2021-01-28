const Joi = require('@hapi/joi');


//REGISTER VALIDATION
const registerValidation = (data) => {
    const schema = Joi.object({
        firstName:Joi.string().min(4).required(),
        lastName:Joi.string().min(4).required(),
        email:Joi.string().min(6).required().email(),
        password:Joi.string().min(6).required(),
        nationality:Joi.string().min(6).required(),
        type:Joi.required()
    });
    return schema.validate(data)

}
const loginValidation = (data) => {
    const schema = Joi.object({
      
        email:Joi.string().min(6).required().email(),
        password:Joi.string().min(6).required() 
      
    });
    return schema.validate(data)
}


module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation