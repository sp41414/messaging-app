const { Router } = require('express');
const router = Router()
const userRouter = require('./userRoutes')

router.use("/users", userRouter)

module.exports = router;
