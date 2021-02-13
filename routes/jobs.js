const router = require("express").Router();
const Job = require("../models/job");
const User = require("../models/user");
const uploadController = require("../controllers/jobpost-uploads");
const proposalUpload = require("../middleware/proposals-uploads")
  .uploadFilesMiddleware;
const proposalFiles = require("../middleware/proposals-uploads").files;
const jobUpload = require("../middleware/job-uploads");
const jobFiles = require("../middleware/job-uploads").files;
const JobPostUpload = require("../middleware/jobpost-uploads")
  .uploadFilesMiddleware;
const jobPostFiles = require("../middleware/jobpost-uploads").files;

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
    console.log(sendedData)
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
////////////////////////هنااااااااااااااا///////////////////////////////
router.post("/multiple-upload", uploadController.multipleUpload);

//DOWNLOD FILES
router.get("/downloadjobpostfiles/:name", async (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/../jobpost-uploads/";
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
  const job = await new Job({
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
    // talentPreference:req.body.talentPreference,
    //payType:req.body.payType,
    estimatedBudget: req.body.estimatedBudget,
    // duration:req.body.duration,
    // timeRequiremnt:req.body.timeRequiremnt,
    postStatus: 1,
    proposals: {
      proposalsList: [],
      length: 0,
    },
    hiring: {
      hiringList: [],
      length: 0,
    },
  });
  try {
    const savedJob = await job.save();
    res.send(savedJob);
    consolr.log(savedJob);
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
    },
    hiring: {
      hiringList: [],
      length: 0,
    },
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
router.post("/saveimage",async (req, res) => {
  try {
    const updatedUser = await User.updateOne(
      console.log(req.body),
      console.log(req.body.image),
      { _id: req.body.userId },
      { $set: { userImage: req.body.image } }
    );
    let user = await User.findOne(
      { _id: req.body.userId }
    );
    res.send(user);
  } catch (err) {
    res.json({message: err.message})
  }
})
router.get("/getimage/:userId",async (req, res) => {
  try {
    let user = await User.findOne(
      { _id: req.params.userId },{userImage:1, _id:0}
    );
    res.send(user);
  } catch (err) {
    res.json({message: err.message})
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
    console.log(req)
    if (req.files.length <= 0) {
      return res.send(`You must select at least 1 file.`);
    }
    console.log(req.files.originalname);
  } catch (error) {
    console.log(error);
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.send("Too many files to upload.");
    }
    return res.send(`Error when trying upload many files: ${error}`);
  }
})
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
//DOWNLOAD PROPOSAL FILES
router.get("/downloadproposalfiles/:name", async (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/../proposals-uploads/";
  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
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
    let myProposalJob = await Job.find({_id: req.body.jobId}, {proposals:1, _id:0});
    myProposalJob = myProposalJob[0].proposals;
    let myJob = await Job.find({_id: req.body.jobId});
    let myProposal = [];
    console.log(myProposalJob.length)
    for(let i = 0; i < myProposalJob.length; i++) {
      console.log(myProposalJob.proposalsList[i].userId == req.body.userId)
      if(myProposalJob.proposalsList[i].userId == req.body.userId) {
        let proposal = {myJob: myJob[0], ...myProposalJob.proposalsList[i]}
        myProposal.push(proposal);
        console.log(proposal)
      }
    }
    let user = await User.findOne({_id: myJob[0].clientId});
    let jobs = await Job.find({ clientId: myJob[0].clientId }, {});
    let currentJobsCount = 0;
    let finishedJobsCount = 0;
    let allJobsPosted = 0;
    console.log(user)
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
    console.log(myProposal);
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
    proposals = proposals[0].proposals;
    let proposal;
    for (let i = 0; i < proposals.proposalsList.length; i++) {
      if (proposals.proposalsList[i].userId == req.body.userId) {
        proposals.proposalsList[i].proposal.status = 2; //hired
        proposal = proposals.proposalsList[i];
        proposalNo = i;
      }
      else{
        proposals.proposalsList[i].proposal.status = -1;
      }
    }
    let updatedJob = await Job.updateOne(
      { _id: req.body.jobId },
      { $set: { proposals: proposals } }
    );
    let hiring = await Job.find({ _id: req.body.jobId }, { hiring: 1, _id: 0 });
    hiring = hiring[0].hiring;
    if (hiring == null) {
      hiring.hiringList[0] = proposal;
    } else {
      hiring.hiringList.push(proposal);
    }
    hiring.length = hiring.hiringList.length;
    updatedJob = await Job.updateOne(
      { _id: req.body.jobId },
      { $set: { hiring: hiring } }
    );
    let job = await Job.find({ _id: req.body.jobId }, {});
    if (job[0].freelancersNo == hiring.length) {
      updatedJob = await Job.updateOne(
        { _id: req.body.jobId },
        { $set: { postStatus: 2 } }
      ); //finished
      for (let i = 0; i < proposals.proposalsList.length; i++) {
        if (proposals.proposalsList[i].proposal.status == 0) {
          proposals.proposalsList[i].proposal.status = 3; //job not assigned to it
          updatedJob = await Job.updateOne(
            { _id: req.body.jobId },
            { $set: { proposals: proposals } }
          );
        }
      }
    }
    let client = await User.findOne({_id: job[0].clientId},{paymentAccount:1,_id:0});
    let clientAccount = client.paymentAccount;
    if(clientAccount.totalAmount < job[0].proposals.proposalsList[proposalNo].proposal.terms.bid){
      res.send("Your payment account is less than bid")
    }
    clientAccount.holdAmount += job[0].proposals.proposalsList[proposalNo].proposal.terms.bid;
    clientAccount.availableAmount = clientAccount.totalAmount-clientAccount.holdAmount;
    console.log(clientAccount);
    let freelancer = await User.findOne({_id: req.body.userId},{paymentAccount:1,_id:0});
    let freelancerAccount = freelancer.paymentAccount;
    freelancerAccount.holdAmount += job[0].proposals.proposalsList[proposalNo].proposal.terms.received;
    freelancerAccount.totalAmount += job[0].proposals.proposalsList[proposalNo].proposal.terms.received;
    freelancerAccount.availableAmount = Math.abs(freelancerAccount.totalAmount - freelancerAccount.holdAmount);
    await User.updateOne(
      { _id: job[0].clientId },
      {
        $set: {
          paymentAccount: clientAccount
        },
      }
    );
    await User.updateOne(
      { _id: req.body.userId },
      {
        $set: {
          paymentAccount: freelancerAccount
        },
      }
    );
    res.json(updatedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});
//DELETE ALL HIRINGS
router.post("/deletehirings", async (req, res) => {
  try {
    let hiring = {
      hiringList: [],
      length: 0,
    };
    const updatedJob = await Job.updateOne(
      { _id: req.body.jobId },
      { $set: { hiring: hiring } }
    );
    res.json(updatedJob);
    hiring;
  } catch (err) {
    res.json({ message: err.message });
  }
});
router.post("/resetpayment", async (req, res) => {
  try {
    let payment = {
      totalAmount:5000,
      holdAmount:0,
      availableAmount:0
    }
    const user = await User.updateOne(
      { _id: req.body.userId },
      {
        $set: {
          paymentAccount: payment
        },
      }
    );
    res.json(user)
  } catch (err) {
    res.json({ message: err.message });
  }
})
//RECEIVE JOB
router.post("/receivejob", async (req, res) => {
  let receiveJob = {
    message: req.body.message,
  };
  try {
    await proposalUpload(req, res);
    receiveJob.jobFiles = jobFiles;
    let job = await Job.find({ _id: req.body.jobId }, {});
    let proposals = await Job.find(
      { _id: req.body.jobId },
      { proposals: 1, _id: 0 }
    );
    console.log(proposals[0].proposals)
    let hiringNo = 0;
    proposals = proposals[0].proposals;
    console.log(proposals)
    for (let i = 0; i < proposals.length; i++) {
      if (proposals.proposalsList[i].userId == req.body.userId) {
        proposals.proposalsList[i].proposal.status = 3; //job finished
        hiringNo = i;
        proposals.proposalsList[i] = {...proposals.proposalsList[0], receiveJob }
      }
    }
    console.log(proposals)
    updatedJob = await Job.updateOne(
      { _id: req.body.jobId },
      { $set: { proposals: proposals } }
    ); //finished
    let sendedJob = await Job.findOne({ _id: req.body.jobId});
    let client = await User.findOne({_id: job[0].clientId},{paymentAccount:1,_id:0});
    let clientAccount = client.paymentAccount;
    clientAccount.holdAmount -= job[0].proposals.proposalsList[hiringNo].proposal.terms.bid;
    clientAccount.totalAmount -= job[0].proposals.proposalsList[hiringNo].proposal.terms.bid;
    console.log(clientAccount);
    let freelancer = await User.findOne({_id: req.body.userId},{paymentAccount:1,_id:0});
    console.log("freelancer" + freelancer);
    let freelancerAccount = freelancer.paymentAccount;
    freelancerAccount.holdAmount -= job[0].proposals.proposalsList[hiringNo].proposal.terms.received;
    freelancerAccount.totalAmount += job[0].proposals.proposalsList[hiringNo].proposal.terms.received;
    freelancerAccount.availableAmount = Math.abs(freelancerAccount.totalAmount - freelancerAccount.holdAmount);
    console.log(freelancerAccount);
    await User.updateOne(
      { _id: job[0].clientId },
      {
        $set: {
          paymentAccount: clientAccount
        },
      }
    );
    await User.updateOne(
      { _id: req.body.userId },
      {
        $set: {
          paymentAccount: freelancerAccount
        },
      }
    );
    res.json(sendedJob);
  } catch (err) {
    res.json({ message: err.message });
  }
});
router.get("/downloadjobfiles/:name", async (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/../job-uploads/";
  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
});

module.exports = { router };
