const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/User')
const Exercise = require('./models/Exercise')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.post('/api/users', async (req, res) => {
  const { username: reqUsername } = req.body
  let user = await User.findOne({ username: reqUsername })

  if (!user) {
    user = await User.create({ username })
  }

  const { _id, username } = user
  res.json({ _id, username })
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    // find user by id
    const { _id } = req.params
    const user = await User.findById(_id)

    const reqDate = new Date(req.body.date)

    const newExercise = await Exercise.create({
      ...req.body,
      date: reqDate,
      username: user.username,
    })

    const { description, duration, date, username } = newExercise
    res.json({ description, duration, date: date.toDateString(), username, _id: user._id })
  } catch (err) {
    console.log(err)
    res.send(err)
  }
})

const start = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('connected to mongodb')
  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
  })
}

start()
