const profileDetials = require('../models/profileDetials');
const user = require('../models/user');
const express = require('express');
const auth = require('../middleware/auth');
const router = new express.Router();
const uploadController = require("../controllers/jobpost-uploads");
const proposalUpload = require("../middleware/proposals-uploads").uploadFilesMiddleware;
const proposalFiles = require("../middleware/proposals-uploads").files
const jobUpload = require("../middleware/job-uploads");
const jobFiles = require("../middleware/job-uploads").files

//uploadfile
router.post("/multiple-upload", uploadController.multipleUpload);

// add profile description
router.post('/adddesc' , auth , async (req , res) =>{
const desc = new profileDetials({
        ...req.body,
  owner: req.user._id
})

try {
await desc.save()
res.status(201).send(desc)
} catch (e) {
res.status(400).send(e)
}

})

// get profile WITHOUT ID FOR HOME
router.get('/getdesc' , (req ,res)  =>{
    profileDetials.find({}).then((desc) =>{
        res.send(desc)
     }).catch((e)=>{
         res.status(500).send()
     })
})
 
// WITH ID WITHOUT AUTH FOR HOME VIEW PROFILE
router.get('/getprofiledesc/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const task = await profileDetials.findById(_id)

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

// GET FOR PROFILE DESC WITH AUTH
router.get('/getdesc/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await profileDetials.findById({ _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})


//ifo user and profile
/*
router.get('/allinfo/:id',auth,async (req, res) => {
    const _id = req.params.id

    try {
        //const task = await profileDetials.findById({_id , owner: req.user._ids})
      // const user = await User.findById({_id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }

        res.send(task,user )
    } catch (e) {
        res.status(500).send()
    }
})
*/
router.patch('/editdesc/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await profileDetials.findOne({ _id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})
//delete description by patch set value zero

router.patch('/deletedesc/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description']
   const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
   const task= await profileDetials.updateOne({_id:req.params.id},{$set:{description:''}});
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
    const task = await profileDetials.findOne( {_id: req.params.id} )

        if (!task) {
            return res.status(404).send()
        }

      //  updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//pricepost
//addprice in database

router.patch('/addprice/:id' ,auth, async(req , res) =>{
    try{
        const desc = await profileDetials.findByIdAndUpdate(req.params.id , req.body , {new:true , runValidators:true})
        if(!desc){
            return res.status(404).send()
        }
        return res.send(desc)
    } catch (e) {
        res.status(400).send(e)
    }
    
})



//get price
router.get('/getprice/:id', async (req, res) => {
        const _id = req.params.id
    
        try {
            const task = await profileDetials.findById(_id)
    
            if (!task) {
                return res.status(404).send()
            }
    
            res.send(task)
        } catch (e) {
            res.status(500).send()
        }
    })
//edit price
router.patch('/editprice/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['price']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await profileDetials.findOne({ _id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/deleteprice/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['price']
   const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
   const task= await profileDetials.updateOne({_id:req.params.id},{$set:{price:''}});
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
    const task = await profileDetials.findOne( {_id: req.params.id} )

        if (!task) {
            return res.status(404).send()
        }

      //  updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})
// addtitle
//edit for add
router.patch('/addtitle/:id' ,auth , async(req , res) =>{
    try{
        const desc = await profileDetials.findByIdAndUpdate(req.params.id , req.body , {new:true , runValidators:true})
        if(!desc){
            return res.status(404).send()
        }
        return res.send(desc)
    } catch (e) {
        res.status(400).send(e)
    }
    
})


    router.get('/gettitle/:id', async (req, res) => {
        const _id = req.params.id
    
        try {
            const task = await profileDetials.findById(_id)
    
            if (!task) {
                return res.status(404).send()
            }
    
            res.send(task)
        } catch (e) {
            res.status(500).send()
        }
    })

router.patch('/edittitle/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['jobtitle']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await profileDetials.findOne({ _id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/deletetitle/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title']
   const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
   const task= await profileDetials.updateOne({_id:req.params.id},{$set:{title:''}});
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
    const task = await profileDetials.findOne( {_id: req.params.id} )

        if (!task) {
            return res.status(404).send()
        }

      //  updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// education
//add edu
//patch to add and edit
router.patch('/addedu/:id' ,auth, async(req , res) =>{
    try{
        const desc = await profileDetials.findByIdAndUpdate(req.params.id , req.body , {new:true , runValidators:true})
        if(!desc){
            return res.status(404).send()
        }
        return res.send(desc)
    } catch (e) {
        res.status(400).send(e)
    }
    
})


    router.get('/getedu/:id', async (req, res) => {
        const _id = req.params.id
    
        try {
            const task = await profileDetials.findById(_id)
    
            if (!task) {
                return res.status(404).send()
            }
    
            res.send(task)
        } catch (e) {
            res.status(500).send()
        }
    })

router.patch('/editedu/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['education']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await profileDetials.findOne({ _id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})


router.patch('/deleteedu/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['education']
   const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
   const task= await profileDetials.updateOne({_id:req.params.id},{$set:{education:''}});
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
    const task = await profileDetials.findOne( {_id: req.params.id} )

        if (!task) {
            return res.status(404).send()
        }

      //  updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})



//language

router.patch('/addlang/:id' , auth, async(req , res) =>{
    try{
        const desc = await profileDetials.findByIdAndUpdate(req.params.id , req.body , {new:true , runValidators:true})
        if(!desc){
            return res.status(404).send()
        }
        return res.send(desc)
    } catch (e) {
        res.status(400).send(e)
    }
    
})


    router.get('/getlang/:id', async (req, res) => {
        const _id = req.params.id
    
        try {
            const task = await profileDetials.findById(_id)
    
            if (!task) {
                return res.status(404).send()
            }
    
            res.send(task)
        } catch (e) {
            res.status(500).send()
        }
    })

    router.patch('/editlang/:id', auth, async (req, res) => {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['language']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' })
        }
    
        try {
            const task = await profileDetials.findOne({ _id: req.params.id, owner: req.user._id})
    
            if (!task) {
                return res.status(404).send()
            }
    
            updates.forEach((update) => task[update] = req.body[update])
            await task.save()
            res.send(task)
        } catch (e) {
            res.status(400).send(e)
        }
    })

    router.patch('/deletelang/:id', async (req, res) => {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['language']
       const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
       const task= await profileDetials.updateOne({_id:req.params.id},{$set:{language:''}});
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' })
        }
    
        try {
        const task = await profileDetials.findOne( {_id: req.params.id} )
    
            if (!task) {
                return res.status(404).send()
            }
    
          //  updates.forEach((update) => task[update] = req.body[update])
            await task.save()
            res.send(task)
        } catch (e) {
            res.status(400).send(e)
        }
    })
   

// skills


router.patch('/addskills/:id' , auth,async(req , res) =>{
    try{
        const desc = await profileDetials.findByIdAndUpdate(req.params.id , req.body , {new:true , runValidators:true})
        if(!desc){
            return res.status(404).send()
        }
        return res.send(desc)
    } catch (e) {
        res.status(400).send(e)
    }
    
})


    router.get('/getskills/:id', async (req, res) => {
        const _id = req.params.id
    
        try {
            const task = await profileDetials.findById(_id)
    
            if (!task) {
                return res.status(404).send()
            }
    
            res.send(task)
        } catch (e) {
            res.status(500).send()
        }
    })

    router.patch('/editskills/:id', auth, async (req, res) => {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['skills']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' })
        }
    
        try {
            const task = await profileDetials.findOne({ _id: req.params.id, owner: req.user._id})
    
            if (!task) {
                return res.status(404).send()
            }
    
            updates.forEach((update) => task[update] = req.body[update])
            await task.save()
            res.send(task)
        } catch (e) {
            res.status(400).send(e)
        }
    })

    router.patch('/deleteskills/:id', async (req, res) => {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['skills']
       const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
       const task= await profileDetials.updateOne({_id:req.params.id},{$set:{skills:''}});
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' })
        }
    
        try {
        const task = await profileDetials.findOne( {_id: req.params.id} )
    
            if (!task) {
                return res.status(404).send()
            }
    
          //  updates.forEach((update) => task[update] = req.body[update])
            await task.save()
            res.send(task)
        } catch (e) {
            res.status(400).send(e)
        }
    })
//workhistory

router.patch('/addwork/:id' , auth, async(req , res) =>{
    try{
        const desc = await profileDetials.findByIdAndUpdate(req.params.id , req.body , {new:true , runValidators:true})
        if(!desc){
            return res.status(404).send()
        }
        return res.send(desc)
    } catch (e) {
        res.status(400).send(e)
    }
    
})


    router.get('/getwork/:id', async (req, res) => {
        const _id = req.params.id
    
        try {
            const task = await profileDetials.findById(_id)
    
            if (!task) {
                return res.status(404).send()
            }
    
            res.send(task)
        } catch (e) {
            res.status(500).send()
        }
    })

    router.patch('/editwork/:id', auth, async (req, res) => {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['workhistory']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' })
        }
    
        try {
            const task = await profileDetials.findOne({ _id: req.params.id, owner: req.user._id})
    
            if (!task) {
                return res.status(404).send()
            }
    
            updates.forEach((update) => task[update] = req.body[update])
            await task.save()
            res.send(task)
        } catch (e) {
            res.status(400).send(e)
        }
    })

    router.patch('/deletework/:id', async (req, res) => {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['workhistory']
       const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
       const task= await profileDetials.updateOne({_id:req.params.id},{$set:{workhistory:''}});
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' })
        }
    
        try {
        const task = await profileDetials.findOne( {_id: req.params.id} )
    
            if (!task) {
                return res.status(404).send()
            }
    
          //  updates.forEach((update) => task[update] = req.body[update])
            await task.save()
            res.send(task)
        } catch (e) {
            res.status(400).send(e)
        }
    })

router.get('/users/:id', auth, async (req, res) => {
    res.send(req.user)
})




/*
router.patch('/deleteprice/:id', async (req, res) => {
    const updates = Object.keys(req.body)
        const allowedUpdates = ['price']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' })
        }
    
    
    try {
        
        const updatedProfile= await profileDetials.UpdateOne({​​​​_id:req.params.id}, {​​​​$set:{price:" "}​​​​});
       

        res.send(updatedProfile)
    } catch (e) {
        res.status(500).send()
    }
})

/*
// delet by patch maryem
router.patch('/deletedesc/:id',auth ,async (req, res) => {
    const updates = Object.keys(req.body)
        const allowedUpdates = ['desc']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' })
        }
    
    
    try {
        
        const updatedProfile= await profileDetials.updateOne({​​​​_id:req.params.id , owner: req.user._id}​​​​,{​​​​$set:{workhistory:""}​​​​}​​​​);
       

        res.send(updatedProfile)
    } catch (e) {
        res.status(500).send()
    }
})
*/

/*
// update profile description
router.patch('/desc/:id' , async(req , res) =>{
    try{
        const desc = await profileDetials.findByIdAndUpdate(req.params.id , req.body , {new:true , runValidators:true})
        if(!desc){
            return res.status(404).send()
        }
        return res.send(desc)
    } catch (e) {
        res.status(400).send(e)
    }
    
})
*
// delete profile description 
router.delete('/desc/:id', async(req , res) =>{
    try{

        const desc = await profileDetials.findByIdAndDelete(req.params.id) 
        if(!desc){
            return res.status(404).send()
        }
         res.send(desc)
    }catch (e) {
        res.status(400).send(e)
    }

})

// add & edit profile price 
router.patch('/price/:id' , async(req , res) =>{
    try{
        const desc = await profileDetials.findByIdAndUpdate(req.params.id , req.body , {new:true , runValidators:true})
        if(!desc){
            return res.status(404).send()
        }
        return res.send(desc)
    } catch (e) {
        res.status(400).send(e)
    }
    
})

// get price
router.get('/price/:id', (req ,res)=>{
    const _id = req.params.id
    profileDetials.findById(_id).then((price)=>{
        if (!price) {
            return res.status(404).send()
        }
        res.send(price)

    }).catch((e)=>{
        res.status(500).send()
    })

})


router.delete('/price/:id', async(req , res) =>{
    try{

        const desc = await profileDetials.findByIdAndDelete(req.params.id) 
        if(!desc){
            return res.status(404).send()
        }
         res.send(desc)
    }catch (e) {
        res.status(400).send(e)
    }

})



// upload profile pictuer
/*
const upload = multer({
    //dest: 'avatars'
    limits: {
        fileSize:1000000
    },
    fileFilter(req , file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error ('pleasw upload an image'))
        }
        cb(undefined , true)
    }
})
router.post('/profile/avatar', auth,upload.single('avatar'), async(req ,res) => {
    req.user.avatar = req.file.buffer
    await req.user.save()
    res.send() 
},

(error,req,res,next) => {

res.status(400).send({error : error.message})
})



*/

module.exports = router ;