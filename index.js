const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

app.use(bodyParser.json());
dotenv.config();
mongoose.connect(process.env.DB_CONNECTION,
    {useNewUrlParser:true},
    ()=>console.log("DB Connected Successfully"))

const registerAuthRouter = require('./routes/register-auth');
const signinAuthRouter = require('./routes/signin-auth');

app.use('/api/user/register',registerAuthRouter);
app.use('/api/user/signin',signinAuthRouter);

app.listen(3000);