const db = require('../db/prisma')
const passport = require('passport')
const { matchedData, validationResult, body } = require('express-validator')

const messageValidation = [
    body("text")
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage("Minimum length 1 character to 2000 characters"),
    body("recipientId")
        .isInt()
        .withMessage("Recipient ID must be an integer")
        .toInt()
]

const newMessage = [passport.authenticate("jwt", { session: false }), messageValidation, async (req, res, next) => {
    const err = validationResult(req)

    if (!err.isEmpty()) {
        return res.status(400).json({
            error: {
                message: err.array(),
                timestamp: new Date().toISOString()
            }
        })
    }

    const senderId = req.user.id

    const { recipientId, text } = matchedData(req)

    try {
        const recipient = await db.user.findUnique({
            where: {
                id: recipientId
            }
        })

        if (!recipient) {
            return res.status(404).json({
                error: {
                    message: "Recipient not found",
                    timestamp: new Date().toISOString()
                }
            })
        }

        const friendship = await db.friendship.findFirst({
            where: {
                OR: [
                    { senderId: senderId, recipientId: recipientId },
                    { senderId: recipientId, recipientId: senderId }
                ],
                status: "BLOCKED"
            }
        })

        if (friendship) {
            if (friendship.senderId === senderId) {
                return res.status(403).json({
                    error: {
                        message: "You have blocked this user",
                        timestamp: new Date().toISOString()
                    }
                })
            } else {
                return res.status(403).json({
                    error: {
                        message: "You are blocked by this user",
                        timestamp: new Date().toISOString()
                    }
                })
            }
        }

        const createdMessage = await db.message.create({
            data: {
                senderId,
                recipientId,
                text
            }
        })

        res.status(201).json({
            createdMessage
        })
    } catch (err) {
        next(err)
    }
}]

const editMessage = [passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    const recipientId = req.body.recipientId
    const messageId = req.params.id
}]

const deleteMessage = [passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    const recipientId = req.body.recipientId
    const messageId = req.params.id
}]

module.exports = {
    newMessage,
    editMessage,
    deleteMessage
}
