const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require ('jsonwebtoken');
const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        min:4
    },
    lastName:{
        type:String,
        required:true,
        min:4
    },
    email:{
        type:String,
       
        required:true
    },
    password:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true,
        min:4
    },
    type:{
        type:String,
        required:true,
        min:4
    } ,
    date:{
        type: Date,
        default: Date.now
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});
  //virtual field property mangoos 
userSchema.virtual('tasks', {
    ref:'profileDetials',
    localField: '_id',
    foreignField: 'owner'
})

// token
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

//hashed passwoed
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})



/*
userSchema.findByCredentials = async (email , password)=>{
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw  new Error('Unable to login ')
    }
    return user
}

// hashed password
userSchema.pre('save' , async function (next){
const  user= this

if(user.isModified('password')){
    user.password = await bcrypt.hash(user.password ,8)
}
next()
})


//const User =  mongoose.model('User' ,userSchema)
//module.export = User
module.exports = mongoose.model('User',userSchema);
*/

const User = mongoose.model('User', userSchema)
module.exports = User