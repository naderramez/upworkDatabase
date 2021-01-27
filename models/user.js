const mongoose = require('mongoose');
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
    nationality:{
        type:String,
        required:true,
        min:4
    },
    type:{
        type:String,
        required:true,
        min:4
    },
    date:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User',userSchema);