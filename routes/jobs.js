const router = require('express').Router();
const Job = require('../models/job');
const allFiles = require("../middleware/upload-files").files
const uploadController = require("../controllers/upload-files");

//GET ALL JOBS WITH LIKERS AND DISLIKERS STATUS
router.post('/getalljobs' , async(req , res) =>{
  try {
    var jobs = await Job.find();
    var userId = req.body.userId;
    jobs.map(async job =>{
      const likers = await Job.find ({_id: job._id},{likers:1,_id:0});
      const dislikers = await Job.find({_id: job._id},{dislikers:1,_id:0});
      var status = 0;
      for(var i = 0; i < likers.length; i++){
        if(likers[i]==userId){
          status = 1;
        }
      }
      for(var i = 0; i <dislikers.length; i++){
        if(dislikers[i].id==userId){
          status = 2;
        }
      }
      job.status = status;
    })
    res.send(jobs);
  } catch (err) {
    res.json({message:err.message});
  }
})
//GET ONE JOB WITH LIKER AND DISLIKER STATUS
router.post('/getonejob', async(req , res) => {
    try{     
      const likers = await Job.find({_id: req.body.jobId},{likers:1,_id:0});
      const dislikers = await Job.find({_id: req.body.jobId},{dislikers:1,_id:0});
      var job = await Job.find({_id: req.body.jobId},{});
      var status = 0;
      for(var i = 0; i < likers.length; i++){
        if(likers[i]==req.body.userId){
          status = 1;
        }
      }
      for(var i = 0; i <dislikers.length; i++){
        if(dislikers[i].id==req.body.userId){
          status = 2;
        }
      }
      job.status = status;
      res.send(job);
    }catch(err){
        res.json({message:err.message});
    }
})
//POST JOB STORE
//UPLOAD FILES
router.post("/multiple-upload", uploadController.multipleUpload);
//DOWNLOD FILES
router.get('/files/:name', async(req , res) => {
  const fileName = req.params.name;
const directoryPath = __basedir + "/../uploads-files/";
res.download(directoryPath + fileName, fileName, (err) => {
  if (err) {
    res.status(500).send({
      message: "Could not download the file. " + err,
    });
  }
});
})
//STORING JOB 
router.post('/savejob' , async(req , res) =>{
    const job = await new Job({
        postName:req.body.postName,
        category:req.body.category,
        description:req.body.description,
        additionalFiles:req.body.additionalFiles,  
        projectType:req.body.projectType,
        screaningQuestions:req.body.screaningQuestions,
        coverLetter:req.body.coverLetter,
        skills:req.body.skills,
        experienceLevel:req.body.experienceLevel,
        visibility:req.body.visibility,
        freelancersNo:req.body.freelancersNo,
        talentPreference:req.body.talentPreference,
        payType:req.body.payType,
        estimatedBudget:req.body.estimatedBudget,
        duration:req.body.duration,
        timeRequiremnt:req.body.timeRequiremnt,
        postStatus:1
    });
    try{
        const savedJob = await job.save();
        res.send(savedJob);
        consolr.log(savedJob);
    }catch(err){
        res.status(400).send(err)
    }
})
router.post('/saveTitle', async(req , res) =>{
    const jobTitle = await new Job(
      {
        postName:req.body.postName,
        category:req.body.category,
        postStatus:0
      }
    ) 
    try{
      const savedJob = await jobTitle.save();
      res.send(savedJob);
    }catch(err){
      res.status(400).send(err)
  } 
})
router.patch('/saveDescription', async(req , res) =>{
  try{
    const description = await Job.updateOne({_id:req.body.jobId},{$set:{description:req.body.description,additionalFiles:allFiles}});
    res.send(description);
  }catch(err){
    res.status(400).send(err)
} 
})
router.patch('/saveDetails', async(req , res) =>{
  try{
    const details = await Job.updateOne({_id:req.body.jobId},{$set:{projectType:req.body.projectType,screaningQuestions:req.body.screaningQuestions,coverLetter:req.body.coverLetter}});
    res.send(details);
  }catch(err){
    res.status(400).send(err)
} 
})
router.patch('/saveExpertise', async(req , res) =>{
  try{
    const expertise = await Job.updateOne({_id:req.body.jobId},{$set:{skills:req.body.skills,experienceLevel:req.body.experienceLevel}});
    res.send(expertise);
  }catch(err){
    res.status(400).send(err)
} 
})
router.patch('/saveVisibility', async(req , res) =>{
  try{
    const visibility = await Job.updateOne({_id:req.body.jobId},{$set:{visibility:req.body.visibility,freelancersNo:req.body.freelancersNo,talentPreference:req.body.talentPreference}});
    res.send(visibility);
  }catch(err){
    res.status(400).send(err)
} 
})
router.patch('/saveBudget', async(req , res) =>{
  try{
    const budget = await Job.updateOne({_id:req.body.jobId},{$set:{estimatedBudget:req.body.estimatedBudget}});
    res.send(budget);
  }catch(err){
    res.status(400).send(err)
} 
})
router.patch('/postJob', async(req , res) =>{
  try{
    const budget = await Job.updateOne({_id:req.body.jobId},{$set:{postStatus:1}});
    res.send(budget);
  }catch(err){
    res.status(400).send(err)
} 
})

//PATCH OR UPDATE JOB POST
router.patch('/editTitle/:jobId' , async(req , res) =>{
    try{
        const updatedJob = await Job.updateOne({_id:req.params.jobId},{$set:{postName:req.body.postName,category:req.body.category}});
        res.json(updatedJob);
    }catch(err){
        res.json({message:err.message});
    }
})
router.patch('/editDescription/:jobId' , async(req , res) =>{
    try{
        const updatedJob = await Job.updateOne({_id:req.params.jobId},{$set:{description:req.body.description}});
        res.json(updatedJob);
    }catch(err){
        res.json({message:err.message});
    }
})
router.patch('/editDetails/:jobId' , async(req , res) =>{
    try{
        const updatedJob = await Job.updateOne({_id:req.params.jobId},{$set:{projectType:req.body.projectType,screaningQuestions:req.body.screaningQuestions,coverLetter:req.body.coverLetter}});
        res.json(updatedJob);
    }catch(err){
        res.json({message:err.message});
    }
})
router.patch('/editExpertise/:jobId' , async(req , res) =>{
    try{
        const updatedJob = await Job.updateOne({_id:req.params.jobId},{$set:{skills:req.body.skills,experienceLevel:req.body.experienceLevel}});
        res.json(updatedJob);
    }catch(err){
        res.json({message:err.message});
    }
})
router.patch('/editVisibility/:jobId' , async(req , res) =>{
    try{
        const updatedJob = await Job.updateOne({_id:req.params.jobId},{$set:{visibility:req.body.visibility,freelancersNo:req.body.freelancersNo,talentPreference:req.body.talentPreference}});
        res.json(updatedJob);
    }catch(err){
        res.json({message:err.message});
    }
})
router.patch('/editBudget/:jobId' , async(req , res) =>{
    try{
        const updatedJob = await Job.updateOne({_id:req.params.jobId},{$set:{estimatedBudget:req.body.estimatedBudget}});
        res.json(updatedJob);
    }catch(err){
        res.json({message:err.message});
    }
})

//DELETE
router.delete('/deleteJob/:jobId' , async(req , res) =>{
    try{
        const removedJob = await Job.remove({_id:req.params.jobId})
        res.json(removedJob)
    }catch(err){
        res.json({message:err.message});
    }
})

//POST JOB POST LIKE OR DISLIKE
router.post('/like', async(req , res) =>{
  try {
    let likers = [];
    likers = await Job.find ({_id: req.body.jobId},{likers:1,_id:0});
    likers = likers[0].likers;
    likers.push(req.body.userId);
    const updatedJob = await Job.updateOne({_id:req.body.jobId},{$set:{likers:likers}});
    res.json(updatedJob);
  } catch(err){
    res.json({message:err.message});
  }
})
router.post('/dislike', async(req , res) =>{
  try {
    const dislikObj = {
      userId:req.body.userId,
      reason:req.body.reason
    }
    let dislikers = [];
    dislikers = await Job.find ({_id: req.body.jobId},{dislikers:1,_id:0});
    dislikers = dislikers[0].dislikers;
    console.log(dislikers)
    dislikers.push(dislikObj);
    const updatedJob = await Job.updateOne({_id:req.body.jobId},{$set:{dislikers:dislikers}});
    res.json(updatedJob);
  } catch(err){
    res.json({message:err.message});
  }
})
router.post('/unlike',async(req , res)=>{
  try {
    let likers = [];
    likers = await Job.find ({_id: req.body.jobId},{likers:1,_id:0});
    likers = likers[0].likers;
    newLikers = [];
    for(let i = 0; i < likers.length; i++){
      if(likers[i]!=req.body.userId){
        newLikers.push(likers[i]);
      }
    }
    console.log(newLikers);
    const updatedJob = await Job.updateOne({_id:req.body.jobId},{$set:{likers:newLikers}});
    res.json(updatedJob);
  } catch(err){
    res.json({message:err.message});
  }
})
router.post('/undislike',async(req , res)=>{
  try {
    let dislikers = [];
    dislikers = await Job.find ({_id: req.body.jobId},{dislikers:1,_id:0});
    console.log(dislikers)
    dislikers = dislikers[0].dislikers;
    newDislikers = [];
    for(let i = 0; i < dislikers.length; i++){
      if(dislikers[i].userId!=req.body.userId){
        newDislikers.push(dislikers[i]);
      }
    }
    console.log(newDislikers);
    const updatedJob = await Job.updateOne({_id:req.body.jobId},{$set:{dislikers:newDislikers}});
    res.json(updatedJob);
  } catch(err){
    res.json({message:err.message});
  }
})


module.exports = {router};
