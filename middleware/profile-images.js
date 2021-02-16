const util = require("util");
const path = require("path");
const multer = require("multer");
const maxSize = 5 * 1024 * 1024 * 1024;
const upload = multer({
  destination: (req, file, callback) => {
      callback(null, path.join(`${__dirname}/../profiles-images`));
    },
  limits: {
    fileSize: 10* 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|PNG|JPG|JPEG)$/)){
    cb(new Error('Please upload an image.'))
  }
  cb(undefined, true)
  }
})


//var uploadFiles = multer({ storage: storage }).array("multi-files", 10);
module.exports = {upload};