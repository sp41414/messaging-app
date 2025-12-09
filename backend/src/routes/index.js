const { Router } = require('express');
const router = Router()
const userRouter = require('./userRoutes')
const authRouter = require('./authRoutes')
const messageRouter = require('./messageRoutes')

router.use("/users", userRouter)
router.use("/users", authRouter)
router.use("/messages", messageRouter)

module.exports = router;
