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
     //update reem
    ()=>console.log("DB Connected Successfully"))

const registerAuthRouter = require('./routes/register-auth');
//const signinAuthRouter = require('./routes/signin-auth');
//const profileRoute = require('./routes/profile');
const jobRoute = require('./routes/jobs').router;



//app.listen(8080);
//const signinAuthRouter = require('./routes/signin-auth');
const profile = require('./routes/profile');
const signin = require('./routes/signin');

app.use('/api/user/register',registerAuthRouter);
//app.use('/api/user',signinAuthRouter); //update reem
app.use('/api/user',signin); 
app.use('/api/user', profile);
app.use('/api/job',jobRoute);

app.listen(3000);

/*
const jwt = require('jsonwebtoken')

const myFunction = async () => {
    const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', { expiresIn: '7 days' })
    console.log(token)

    const data = jwt.verify(token, 'thisismynewcourse')
    console.log(data)
}

myFunction()
*/


const User = require('./models/user')

const main = async () => {
    // const task = await Task.findById('5c2e505a3253e18a43e612e6')
    // await task.populate('owner').execPopulate()
    // console.log(task.owner)

    const user = await User.findById('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDE4OTRmMTQ2NTA5ZTM0M...')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks)
}

main()



/*
//hashed password

const bcrypt = require('bcryptjs')
 const myFunction = async () => {
     const password ='reem1111'
     const hashedPassword =await bcrypt.hash(password , 8 )
     console.log(password)
     console.log(hashedPassword)

     const isMatch = await bcrypt.compare('reem1111' , hashedPassword)
     console.log(isMatch)
 }

 myFunction()
 */
