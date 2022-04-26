const mongoose = require('mongoose')

const Exercise = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Exercise', Exercise)
