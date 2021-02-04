const util = require("util");
const path = require("path");
const multer = require("multer");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const maxSize = 7 * 1024 * 1024 * 1024;
let files = [];

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(`${__dirname}/../jpbpost-uploads`));
  },
  filename: (req, file, callback) => {
    const match = ["image/png", "image/jpeg","image/gif", "text/plain", "text/html", "text/javascript", "text/css","multipart/form-data", "multipart/byteranges", "application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.ms-powerpoint"];
    if (match.indexOf(file.mimetype) === -1) {
      var message = `${file.originalname} is invalid. Only accept png/jpeg/gif/txt/html/js/css/pdf/docx/xls/ppt.`;
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
    if (!file.originalname.match(/\.(jpeg|jpg|png|gif|txt|pdf|doc|docx|xlsx|xls|html|js|css)$/)) {
      return cb(
        new Error(
          'only upload files with jpg, jpeg, png, pdf, doc, docx, xslx, xls format.'
        )
      );
    }
    cb(undefined, true); // continue with upload
  }
}).array("multi-files", 10);
//var uploadFiles = multer({ storage: storage }).array("multi-files", 10);
var uploadFilesMiddleware = util.promisify(uploadFile);
module.exports = {uploadFilesMiddleware, files};