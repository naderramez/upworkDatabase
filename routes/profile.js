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

//get by populate & auth of login desc of user
router.get('/allinfo', auth, async (req, res) => {
    try {
        await req.user.populate('tasks').execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/alluser', auth, async (req, res) => {
    try {
        await req.user.populate('owner').execPopulate()
        res.send(req.user.owner)
    } catch (e) {
        res.status(500).send()
    }
})

// get profile WITHOUT ID FOR HOME
// all user detials for home
router.get('/getdesc' , (req ,res)  =>{
    profileDetials.find({}).then((desc) =>{
        res.send(desc)
     }).catch((e)=>{
         res.status(500).send()
     })
})

router.patch('/editdesc', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await profileDetials.findOne({ owner: req.user._id})

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
//delete description by patch set value zero github conflict

router.patch('/deletedesc',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description']
   const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
   const task= await profileDetials.updateOne({owner:req.user._id},{$set:{description:''}});
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
    const task = await profileDetials.findOne( { owner:req.user._id})

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
//PI FOR ADD ALLprofile
router.patch('/addprofileinfo', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates =
     ['description', 'price' ,'jobtitle' , 'education' , 'skills' ,'workhistory' , 'language']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await profileDetials.findOne({ owner: req.user._id})

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

// get price =get alll info
//edit price
router.patch('/editprofileinfo', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','price','jobtitle' , 'education' , 'skills' ,'workhistory' , 'language']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await profileDetials.findOne({  owner: req.user._id})

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

router.patch('/deleteprice', auth,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['price']
   const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
   const task= await profileDetials.updateOne({owner:req.user._id},{$set:{price:''}});
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
    const task = await profileDetials.findOne( {owner:req.user._id} )

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

router.patch('/deletetitle', auth,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['jobtitle']
   const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
   const task= await profileDetials.updateOne({owner:req.user._id},{$set:{jobtitle:''}});
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
    const task = await profileDetials.findOne( {owner:req.user._id} )

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

router.patch('/deleteedu', auth,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['education']
   const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
   const task= await profileDetials.updateOne({owner:req.user._id},{$set:{education:''}});
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
    const task = await profileDetials.findOne( {owner:req.user._id} )

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



router.patch('/deleteskills', auth,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['skills']
   const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
   const task= await profileDetials.updateOne({owner:req.user._id},{$set:{skills:''}});
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
    const task = await profileDetials.findOne( {owner:req.user._id} )

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



router.patch('/deleteworkhistory', auth,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['workhistory']
   const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
   const task= await profileDetials.updateOne({owner:req.user._id},{$set:{workhistory:''}});
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
    const task = await profileDetials.findOne( {owner:req.user._id} )

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

router.patch('/deletelang', auth,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [' language']
   const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
   const task= await profileDetials.updateOne({owner:req.user._id},{$set:{ language:''}});
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
    const task = await profileDetials.findOne( {owner:req.user._id} )

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

///////////////////////////////////////////////////////////////////////////





module.exports = router ;