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


const getProfile = [passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id)
        const userProfile = await db.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                username: true,
                aboutMe: true,
                createdAt: true
            }
        })

        if (!userProfile) {
            return res.status(404).json({
                error: {
                    message: "User not found",
                    timestamp: new Date().toISOString()
                }
            })
        }

        res.json({
            user: userProfile
        })
    } catch (err) {
        next(err)
    }
}]

const getFriends = [passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    try {
        const userId = req.user.id
        const friends = await db.friendship.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { recipientId: userId }
                ],
                status: "ACCEPTED"
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        aboutMe: true
                    }
                },
                recipient: {
                    select: {
                        id: true,
                        username: true,
                        aboutMe: true
                    }
                }
            }
        })

        if (!friends || friends.length === 0) {
            return res.status(200).json({
                error: {
                    message: "You have no friends",
                    timestamp: new Date().toISOString()
                }
            })
        }

        const friendships = friends.map(fs => {
            return fs.senderId === userId ? fs.recipient : fs.sender
        })

        res.json({
            friends: friendships
        })
    } catch (err) {
        next(err)
    }
}]

const getFriendRequests = [passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    try {
        const userId = req.user.id
        const friendRequests = await db.friendship.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { recipientId: userId }
                ],
                status: "PENDING"
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        aboutMe: true
                    }
                },
                recipient: {
                    select: {
                        id: true,
                        username: true,
                        aboutMe: true
                    }
                }
            }
        })

        if (!friendRequests || friendRequests.length === 0) {
            return res.status(200).json({
                message: "You have no friend requests",
                timestamp: new Date().toISOString()
            })
        }

        const requests = friendRequests.map(req => ({
            id: req.id,
            status: req.status,
            createdAt: req.createdAt,
            type: req.senderId === userId ? 'sent' : 'received',
            user: req.senderId === userId ? req.recipient : req.sender
        }))

        res.json({
            friendRequests: requests
        })
    } catch (err) {
        next(err)
    }
}]

const getCurrentProfile = [passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    try {
        const userProfile = await db.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                username: true,
                aboutMe: true,
                createdAt: true
            }
        })

        res.json({
            userProfile
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
    removeFriend,
    getProfile,
    getFriends,
    getFriendRequests,
    getCurrentProfile
}
