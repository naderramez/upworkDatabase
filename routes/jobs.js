const fs = require('fs');
const router = require("express").Router();
const Job = require("../models/job");
const User = require("../models/user");
const File = require("../models/files");
const uploadController = require("../controllers/jobpost-uploads");
const proposalUpload = require("../middleware/proposals-uploads")
  .uploadFilesMiddleware;
const proposalFiles = require("../middleware/proposals-uploads").files;
const jobUpload = require("../middleware/job-uploads").uploadFilesMiddleware;
const jobFiles = require("../middleware/job-uploads").files;
const JobPostUpload = require("../middleware/jobpost-uploads")
  .uploadFilesMiddleware;
const jobPostFiles = require("../middleware/jobpost-uploads").files;
const upload = require("../middleware/profile-images").upload;
const sharp = require('sharp');
const path = require("path");

//GET ALL JOBS WITH LIKERS AND DISLIKERS STATUS
router.post("/getalljobs", async (req, res) => {
  try {
    var jobs = await Job.find();
    var allJobsData = [];
    for(let j of jobs){
      let status = 0;
      var user = await User.findOne({_id:j.clientId},{country:1,_id:0})
      for (var i = 0; i < j.likers.length; i++) {
        if (j.likers[i] == req.body.userId) {
          status = 1;
        }
      }
      
      let reason = 0;
      for (var i = 0; i < j.dislikers.length; i++) {
        if (j.dislikers[i].userId == req.body.userId) {
          status = 2;
          reason = j.dislikers[i].reason;
        }
      }
      if(reason){
        j = {...j._doc, clientCountry:user.country, status:status, reason:reason}
      }
      else{
        j = {...j._doc, clientCountry:user.country, status:status}
      }
      allJobsData.push(j)
    }
    let sendedData = [];
    for(let j = allJobsData.length-1;j > 0; j--){
      sendedData.push(allJobsData[j]);
      
    }
      res.send(sendedData);
  } catch (err) {
    res.json({ message: err.message });
  }
});
//GET ONE JOB WITH LIKER AND DISLIKER STATUS
router.post("/getonejob", async (req, res) => {
  try {
    const likers = await Job.find(
      { _id: req.body.jobId },
      { likers: 1, _id: 0 }
    );
    const dislikers = await Job.find(
      { _id: req.body.jobId },
      { dislikers: 1, _id: 0 }
    );
    var job = await Job.find({ _id: req.body.jobId }, {});
    var status = 0;
    for (var i = 0; i < likers.length; i++) {
      if (likers[i] == req.body.userId) {
        status = 1;
      }
    }
    for (var i = 0; i < dislikers.length; i++) {
      if (dislikers[i].id == req.body.userId) {
        status = 2;
      }
    }
    let currentJobsCount = 0;
    let finishedJobsCount = 0;
    let allJobsPosted = 0;
    let user = await User.findOne({_id: job[0].clientId});
    let jobs = await Job.find({ clientId: job[0].clientId }, {});
    for(let i = 0; i< jobs.length; i++) {
      if(jobs[i].postStatus === 1){
        currentJobsCount++;
        allJobsPosted++;
      }
      if(jobs[i].postStatus === 2){
        finishedJobsCount++;
        allJobsPosted++;
      }
    }
    let returnData = {
      country: user.country,
      allJobsPosted: allJobsPosted,
      currentOpenJobs: currentJobsCount,
      finishedJobs: finishedJobsCount
    };
    const newJob = [{...job[0]._doc, ...returnData,status: status}];
    res.send(newJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});
//GET JOBS OF SPECIFIC CLIENT
router.get("/getclientjobs/:clientId", async (req, res) => {
  try {
    let jobs = await Job.find({ clientId: req.params.clientId }, {});
    res.json(jobs);
  } catch (err) {
    res.json({ message: err.message });
  }
});
//GET CLIENT DATA
router.post('/getclientdata',async (req, res) => {
  try {
    let clientData = await User.findOne({_id:req.body.clientId});
    res.json(clientData);
  } catch (err) {
    res.json({ message: err.message });
  }
})
//GET CLIENT DATA TO JOB PAGE
router.post("/getclientjobdata", async (req, res) => {
  let currentJobsCount = 0;
  let finishedJobsCount = 0;
  let allJobsPosted = 0;
  try {
    let user = await User.findOne({_id:req.body.clientId});
    let jobs = await Job.find({ clientId: req.body.clientId }, {});
    for(let i = 0; i< jobs.length; i++) {
      if(jobs[i].postStatus === 1){
        currentJobsCount++;
        allJobsPosted++;
      }
      if(jobs[i].postStatus === 2){
        finishedJobsCount++;
        allJobsPosted++;
      }
    }
    let returnData = {
      country: user.country,
      allJobsPosted: allJobsPosted,
      currentOpenJobs: currentJobsCount,
      finishedJobs: finishedJobsCount
    };
    res.send(returnData)
  } catch (err) {
    res.json({ message: err.message });
  }
})
//POST JOB STORE
//UPLOAD FILES
///////////////////////HERE//////////////////////////////
router.post("/uploadjobpostfiles", uploadController.multipleUpload);

//DOWNLOD FILES
router.get("/downloadjobpostfiles/:name", async (req, res) => {
  const fileName = req.params.name;
  const directoryPath = `${ __dirname} + "/../jobpost-uploads/`;
  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
});
//STORING JOB
router.post("/createjob", async (req, res) => {
  try {
    JobPostUpload(req, res);
    const job = await new Job({
      additionalFiles: jobPostFiles,
      clientId: req.body.clientId,
      postName: req.body.postName,
      category: req.body.category,
      description: req.body.description,
      projectType: req.body.projectType,
      screaningQuestions: req.body.screaningQuestions,
      coverLetter: req.body.coverLetter,
      skills: req.body.skills,
      experienceLevel: req.body.experienceLevel,
      visibility: req.body.visibility,
      freelancersNo: req.body.freelancersNo,
      estimatedBudget: req.body.estimatedBudget,
      postStatus: 1,
      proposals: {
        proposalsList: [],
        length: 0,
        hiringLength:0,
        files:[]
      }
    });
    const savedJob = await job.save();
    res.send(savedJob);
  } catch (err) {
    res.status(400).send(err);
  }
});
router.post("/createTitle", async (req, res) => {
  const jobTitle = await new Job({
    clientId: req.body.clientId,
    postName: req.body.postName,
    category: req.body.category,
    postStatus: 0,
    proposals: {
      proposalsList: [],
      length: 0,
      hiringLength:0,
      files:[]
    }
  });
  try {
    const savedJob = await jobTitle.save();
    res.send(savedJob);
  } catch (err) {
    res.status(400).send(err);
  }
});
router.patch("/createDescription", async (req, res) => {
  try {
    const description = await Job.updateOne(
      { _id: req.body.jobId },
      { $set: { description: req.body.description } }
    );
    res.send(description);
  } catch (err) {
    res.status(400).send(err);
  }
});
router.patch("/createDetails", async (req, res) => {
  try {
    const details = await Job.updateOne(
      { _id: req.body.jobId },
      {
        $set: {
          projectType: req.body.projectType,
          screaningQuestions: req.body.screaningQuestions,
          coverLetter: req.body.coverLetter,
        },
      }
    );
    res.send(details);
  } catch (err) {
    res.status(400).send(err);
  }
});
router.patch("/createExpertise", async (req, res) => {
  try {
    const expertise = await Job.updateOne(
      { _id: req.body.jobId },
      {
        $set: {
          skills: req.body.skills,
          experienceLevel: req.body.experienceLevel,
        },
      }
    );
    res.send(expertise);
  } catch (err) {
    res.status(400).send(err);
  }
});
router.patch("/createVisibility", async (req, res) => {
  try {
    const visibility = await Job.updateOne(
      { _id: req.body.jobId },
      {
        $set: {
          visibility: req.body.visibility,
          freelancersNo: req.body.freelancersNo,
        },
      }
    );
    res.send(visibility);
  } catch (err) {
    res.status(400).send(err);
  }
});
router.patch("/createBudget", async (req, res) => {
  try {
    const budget = await Job.updateOne(
      { _id: req.body.jobId },
      { $set: { estimatedBudget: req.body.estimatedBudget } }
    );
    res.send(budget);
  } catch (err) {
    res.status(400).send(err);
  }
});
router.patch("/postJob", async (req, res) => {
  try {
    const budget = await Job.updateOne(
      { _id: req.body.jobId },
      { $set: { postStatus: 1 } }
    );
    res.send(budget);
  } catch (err) {
    res.status(400).send(err);
  }
});

//PATCH OR UPDATE JOB POST
router.patch("/editTitle/:jobId", async (req, res) => {
  try {
    const updatedJob = await Job.updateOne(
      { _id: req.params.jobId },
      { $set: { postName: req.body.postName, category: req.body.category } }
    );
    res.json(updatedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});
router.patch("/editDescription/:jobId", async (req, res) => {
  try {
    const updatedJob = await Job.updateOne(
      { _id: req.params.jobId },
      { $set: { description: req.body.description } }
    );
    res.json(updatedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});
router.patch("/editDetails/:jobId", async (req, res) => {
  try {
    const updatedJob = await Job.updateOne(
      { _id: req.params.jobId },
      {
        $set: {
          projectType: req.body.projectType,
          screaningQuestions: req.body.screaningQuestions,
          coverLetter: req.body.coverLetter,
        },
      }
    );
    res.json(updatedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});
router.patch("/editExpertise/:jobId", async (req, res) => {
  try {
    const updatedJob = await Job.updateOne(
      { _id: req.params.jobId },
      {
        $set: {
          skills: req.body.skills,
          experienceLevel: req.body.experienceLevel,
        },
      }
    );
    res.json(updatedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});
router.patch("/editVisibility/:jobId", async (req, res) => {
  try {
    const updatedJob = await Job.updateOne(
      { _id: req.params.jobId },
      {
        $set: {
          visibility: req.body.visibility,
          freelancersNo: req.body.freelancersNo,
          talentPreference: req.body.talentPreference,
        },
      }
    );
    res.json(updatedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});
router.patch("/editBudget/:jobId", async (req, res) => {
  try {
    const updatedJob = await Job.updateOne(
      { _id: req.params.jobId },
      { $set: { estimatedBudget: req.body.estimatedBudget } }
    );
    res.json(updatedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});

//DELETE THE JOB
router.delete("/deleteJob/:jobId", async (req, res) => {
  try {
    const removedJob = await Job.remove({ _id: req.params.jobId });
    res.json(removedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});

//POST JOB POST LIKE OR DISLIKE
router.post("/like", async (req, res) => {
  try {
    let likers = [];
    likers = await Job.find({ _id: req.body.jobId }, { likers: 1, _id: 0 });
    likers = likers[0].likers;
    likers.push(req.body.userId);
    const updatedJob = await Job.updateOne(
      { _id: req.body.jobId },
      { $set: { likers: likers } }
    );
    res.json(updatedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});
router.post("/dislike", async (req, res) => {
  try {
    const dislikObj = {
      userId: req.body.userId,
      reason: req.body.reason,
    };
    let dislikers = [];
    dislikers = await Job.find(
      { _id: req.body.jobId },
      { dislikers: 1, _id: 0 }
    );
    dislikers = dislikers[0].dislikers;
    dislikers.push(dislikObj);
    const updatedJob = await Job.updateOne(
      { _id: req.body.jobId },
      { $set: { dislikers: dislikers } }
    );
    res.json(updatedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});
router.post("/unlike", async (req, res) => {
  try {
    let likers = [];
    likers = await Job.find({ _id: req.body.jobId }, { likers: 1, _id: 0 });
    likers = likers[0].likers;
    newLikers = [];
    for (let i = 0; i < likers.length; i++) {
      if (likers[i] != req.body.userId) {
        newLikers.push(likers[i]);
      }
    }
    const updatedJob = await Job.updateOne(
      { _id: req.body.jobId },
      { $set: { likers: newLikers } }
    );
    res.json(updatedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});
router.post("/undislike", async (req, res) => {
  try {
    let dislikers = [];
    dislikers = await Job.find(
      { _id: req.body.jobId },
      { dislikers: 1, _id: 0 }
    );
    dislikers = dislikers[0].dislikers;
    newDislikers = [];
    for (let i = 0; i < dislikers.length; i++) {
      if (dislikers[i].userId != req.body.userId) {
        newDislikers.push(dislikers[i]);
      }
    }
    const updatedJob = await Job.updateOne(
      { _id: req.body.jobId },
      { $set: { dislikers: newDislikers } }
    );
    res.json(updatedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});
//SAVE IMAGE
router.post("/saveimage",upload.single('file'),async (req, res) => {
  try {
    console.log(req)
    // if (req.file) {
    //   return res.send(`You must select at least 1 file.`);
    // }
    const buffer = await sharp(req.file.buffer).resize({ width: 500, height: 500}).png().toBuffer()
    let user = await User.updateOne({_id:req.headers.userid},{$set:{userImage:buffer}});
    let updateduser = await User.findOne({_id: req.headers.userid});
    console.log(updateduser);
    return res.send(updateduser);
  } catch (error) {
    console.log(error);
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.send("Too many files to upload.");
    }
    return res.send(`Error when trying upload many files: ${error}`);
  }
})
//DELETE IMAGE 
router.delete('/deleteimage', async (req, res) => {
  try {
  const user = await User.findById(req.body.id);
  user.userImage = undefined;
  user.save()
  res.send(user)
  } catch (e) {
  res.status(400).send(e)
  }
})
//GET IMAGE
router.get('/getimage/:userId', async (req, res) => {
  try{
  const user = await User.findById(req.params.userId)
  if (!user || !user.userImage) {
  throw new Error()
  }
  //response header, use set
  res.set('Content-Type', 'image/png')
  res.send(user.userImage)
  } catch(e) {
  res.status(404).send()
  }
})
 
//PROPOSALS
//CREATE PROPOSAL
router.post("/createproposal", async (req, res) => {
  let newProposal = {
    userId: req.body.userId,
    proposal: {
      terms: {
        bid: req.body.bid,
        upworkFees: req.body.upworkFees,
        received: req.body.received,
      },
      coverLetter: req.body.coverLetter,
      status: 0, //submitted
    },
  };
  try {
    let proposals = await Job.find(
      { _id: req.body.jobId },
      { proposals: 1, _id: 0 }
    );
    proposals = proposals[0].proposals;
    if (proposals == null) {
      proposals.proposalsList[0] = newProposal;
    } else {
      proposals.proposalsList.push(newProposal);
    }
    proposals.length = proposals.proposalsList.length;
    const updatedJob = await Job.updateOne(
      { _id: req.body.jobId },
      { $set: { proposals: proposals } }
    );
    res.json(updatedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});
router.post('/uploadproposlsfiles', async (req, res)=>{
  try {
    await proposalUpload(req, res);
    console.log("files in controllers",proposalFiles);
    console.log("req.body",req.body);
    if(req.files){
      for(let i=0; i<req.files.length; i++){
        let read = fs.createReadStream(req.files[i].path)
        let buffer;
        read.on('data', async (data)=>{
          count++;
          if(count != i+1){
            return
          }
          theFiles = proposalFiles[i];
          buffer = data;
          const newFile = await {
            data:  buffer,
            fileName: theFiles,
            type: req.files[i].mimetype
          }
          let file = new File(newFile)
          file.save();
        })
      }
    }
    console.log(req.headers)
    let proposals = await Job.find(
      { _id: req.headers.jobid },
      { proposals: 1, _id: 0 }
    );
    console.log("proposalFiles", proposalFiles)
    allData = {
      files:[],
      userId:req.headers.userid
    }
    for(let i = 0; i < proposalFiles.length; i++) {
      allData.files[i] = proposalFiles[i]
    }
    console.log(allData)
    proposals = proposals[0].proposals;
    proposals.proposalFiles.push(allData);
    const updatedJob = await Job.updateOne(
      { _id: req.headers.jobid },
      { $set: { proposals: proposals } }
    ); 
    const updated = await Job.findOne({_id: req.headers.jobid})
    res.send(updated);
  } catch (error) {
    console.log(error);
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.send("LIMIT_UNEXPECTED_FILE.");
    }
    return res.send(`Error when trying upload many files: ${error}`);
  }
});
//DOWNLOAD PROPOSAL FILES
router.get("/downloadproposalfiles/:name", async (req, res) => {
  const fileName = req.params.name;
  const directoryPath = `${ __dirname} + /../proposals-uploads/`;
  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
});
//WITHDRAW PROPOSAL
router.post("/withdrawproposal", async (req, res) => {
  try {
    let proposals = await Job.findOne(
      { _id: req.body.jobId },
      { proposals: 1, _id: 0 }
    );
    proposals = proposals.proposals;
    if (proposals == null) {
      res.send("There are not proposals");
    }
    for (let i = 0; i < proposals.proposalsList.length; i++) {
      if (proposals.proposalsList[i].userId == req.body.userId) {
        proposals.proposalsList[i].proposal.status = 1; //withdraw
        const updatedJob = await Job.updateOne(
          { _id: req.body.jobId },
          { $set: { proposals: proposals } }
        );
        res.json(updatedJob);
      }
    }
    res.json("This Id does not exist");
  } catch (err) {
    res.json({ message: err.message });
  }
});
//DELETE ALL PROPOSALS OF SPECIFIC JOB
router.post("/deleteproposals", async (req, res) => {
  try {
    let proposals = {
      proposalsList: [],
      length: 0,
    };
    const updatedJob = await Job.updateOne(
      { _id: req.body.jobId },
      { $set: { proposals: proposals } }
    );
    res.json(updatedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});
//GET ALL PROPOSALS OF A SPECIFIC JOB
router.post("/getproposals/:jobId", async (req, res) => {
  try {
    let proposals = await Job.find(
      { _id: req.body.jobId },
      { proposals: 1, _id: 0 }
    );
    proposals = proposals[0].proposals;
    res.json(proposals);
  } catch (err) {
    res.json({ message: err.message });
  }
});
//GET ONE OF PROPOSALS
router.post("/getoneproposal", async (req, res) => {
  try {
    let proposals = await Job.find(
      { _id: req.body.jobId },
      { proposals: 1, _id: 0 }
    );
    proposals = proposals[0].proposals;
    let proposal;
    for (let i = 0; i < proposals.proposalsList.length; i++) {
      if (proposals.proposalsList[i].userId == req.body.userId) {
        proposal = proposals.proposalsList[i];
      }
    }
    res.json(proposal);
  } catch (err) {
    res.json({ message: err.message });
  }
});
//GET SPECIFIC FREELANCER'S PROPOSALS
router.post('/getmyproposals', async (req, res) => {
  try {
    let jobsProposals = await Job.find({},{ proposals: 1, _id: 1});
    let myProposalsJob = [];
    console.log(req.body)
    for(let i = 0; i < jobsProposals.length; i++) {
      if(jobsProposals[i].proposals.length > 0) {
        for(let j = 0; j < jobsProposals[i].proposals.length; j++){
          if(jobsProposals[i].proposals.proposalsList[j].userId == req.body.userId){
            let job = await Job.find({ _id: jobsProposals[i]._id }, {});
            let proposals ={myjob: job[0] ,...jobsProposals[i].proposals.proposalsList[j]} 
            myProposalsJob.push(proposals)
          }
        }
      }
    }
    res.send(myProposalsJob)
  } catch (err) {
    res.json({ message: err.message });
  }
})
//GET ONE PROPOSAL OF FREELANCER'S PROPOSALS
router.post('/getoneofmyproposals', async (req, res) => {
  try {
    console.log(req.body)
    let myProposalJob = await Job.find({_id: req.body.jobId}, {proposals:1, _id:0});
    myProposalJob = myProposalJob[0].proposals;
    let myJob = await Job.find({_id: req.body.jobId});
    let myProposal = [];
    for(let i = 0; i < myProposalJob.length; i++) {
      if(myProposalJob.proposalsList[i].userId == req.body.userId) {
        let proposal = {myJob: myJob[0], ...myProposalJob.proposalsList[i]}
        myProposal.push(proposal);
      }
    }
    let user = await User.findOne({_id: myJob[0].clientId});
    let jobs = await Job.find({ clientId: myJob[0].clientId }, {});
    let currentJobsCount = 0;
    let finishedJobsCount = 0;
    let allJobsPosted = 0;
    for(let i = 0; i< jobs.length; i++) {
      if(jobs[i].postStatus === 1){
        currentJobsCount++;
        allJobsPosted++;
      }
      if(jobs[i].postStatus === 2){
        finishedJobsCount++;
        allJobsPosted++;
      }
    }
    let returnData = {
      country: user.country,
      allJobsPosted: allJobsPosted,
      currentOpenJobs: currentJobsCount,
      finishedJobs: finishedJobsCount
    };
    myProposal = {myProposal, clientData: returnData};
    res.send(myProposal);
  } catch (err) {
    res.json({ message: err.message });
  }
})
//HIRING
router.post("/acceptproposal", async (req, res) => {
  try {
    let proposals = await Job.find(
      { _id: req.body.jobId },
      { proposals: 1, _id: 0 }
    );
    let proposalNo = 0;
    console.log(proposals)
    proposals = proposals[0].proposals;
    console.log(proposals)
    let proposal;
    for (let i = 0; i < proposals.proposalsList.length; i++) {
      if (proposals.proposalsList[i].userId == req.body.userId) {
        proposals.proposalsList[i].proposal.status = 2; 
        proposal = proposals.proposalsList[i];
        proposalNo = i;
      }
    }
    let updatedJob = await Job.updateOne(
      { _id: req.body.jobId },
      { $set: { proposals: proposals } }
    );
    let count = 0;
    for(let i = 0; i <proposals.proposalsList.length; i++){
      if(proposals.proposalsList[i].proposal.status == 2){
        count++;
      }
    }
    proposals.hiringLength = count;
    console.log(proposals)
    let job = await Job.find({ _id: req.body.jobId }, {});
    if (job[0].freelancersNo == count) {
      updatedJob = await Job.updateOne(
        { _id: req.body.jobId },
        { $set: { postStatus: 2 } }
      ); //finished
      for (let i = 0; i < proposals.proposalsList.length; i++) {
        if (proposals.proposalsList[i].proposal.status == 0) {
          proposals.proposalsList[i].proposal.status = -1; 
        }
      }
    }
    ///////////PAYMENT///////////
    let client = await User.findOne({_id: job[0].clientId},{paymentAccount:1,_id:0});
    let clientAccount = client.paymentAccount;
    if(clientAccount.totalAmount < job[0].proposals.proposalsList[proposalNo].proposal.terms.bid){
      res.send("Your payment account is less than bid")
    }
    clientAccount.holdAmount += job[0].proposals.proposalsList[proposalNo].proposal.terms.bid;
    clientAccount.availableAmount -= clientAccount.holdAmount;
    console.log(clientAccount);
    let freelancer = await User.findOne({_id: req.body.userId},{paymentAccount:1,_id:0});
    let freelancerAccount = freelancer.paymentAccount;
    freelancerAccount.holdAmount += job[0].proposals.proposalsList[proposalNo].proposal.terms.received;
    freelancerAccount.availableAmount = Math.abs(freelancerAccount.totalAmount - freelancerAccount.holdAmount);
    await User.updateOne({ _id: job[0].clientId },{$set: {paymentAccount: clientAccount},});
    await User.updateOne({ _id: req.body.userId },{$set: {paymentAccount: freelancerAccount},});
    updatedJob = await Job.updateOne({ _id: req.body.jobId },{ $set: { proposals: proposals } });
    res.json(updatedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});
router.post("/resetpayment", async (req, res) => {
  try {
    let clientPayment = {
      totalAmount:5000,
      holdAmount:0,
      availableAmount:5000
    }
    let freelancerPayment = {
      totalAmount:0,
      holdAmount:0,
      availableAmount:0
    }
    let user= await User.find({});
    console.log(user)
    for(let i = 0; i < user.length; i++){
      if(user[i].paymentAccount){

      if(user[i].type == "freelancer"){
        await User.updateOne(
          { _id: user[i]._id},
          {
            $set: {
              paymentAccount: freelancerPayment
            },
          }
        );
      }
      else{
        await User.updateOne({ _id: user[i]._id},{$set: {paymentAccount: clientPayment},});
      }
    }
  }
    res.json(user)
  } catch (err) {
    res.json({ message: err.message });
  }
})
//RECEIVE JOB
router.post("/receivejob", async (req, res) => {
  try {
    let job = await Job.find({ _id: req.body.jobId }, {});
    let proposals = await Job.find({ _id: req.body.jobId },{ proposals: 1, _id: 0 });
    let hiringNo = 0;
    proposals = proposals[0].proposals;
    for (let i = 0; i < proposals.length; i++) {
      if (proposals.proposalsList[i].userId == req.body.userId) {
        proposals.proposalsList[i].proposal.status = 3; //job finished
        hiringNo = i;
      }
    }
    updatedJob = await Job.updateOne({ _id: req.body.jobId },{ $set: { proposals: proposals } }); 
    ///////////PAYMENT///////////
    let sendedJob = await Job.findOne({ _id: req.body.jobId});
    // let client = await User.findOne({_id: job[0].clientId},{paymentAccount:1,_id:0});
    // let clientAccount = client.paymentAccount;
    // clientAccount.holdAmount -= job[0].proposals.proposalsList[hiringNo].proposal.terms.bid;
    // clientAccount.totalAmount -= job[0].proposals.proposalsList[hiringNo].proposal.terms.bid;
    // let freelancer = await User.findOne({_id: req.headers.userid},{paymentAccount:1,_id:0});
    // let freelancerAccount = freelancer.paymentAccount;
    // freelancerAccount.holdAmount -= job[0].proposals.proposalsList[hiringNo].proposal.terms.received;
    // freelancerAccount.totalAmount += job[0].proposals.proposalsList[hiringNo].proposal.terms.received;
    // freelancerAccount.availableAmount = Math.abs(freelancerAccount.totalAmount - freelancerAccount.holdAmount);
    // await User.updateOne({ _id: job[0].clientId },{$set: {paymentAccount: clientAccount},});
    // await User.updateOne({ _id: req.body.userId },{$set: {paymentAccount: freelancerAccount},});
    res.json(sendedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});
router.post('/uploadjobfiles',async (req, res)=>{
  try {
    
      await jobUpload(req, res);
      console.log("files in upload job", jobFiles)
      console.log("job files", jobFiles)
    let count = 0;
      for(let i=0; i<req.files.length; i++){
        let read = fs.createReadStream(req.files[i].path)
        let buffer;
        console.log("i before", i)
        read.on('data', async (data)=>{
          count++;
          console.log("count", count)
          console.log("i", i)
          if(count != i+1){
            return
          }
          theFiles = jobFiles[i];
          buffer = data;
          const newFile = await {
            data:  buffer,
            fileName: theFiles,
            type: req.files[i].mimetype
          }
          let file = new File(newFile)
          file.save();
        })
    }
    let receivedJob = {
      message: req.headers.message,
      receivedJobFiles : jobFiles
    };
    console.log(receivedJob)
    let proposals = await Job.find(
      { _id: req.headers.jobid },
      { proposals: 1, _id: 0 }
    );
    console.log("pro", proposals)
    proposals = proposals[0].proposals;
    let hiringNo = 0;
    for(let i = 0; i < proposals.proposalsList.length; i++) {
      if(proposals.proposalsList[i].userId == req.headers.userid){
        proposals.proposalsList[i] = {...proposals.proposalsList[i], receivedJob: receivedJob }
        proposals.proposalsList[i].proposal.status = 3; //job finished
        hiringNo = i;
      }
    }
    await Job.updateOne(
      { _id: req.headers.jobid },
      { $set: { proposals: proposals } }
    ); 
    // const updated = await Job.findOne({_id: req.headers.jobid})
    let job = await Job.findOne({ _id: req.headers.jobid});
    //PAYMENT
    let client = await User.findOne({_id: job.clientId},{paymentAccount:1,_id:0});
    let clientAccount = client.paymentAccount;
    clientAccount.holdAmount -= job.proposals.proposalsList[hiringNo].proposal.terms.bid;
    clientAccount.totalAmount -= job.proposals.proposalsList[hiringNo].proposal.terms.bid;
    let freelancer = await User.findOne({_id: req.headers.userid},{paymentAccount:1,_id:0});
    let freelancerAccount = freelancer.paymentAccount;
    freelancerAccount.holdAmount -= job.proposals.proposalsList[hiringNo].proposal.terms.received;
    freelancerAccount.totalAmount += job.proposals.proposalsList[hiringNo].proposal.terms.received;
    freelancerAccount.availableAmount = Math.abs(freelancerAccount.totalAmount - freelancerAccount.holdAmount);
    await User.updateOne({ _id: job.clientId },{$set: {paymentAccount: clientAccount},});
    await User.updateOne({ _id: req.headers.userid },{$set: {paymentAccount: freelancerAccount},});
    console.log()
    res.send(job);   
  } catch (error) {
    console.log(error);
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.send("LIMIT_UNEXPECTED_FILE.");
    }
    return res.send(`Error when trying upload many files: ${error}`);
  }
})
router.get("/downloadjobfiles/:name", async (req, res) => {
  const fileName = req.params.name;
  console.log(fileName);
  console.log( __dirname)
  const directoryPath = `${ __dirname}/../job-uploads/`;
  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
});
router.get("/downloadfiles/:name",async (req, res)=>{
  const fileName = req.params.name;
  const file = await File.findOne({fileName: fileName});
  console.log(file)
  res.set('Content-Type', file.type);
  var fileContents = Buffer.from(file.data, 'base64');
  fs.writeFile('Downloads', fileContents, function() {
    res.set('Content-Type', file.type);
    res.download('Downloads', fileName, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not download the file. " + err,
        });
      }
    });
  })
  //res.send(fileContents)
})


module.exports = { router };
