const util = require("util");
const path = require("path");
const multer = require("multer");
const maxSize = 7 * 1024 * 1024 * 1024;

let files = [];
var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(`${__dirname}/../proposals-uploads`));
  },
  filename: (req, file, callback) => {
    const match = ["image/png", "image/jpeg","image/gif", "text/plain", "text/html", "text/javascript", "text/css","multipart/form-data", "multipart/byteranges", "application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.ms-powerpoint","application/zip","application/xml","application/typescript"];
    if (match.indexOf(file.mimetype) === -1) {
      var message = `${file.originalname} is invalid. Only accept png/jpeg/gif/txt/html/js/css/pdf/docx/xls/ppt.`;
      return callback(message, null);}
      if(req.files.length === 1){
        console.log("2rga3 b2a")
        files.splice(0, );
        console.log("2rgaaaaa3",files);
      }
    console.log(file.originalname);
    console.log(file);
    let fileName = `${new Date().getTime()}_${file.originalname}`
    callback(null, fileName);
    console.log(fileName)
    files.push(fileName)
    console.log("files in middleware",files)
  }
});
let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png|gif|txt|pdf|doc|docx|xlsx|xls|html|js|css|zip|ts|xml)$/)) {
      return cb(
        new Error(
          'only upload files with jpg, jpeg, png, pdf, doc, docx, xslx, xls, zip, ts, xml format.'
        )
      );
    }
    cb(undefined, true); // continue with upload
  }
}).array("file", 10);
var uploadFilesMiddleware = util.promisify(uploadFile);
module.exports = {uploadFilesMiddleware, files};