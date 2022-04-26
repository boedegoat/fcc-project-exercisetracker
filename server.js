const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/User')
const Exercise = require('./models/Exercise')
require('dotenv').config()
require('express-async-errors')

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

const checkUser = async (req, res, next) => {
  // find user by id
  const { _id } = req.params
  const user = await User.findById(_id)
  req.user = user
  next()
}

app.post('/api/users/:_id/exercises', checkUser, async (req, res) => {
  const reqDate = new Date(req.body.date)

  const newExercise = await Exercise.create({
    ...req.body,
    date: reqDate,
    username: req.user.username,
  })

  const { description, duration, date, username } = newExercise
  res.json({ description, duration, date: date.toDateString(), username, _id: req.user._id })
})

app.get('/api/users/:_id/logs', checkUser, async (req, res) => {
  let { limit, from, to } = req.query
  let resBody = {
    _id: req.user._id,
    username: req.user.username,
  }

  let query = Exercise.find({ username: req.user.username }).select(
    'description duration date -_id'
  )

  if (limit) {
    query = query.limit(+limit)
  }

  if (from) {
    query = query.find({ date: { $gte: from } })
    resBody.from = new Date(from).toDateString()
  }

  if (to) {
    query = query.find({ date: { $lte: to } })
    resBody.to = new Date(to).toDateString()
  }

  const exercises = (await query).map((exercise) => ({
    ...exercise._doc,
    date: exercise.date.toDateString(),
  }))

  resBody.count = exercises.length
  resBody.log = exercises

  res.json(resBody)
})

// error handling
app.use((err, req, res, next) => {
  res.send(err)
})

const start = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('connected to mongodb')
  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
  })
}

start()
