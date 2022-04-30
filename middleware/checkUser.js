const User = require('../models/User')

const checkUser = (req, res, next) => {
  const { _id: userId } = req.params
  if (!userId) {
    return next({ status: 400, error: 'Please provide _id params' })
  }
  User.findById(userId, (err, user) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return next({ status: 401, error: `No user with id ${userId}` })
    }
    req.user = { _id: user._id, username: user.username }
    next()
  })
}

module.exports = checkUser
