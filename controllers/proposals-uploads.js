// const Job = require('../models/job');
// const upload = require("../middleware/proposals-uploads").uploadFilesMiddleware;
// const allFiles = require("../middleware/proposals-uploads").files
// const multipleUpload = async (req, res) => {
//   try {
//     await upload(req, res);
//     if (req.files.length <= 0) {
//       return res.send(`You must select at least 1 file.`);
//     }
//     await Job.updateOne({_id:req.body.jobId},{$set:{additionalFiles:allFiles}});
//     console.log(req.files.originalname);
//     console.log(allFiles)
//     return res.send(allFiles);
//   } catch (error) {
//     console.log(error);

//     if (error.code === "LIMIT_UNEXPECTED_FILE") {
//       return res.send("Too many files to upload.");
//     }
//     return res.send(`Error when trying upload many files: ${error}`);
//   }
// };
// module.exports = {
//     multipleUpload: multipleUpload
//   };