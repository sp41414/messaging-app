const { Router } = require('express')
const userRouter = Router()
const userController = require('../controllers/userController')

userRouter.get("/me", userController.getCurrentProfile)
userRouter.get("/:id", userController.getProfile)
userRouter.get("/friends", userController.getFriends)
userRouter.get("/friends/requests", userController.getFriendRequests)

userRouter.put("/me", userController.updateInfo)
userRouter.post("/friends/requests/add/:id", userController.addFriend)
userRouter.put("/friends/requests/accept/:id", userController.acceptFriend)
userRouter.put("/friends/requests/refuse/:id", userController.refuseFriend)
userRouter.put("/friends/block/:id", userController.blockFriend)
userRouter.delete("/friends/:id", userController.removeFriend)

module.exports = userRouter
