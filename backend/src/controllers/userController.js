const passport = require('passport')
const db = require('../db/prisma')
const { matchedData, validationResult, body } = require('express-validator')

const validateUserInfo = [
    body("username")
        .trim()
        .optional()
        .isLength({ max: 20 })
        .withMessage(`Username has a limit of 20 characters long`)
        .matches(/^[a-zA-Z0-9 ]*$/)
        .withMessage(`Username must only have characters numbers and spaces`),
    body("about")
        .trim()
        .optional()
        .isLength({ max: 200 })
        .withMessage('About me has a limit of 200 characters long')
        .matches(/^[a-zA-Z0-9!@#$%^&* ]*$/)
        .withMessage(
            `About me can only contain letters, numbers, spaces, and special characters (!@#$%^&*).`
        ),
]

const updateInfo = [validateUserInfo,
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        const err = validationResult(req)
        if (!err.isEmpty()) {
            return res.status(400).json({
                error: {
                    message: err.array(),
                    timestamp: new Date().toISOString()
                }
            })
        }
        try {
            const { username, about } = matchedData(req)
            const updatedUser = await db.user.update({
                where: {
                    id: req.user.id,
                },
                data: {
                    username,
                    aboutMe: about
                },
                select: {
                    id: true,
                    username: true,
                    aboutMe: true,
                    createdAt: true
                }
            })
            res.json({
                updatedUser
            })
        } catch (err) {
            next(err)
        }
    }
]

const addFriend = [passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    const recipientId = parseInt(req.params.id)
    const senderId = req.user.id
    if (senderId === recipientId) {
        return res.status(400).json({
            error: {
                message: "Cannot send a friend request to yourself!",
                timestamp: new Date().toISOString()
            }
        })
    }
    try {
        const friendship = await db.friendship.findFirst({
            where: {
                OR: [
                    { senderId: senderId, recipientId: recipientId }, // A -> B
                    { senderId: recipientId, recipientId: senderId } // B -> A
                ]
            }
        })
        if (friendship) {
            if (friendship.status === "BLOCKED" && friendship.senderId === recipientId) {
                return res.status(403).json({ error: { message: "You have been blocked by this user." } });
            }
            if (friendship.status === "BLOCKED" && friendship.senderId === senderId) {
                return res.status(403).json({ error: { message: "You have blocked this user." } });
            }
            if (friendship.status !== "REFUSED") {
                return res.status(409).json({ error: { message: `A friendship with status ${friendship.status} already exists.` } });
            }
        }

        const createFriendship = await db.friendship.create({
            data: {
                senderId: senderId,
                recipientId: recipientId
            },
        })
        res.status(201).json({
            createFriendship
        })
    } catch (err) {
        next(err)
    }
}]


const acceptFriend = [passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    const recipientId = req.user.id
    const senderId = parseInt(req.params.id)

    try {
        const friendship = await db.friendship.findFirst({
            where: {
                senderId: senderId,
                recipientId: recipientId,
                status: "PENDING"
            }
        })
        if (!friendship) {
            return res.status(404).json({
                error: {
                    message: "Pending request not found.",
                    timestamp: new Date().toISOString()
                }
            });
        }

        const acceptFriendship = await db.friendship.update({
            where: {
                id: friendship.id
            },
            data: {
                acceptedAt: new Date(),
                status: "ACCEPTED"
            }
        })
        res.json({
            acceptFriendship
        })
    } catch (err) {
        next(err)
    }
}]


const refuseFriend = [passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    const recipientId = req.user.id
    const senderId = parseInt(req.params.id)

    try {
        const friendship = await db.friendship.findFirst({
            where: {
                senderId: senderId,
                recipientId: recipientId,
                status: "PENDING"
            }
        })
        if (!friendship) {
            return res.status(404).json({
                error: {
                    message: "Pending request not found.",
                    timestamp: new Date().toISOString()
                }
            });
        }

        const refusedFriendship = await db.friendship.update({
            where: {
                id: friendship.id
            },
            data: {
                status: "REFUSED"
            }
        })
        res.json({
            refusedFriendship
        })
    } catch (err) {
        next(err)
    }
}]


const blockFriend = [passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    const recipientId = parseInt(req.params.id)
    const senderId = req.user.id

    try {
        const friendship = await db.friendship.findFirst({
            where: {
                OR: [
                    {
                        senderId: senderId,
                        recipientId: recipientId
                    },
                    {
                        senderId: recipientId,
                        recipientId: senderId
                    }
                ]
            }
        })

        let blockedFriendship;

        if (friendship) {
            blockedFriendship = await db.friendship.update({
                where: {
                    id: friendship.id
                },
                data: {
                    senderId: senderId,
                    recipientId: recipientId,
                    acceptedAt: null,
                    status: "BLOCKED"
                }
            })
        } else {
            blockedFriendship = await db.friendship.create({
                data: {
                    senderId: senderId,
                    recipientId: recipientId,
                    status: "BLOCKED"
                }
            })
        }

        res.json({
            blockedFriendship
        })
    } catch (err) {
        next(err)
    }
}]


const removeFriend = [passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    const recipientId = parseInt(req.params.id)
    const senderId = req.user.id

    try {
        const friendship = await db.friendship.findFirst({
            where: {
                OR: [
                    { senderId: senderId, recipientId: recipientId },
                    { senderId: recipientId, recipientId: senderId }
                ]
            }
        })

        if (!friendship) {
            return res.status(404).json({
                message: "Friendship does not exist!",
                timestamp: new Date().toISOString()
            })
        }

        const removedFriendship = await db.friendship.delete({
            where: {
                id: friendship.id
            }
        })

        res.json({
            removedFriendship
        })
    } catch (err) {
        next(err)
    }
}]

module.exports = {
    updateInfo,
    addFriend,
    acceptFriend,
    refuseFriend,
    blockFriend,
    removeFriend
}
