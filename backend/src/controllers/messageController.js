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

const editedMessageValidation = [
    body("text")
        .trim()
        .isLength({ max: 2000 })
        .withMessage("Max length 2000 characters"),
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

const editMessage = [passport.authenticate("jwt", { session: false }), editedMessageValidation, async (req, res, next) => {
    const err = validationResult(req)
    if (!err.isEmpty()) {
        return res.status(400).json({
            error: {
                message: err.array(),
                timestamp: new Date().toISOString()
            }
        })
    }

    const messageId = req.params.id
    const { text } = matchedData(req)

    try {
        const message = await db.message.findUnique({
            where: {
                id: messageId,
                senderId: req.user.id
            }
        })

        if (!message) {
            return res.status(404).json({
                error: {
                    message: "Message not found",
                    timestamp: new Date().toISOString()
                }
            })
        }

        if (text.length <= 0) {
            const deletedMessage = await db.message.delete({
                where: {
                    id: message.id
                }
            })
            return res.json({
                deletedMessage
            })
        }

        const editedMessage = await db.message.update({
            where: {
                id: message.id
            },
            data: {
                text: text,
                edited: true
            }
        })

        res.json({
            editedMessage
        })
    } catch (err) {
        next(err)
    }
}]

const deleteMessage = [passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    const messageId = req.params.id

    try {
        const message = await db.message.findUnique({
            where: {
                id: messageId,
            }
        })

        if (!message) {
            return res.status(404).json({
                error: {
                    message: "Message not found",
                    timestamp: new Date().toISOString()
                }
            })
        }

        if (message.senderId !== req.user.id) {
            return res.status(403).json({
                error: {
                    message: "You can only delete your own messages",
                    timestamp: new Date().toISOString()
                }
            })
        }

        const deletedMessage = await db.message.delete({
            where: {
                id: message.id,
            }
        })
        res.json({
            deletedMessage
        })
    } catch (err) {
        next(err)
    }
}]

const getConversation = [passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    try {
        const conversationWithUserId = parseInt(req.params.id)
        const userId = req.user.id

        if (!conversationWithUserId) {
            return res.status(400).json({
                error: {
                    message: "Missing user ID parameter",
                    timestamp: new Date().toISOString()
                }
            })
        }

        const messages = await db.message.findMany({
            where: {
                OR: [
                    { senderId: userId, recipientId: conversationWithUserId },
                    { senderId: conversationWithUserId, recipientId: userId }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            },
        })

        res.json({
            messages
        })
    } catch (err) {
        next(err)
    }
}]


module.exports = {
    newMessage,
    editMessage,
    deleteMessage,
    getConversation
}
