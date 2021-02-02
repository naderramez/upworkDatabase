const mongoose = require('mongoose');
const jobSchema = new mongoose.Schema({
    owner:{
        type: String
    },
    postName:{
        type:String
    },
    category:{
        type:String
    },
    description:{
        type:String
    },
    additionalFiles:{
        type:Array
    },
    projectType:{
        type:String
    },
    screaningQuestions:{
        type:Array
    },
    coverLetter:{
        type:Boolean
    },
    skills:{
        type:Array
    },
    experienceLevel:{
        type:String
    },
    visibility:{
        type: String
    },
    freelancersNo:{
        type: Number
    },
    talentPreference:{
        type:Object
    },
    payType:{
        type:String
    },
    estimatedBudget:{
        type:Number
    },
    duration:{
        type:String
    },
    timeRequiremnt:{
        type:String
    },
    postStatus:{
        type:String
    },
    likers:{
        type:Array
    },
    dislikers:{
        type:Array
    },
    proposals:{
        type:Object
    },
    hiring:{
        type:Object
    },
    interviews:{
        type:Object
    },
},
    {timestamps:true}
);

module.exports = mongoose.model('Job',jobSchema);