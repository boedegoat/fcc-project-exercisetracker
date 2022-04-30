const Exercise = require('../models/Exercise')
const User = require('../models/User')

module.exports.getAllUsers = (req, res, next) => {
  User.find((err, users) => {
    if (err) return next(err)
    res.json(users.map((user) => ({ _id: user._id, username: user.username })))
  })
}

module.exports.createOrGetUser = (req, res, next) => {
  const { username } = req.body
  // first, check if user in db exist
  User.findOne({ username }, (err, userInDb) => {
    if (err) return next(err)
    if (!username) return next({ status: 400, error: 'Please provide username' })
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
}

module.exports.getAllExercises = (req, res, next) => {
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
    if (err) return next(err)
    exercises = exercises?.map((exercise) => ({
      ...exercise._doc,
      date: exercise.date.toDateString(),
    }))

    resBody.count = exercises.length
    resBody.log = exercises

    res.json(resBody)
  })
}

module.exports.createNewExcercise = (req, res, next) => {
  req.body.username = req.user.username
  const { date } = req.body
  // if user not providing date, set it to current time
  if (!date) {
    req.body.date = new Date()
  }
  new Exercise(req.body).save((err, newExercise) => {
    if (err) return next(err)
    const { username, description, duration, date } = newExercise._doc
    res.json({
      _id: req.user._id,
      username,
      description,
      duration,
      date: date.toDateString(),
    })
  })
}
