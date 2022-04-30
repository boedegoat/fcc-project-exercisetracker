const usersRouter = require('express').Router()
const {
  getAllUsers,
  createOrGetUser,
  createNewExcercise,
  getAllExercises,
} = require('../controllers/users')
const checkUser = require('../middlewares/checkUser')

usersRouter.route('/').get(getAllUsers).post(createOrGetUser)
usersRouter.route('/:_id/exercises').post(checkUser, createNewExcercise)
usersRouter.route('/:_id/logs').get(checkUser, getAllExercises)

module.exports = usersRouter
