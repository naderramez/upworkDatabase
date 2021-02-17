const mongoose = require("mongoose");
const fileSchema = new mongoose.Schema({
    data:{
        type: Buffer,
    },
    type: {
        type: String
    },
    fileName: {
        type: String
    }
});
module.exports = mongoose.model('File',fileSchema);