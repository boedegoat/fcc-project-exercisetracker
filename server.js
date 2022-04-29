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

app.post('/api/users', (req, res, next) => {
  const { username } = req.body
  // first, check if user in db exist
  User.findOne({ username }, (err, userInDb) => {
    if (err) return next(err)
    if (!username) return next({ status: 400, message: 'Please provide username' })
    // if exist, immediately send user
    if (userInDb) {
      return res.json({ _id: userInDb._id, username: userInDb.username })
    }
    // if not exist yet, then create new user
    User.create({ username }, (err, newUser) => {
      if (err) return next(err)
      return res.json({ _id: newUser._id, username: newUser.username })
    })
  })
})

const checkUser = (req, res, next) => {
  // find user by id
  const { _id } = req.params
  User.findById(_id, (err, user) => {
    if (err) {
      throw { status: 401, error: 'unauthorize' }
    }
    req.user = user
    next()
  })
}

app.post('/api/users/:_id/exercises', checkUser, (req, res) => {
  const reqDate = new Date(req.body.date)

  Exercise.create(
    {
      ...req.body,
      date: reqDate,
      username: req.user.username,
    },
    (err, newExercise) => {
      const { description, duration, date, username } = newExercise
      res.json({ description, duration, date: date.toDateString(), username, _id: req.user._id })
    }
  )
})

app.get('/api/users/:_id/logs', checkUser, (req, res) => {
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

  query.exec((err, exercises) => {
    exercises = exercises.map((exercise) => ({
      ...exercise._doc,
      date: exercise.date.toDateString(),
    }))

    resBody.count = exercises.length
    resBody.log = exercises

    res.json(resBody)
  })
})

// error handling
app.use((err, req, res, next) => {
  res.status(err.status || 500).send(err)
})

const start = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('connected to mongodb')
  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
  })
}

start()
