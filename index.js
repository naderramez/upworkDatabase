const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
//const profileRoute = require('./routes/profile');

app.use(express.json());
app.use(cors());
dotenv.config();
mongoose.connect(process.env.DB_CONNECTION,
    {useNewUrlParser:true},
    ()=>console.log("DB Connected Successfully"))

const registerAuthRouter = require('./routes/register-auth');
const signinAuthRouter = require('./routes/signin-auth');
const profileRoute = require('./routes/profile');
const jobRoute = require('./routes/jobs').router;

app.use('/api/user/register',registerAuthRouter);
app.use('/api/user',signinAuthRouter); //update reem
app.use('/api/profile' , profileRoute);// update reem
app.use('/api/job',jobRoute);

app.listen(8080);