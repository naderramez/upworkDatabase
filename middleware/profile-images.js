const util = require("util");
const path = require("path");
const multer = require("multer");
const maxSize = 5 * 1024 * 1024 * 1024;
let files = [];

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(`${__dirname}/../profiles-images`));
  },
  filename: (req, file, callback) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      var message = `${file.originalname} is invalid. Only accept png/jpeg.`;
      return callback(message, null);}
    console.log(file.originalname);
    console.log(file);
    callback(null, `${new Date().getTime()}_${file.originalname}`);
    console.log(`${new Date().getTime()}_${file.originalname}`)
    files.push(`${new Date().getTime()}_${file.originalname}`)
    console.log(files)
  }
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
      return cb(
        new Error(
          'only upload files with jpg, jpeg, png'
        )
      );
    }
    cb(undefined, true); // continue with upload
  }
}).array("file", 10);


//var uploadFiles = multer({ storage: storage }).array("multi-files", 10);
var uploadFilesMiddleware = util.promisify(uploadFile);
module.exports = {uploadFilesMiddleware, image};