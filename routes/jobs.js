const router = require('express').Router();
const Job = require('../models/job');
const uploadController = require("../controllers/jobpost-uploads");
const proposalUpload = require("../middleware/proposals-uploads").uploadFilesMiddleware;
const proposalFiles = require("../middleware/proposals-uploads").files
const jobUpload = require("../middleware/job-uploads");
const jobFiles = require("../middleware/job-uploads").files

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
//GET JOBS OF SPECIFIC CLIENT
router.get('/getclientjobs/:clientId', async (req, res) => {
  try {
    let jobs = await Job.find({clientId:req.params.clientId},{})
    res.json(jobs)
  } catch (err) {
    res.json({message:err.message});
  }
})
//POST JOB STORE
//UPLOAD FILES
router.post("/multiple-upload", uploadController.multipleUpload);
//DOWNLOD FILES
router.get('/downloadjobpostfiles/:name', async(req , res) => {
  const fileName = req.params.name;
const directoryPath = __basedir + "/../jobpost-uploads/";
res.download(directoryPath + fileName, fileName, (err) => {
  if (err) {
    res.status(500).send({
      message: "Could not download the file. " + err,
    });
  }
});
})
//STORING JOB 
router.post('/createjob' , async(req , res) =>{
    const job = await new Job({
        clientId:req.body.clientId,
        postName:req.body.postName,
        category:req.body.category,
        description:req.body.description,
        projectType:req.body.projectType,
        screaningQuestions:req.body.screaningQuestions,
        coverLetter:req.body.coverLetter,
        skills:req.body.skills,
        experienceLevel:req.body.experienceLevel,
        visibility:req.body.visibility,
        freelancersNo:req.body.freelancersNo,
        // talentPreference:req.body.talentPreference,
        //payType:req.body.payType,
        estimatedBudget:req.body.estimatedBudget,
        // duration:req.body.duration,
        // timeRequiremnt:req.body.timeRequiremnt,
        postStatus:1,
        proposals: {
          proposalsList: [],
          length:0
        },
        hiring: {
          hiringList: [],
          length:0
        }
    });
    try{
        const savedJob = await job.save();
        res.send(savedJob);
        consolr.log(savedJob);
    }catch(err){
        res.status(400).send(err)
    }
})
router.post('/createTitle', async(req , res) =>{
    const jobTitle = await new Job(
      {
        clientId:req.body.clientId,
        postName:req.body.postName,
        category:req.body.category,
        postStatus:0,
        proposals : {
          proposalsList: [],
          length:0
        },
        hiring : {
          hiringList: [],
          length:0
        }
      }
    ) 
    try{
      const savedJob = await jobTitle.save();
      res.send(savedJob);
    }catch(err){
      res.status(400).send(err)
  } 
})
router.patch('/createDescription', async(req , res) =>{
  try{
    const description = await Job.updateOne({_id:req.body.jobId},{$set:{description:req.body.description}});
    res.send(description);
  }catch(err){
    res.status(400).send(err)
} 
})
router.patch('/createDetails', async(req , res) =>{
  try{
    const details = await Job.updateOne({_id:req.body.jobId},{$set:{projectType:req.body.projectType,screaningQuestions:req.body.screaningQuestions,coverLetter:req.body.coverLetter}});
    res.send(details);
  }catch(err){
    res.status(400).send(err)
} 
})
router.patch('/createExpertise', async(req , res) =>{
  try{
    const expertise = await Job.updateOne({_id:req.body.jobId},{$set:{skills:req.body.skills,experienceLevel:req.body.experienceLevel}});
    res.send(expertise);
  }catch(err){
    res.status(400).send(err)
} 
})
router.patch('/createVisibility', async(req , res) =>{
  try{
    const visibility = await Job.updateOne({_id:req.body.jobId},{$set:{visibility:req.body.visibility,freelancersNo:req.body.freelancersNo}});
    res.send(visibility);
  }catch(err){
    res.status(400).send(err)
} 
})
router.patch('/createBudget', async(req , res) =>{
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

//DELETE THE JOB
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

//PROPOSALS
//CREATE PROPOSAL
router.post('/createproposal', async (req , res)=>{
  let newProposal = {
    userId:req.body.userId,
    proposal:{
      terms:{
        bid: req.body.bid,
        upworkFees: req.body.upworkFees,
        received: req.body.received
      },
      coverLetter:req.body.coverLetter,
      status:0  //submitted
    }
  };
  try {
    await proposalUpload(req, res);
    newProposal.proposal.proposalFiles = proposalFiles
    let proposals= await Job.find ({_id: req.body.jobId},{proposals:1,_id:0});
    console.log(proposals)
    proposals = proposals[0].proposals;
    if(proposals == null){
      proposals.proposalsList[0] = newProposal;
    }
    else{
      proposals.proposalsList.push(newProposal);
    }
    proposals.length = proposals.proposalsList.length;
    const updatedJob = await Job.updateOne({_id:req.body.jobId},{$set:{proposals:proposals}});
    res.json(updatedJob);
  } catch (err) {
    res.json({message:err.message});
  }
})
//WITHDRAW PROPOSAL
router.post('/withdrawproposal', async(req , res)=>{
  try{
    let proposals = await Job.findOne({_id:req.body.jobId},{proposals:1,_id:0});
    console.log(proposals)
    proposals = proposals.proposals;
    console.log(proposals)
    if(proposals == null){
      res.send('There are not proposals');
    }
    for(let i = 0; i < proposals.proposalsList.length; i++){
      if(proposals.proposalsList[i].userId == req.body.userId){
        proposals.proposalsList[i].proposal.status = 1; //withdraw
        const updatedJob = await Job.updateOne({_id:req.body.jobId},{$set:{proposals:proposals}});
        res.json(updatedJob);
      }
    }
    res.json('This Id does not exist');
  }catch(err){
    res.json({message:err.message});
  }
})
//DELETE ALL PROPOSALS OF SPECIFIC JOB
router.post('/deleteproposals', async(req , res)=>{
  try{
    let proposals = {
      proposalsList:[],
      length:0
    };
    const updatedJob = await Job.updateOne({_id:req.body.jobId},{$set:{proposals:proposals}}); 
    res.json(updatedJob); 
  }catch (err) {
    res.json({message:err.message});
  }
})
//DOWNLOAD PROPOSAL FILES
router.get('/downloadproposalfiles/:name', async(req , res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/../proposals-uploads/";
  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
})
//GET ALL PROPOSALS OF A SPECIFIC JOB
router.get('/getproposals/:jobId', async(req , res) =>{
  try {
    let proposals= await Job.find ({_id: req.body.jobId},{proposals:1,_id:0});
    proposals = proposals[0].proposals;
    res.json(proposals)
  } catch (err) {
    res.json({message:err.message});
  }
})
//GET ONE OF PROPOSALS
router.post('/getoneproposal', async(req , res) => {
  try {
    let proposals= await Job.find ({_id: req.body.jobId},{proposals:1,_id:0});
    proposals = proposals[0].proposals;
    let proposal;
    for(let i = 0; i < proposals.proposalsList.length; i++)
      {
        if(proposals.proposalsList[i].userId == req.body.userId){
          proposal = proposals.proposalsList[i]
        }
      }
    res.json(proposal)
  } catch (err) {
    res.json({message:err.message});
  }
})

//HIRING
router.post('/acceptproposal', async(req , res) => {
  try {
    let proposals= await Job.find ({_id: req.body.jobId},{proposals:1,_id:0});
    proposals = proposals[0].proposals;
    let proposal;
    for(let i = 0; i < proposals.proposalsList.length; i++){
      if(proposals.proposalsList[i].userId == req.body.userId){
        proposals.proposalsList[i].proposal.status = 2 //hired
        proposal = proposals.proposalsList[i]
      }
    }
    let updatedJob = await Job.updateOne({_id:req.body.jobId},{$set:{proposals:proposals}});
    let hiring = await Job.find ({_id: req.body.jobId},{hiring:1,_id:0});
    hiring = hiring[0].hiring;
    if(hiring == null){
      hiring.hiringList[0] = proposal;
    }
    else{
      hiring.hiringList.push(proposal);
    }
    hiring.length = hiring.hiringList.length;
    updatedJob = await Job.updateOne({_id:req.body.jobId},{$set:{hiring:hiring}});
    let job= await Job.find ({_id: req.body.jobId},{});
    console.log(job[0].freelancersNo);
    console.log(hiring.hiringList.length);
    if(job[0].freelancersNo == hiring.length){
      updatedJob = await Job.updateOne({_id:req.body.jobId},{$set:{postStatus:2}}); //finished 
      for(let i = 0; i < proposals.proposalsList.length; i++){
        if(proposals.proposalsList[i].proposal.status == 0){
          proposals.proposalsList[i].proposal.status = 3;  //job not assigned to it
          updatedJob = await Job.updateOne({_id:req.body.jobId},{$set:{proposals:proposals}});
        }
      }
    }
    res.json(updatedJob);
  } catch (err) {
    res.json({message:err.message});
  }
})
//DELETE ALL HIRINGS
router.post('/deletehirings', async(req , res)=>{
  try{
    let hiring = {
      hiringList:[],
      length:0
    };
    const updatedJob = await Job.updateOne({_id:req.body.jobId},{$set:{hiring:hiring}}); 
    res.json(updatedJob);hiring
  }catch (err) {
    res.json({message:err.message});
  }
})

//RECEIVE JOB
router.post('/receivejob', async(req , res) => {
   let receiveJob = {
     message:req.body.message,
  }
  try {
    await proposalUpload(req, res);
    receiveJob.jobFiles = jobFiles
    let hiring = await Job.find ({_id: req.body.jobId},{hiring:1,_id:0});
    let proposals = await Job.find ({_id: req.body.jobId},{proposals:1,_id:0});
    console.log(proposals)
    console.log(hiring)
    hiring = hiring[0].hiring;
    console.log(hiring)
    proposals = proposals[0].proposals;
    console.log(proposals);
    for(let i = 0; i < hiring.length; i++){
      if(hiring[i].userId == req.body.userId){
        hiring[i].proposal.status = 3; //job finished
        console.log(hiring[i])
        hiring[i].receiveJob = receiveJob
      }
    }
    for(let i = 0; i < proposals.length; i++){
      if(proposals[i].userId == req.body.userId){
        proposals[i].proposal.status = 3; //job finished
        console.log(proposals[i])
      }
    }
    updatedJob = await Job.updateOne({_id:req.body.jobId},{$set:{proposals:proposals, hiring:hiring}}); //finished 
    console.log(hiring)
    console.log(proposals)
    res.json(hiring)
  } catch (err) {
    res.json({message:err.message});
  }
})
router.get('/downloadjobfiles/:name', async(req , res) => {
  const fileName = req.params.name;
const directoryPath = __basedir + "/../job-uploads/";
res.download(directoryPath + fileName, fileName, (err) => {
  if (err) {
    res.status(500).send({
      message: "Could not download the file. " + err,
    });
  }
});
})


module.exports = {router};
