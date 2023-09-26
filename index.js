const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const { isValidDate, toDateString, checkDate } = require("./utils");


require('dotenv').config()

app.use(cors())
app.use(express.static('public'))

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const exercisesSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String
});

const userSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: exercisesSchema.path("date"),
  log: [exercisesSchema]
});

const User = new mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async (req, res) => {
  let users = await User.find();
  res.json(users)
})

app.post('/api/users', async (req, res) => {
  const username = req.body.username;
  const user = await User.findOne({username});

 if(!user){
  const u = new User({username})
  u.save();
  res.json(u)
  }else{
    res.json("User exists");
  }
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  const {description, duration, date} = req.body;
  const isValidDateProvided = isValidDate(date);

  if(!description){
    res.json({error: "Description is required"});
  }else if(!duration){
    res.json({error: "Duration is required"});
  }else{
   const newExercise = 
   {
     description,
     duration,
     date : toDateString(isValidDateProvided ? date : null)
   };

    const user = await User.findOneAndUpdate(
      { _id: req.params._id },
      {
        $push: { log: newExercise },
        description: newExercise.description,
        duration: newExercise.duration,
        date: newExercise.date
      },
      { new: true });

    if(user){
      const {_id, username, date, description, duration} = user;

      console.log({_id, username, date, description, duration})
      res.json({_id, username, date, description, duration});
    }
  }
});

app.get('/api/users/:_id/logs', async (req, res)=>{
  const {from, to, limit} = req.query;

  const user = await User.findById(req.params._id);

  if(user){
    const {_id, username, log} = user;
    let logToShow = log.filter(
      (l) => checkDate.isBefore(from ?? l.date, l.date) &&
            checkDate.isAfter(to ?? l.date, l.date)
    ).slice(
      0, limit || log.length
    );

    const count = logToShow?.length ?? 0;
    res.json({_id, username, count, log: logToShow});
  }
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
