require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const passport = require('./src/auth/passport')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true
}))
app.use(passport.initialize())
app.use("/api", require('./src/routes'))
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        error: {
            message: err.message,
            timestamp: new Date().toISOString()
        }
    })
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`App listening on PORT ${PORT}`)
})
