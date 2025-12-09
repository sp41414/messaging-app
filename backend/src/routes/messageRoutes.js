const { Router } = require('express')
const messageRouter = Router()
const messageController = require('../controllers/messageController')

messageRouter.post("/", messageController.newMessage)
messageRouter.put("/:id", messageController.editMessage)
messageRouter.delete("/:id", messageController.deleteMessage)

module.exports = messageRouter
