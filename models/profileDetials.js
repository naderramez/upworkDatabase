const mongoose = require('mongoose');
const profileDetials = mongoose.model( 'profileDetials',{
       



    description:{
        type:String
      
    },
    
    education:{
        type:String
    },

  jobtitle:{
        type:String
    },
    skills:{
        type:String
    },
    price:{
        type:String
    },
    workhistory:{
        type:String
    },
 language:{
    type:String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    }





});

//module.exports = mongoose.model('profileDetials',userSchema);
//const profileDetials = mongoose.model('profileDetials', userSchema)
module.exports = profileDetials