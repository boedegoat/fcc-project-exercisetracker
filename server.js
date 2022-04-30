require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.use('/api/users', require('./routers/usersRouter'))

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
