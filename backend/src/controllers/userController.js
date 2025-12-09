const db = require('../db/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { matchedData, validationResult, body } = require('express-validator')
const SECRET = process.env.JWT_SECRET
const passport = require('passport')

const validateUser = [
    body("username")
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage(`Username must be between 1 and 20 characters long`)
        .matches(/^[a-zA-Z0-9 ]*$/)
        .withMessage(`Username must only have characters numbers and spaces`),
    // user freedom! no strict passwords!
    body("password")
        .trim()
        .isLength({ min: 6, max: 32 })
        .withMessage(`Password must be between 6 and 32 characters long`)
        .matches(/^[a-zA-Z0-9!@#$%^&*]{6,32}$/)
        .withMessage(
            `Password can only contain letters, numbers, and special characters (!@#$%^&*).`
        ),
]

const login = async (req, res, next) => {
    const { username, password } = req.body;
    try {
        user = await db.user.findFirst({
            where: {
                username: username
            }
        })
        if (!user) {
            return res.status(401).json({
                error: {
                    message: "Invalid username or password",
                    timestamp: new Date().toISOString()
                }
            })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            const token = jwt.sign({ id: user.id }, SECRET, {
                expiresIn: "2d"
            })
            return res.json({
                token
            })
        } else {
            return res.status(401).json({
                error: {
                    message: "Invalid username or password",
                    timestamp: new Date().toISOString()
                }
            })
        }
    } catch (err) {
        next(err)
    }
}

const signup = [
    validateUser,
    async (req, res, next) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({
                error: {
                    message: err.array(),
                    timestamp: new Date().toISOString()
                }
            })
        }
        const { username, password } = matchedData(req);
        try {
            const salt = await bcrypt.genSalt()
            const hashedPassword = await bcrypt.hash(password, salt)

            await db.user.create({
                data: {
                    username: username,
                    password: hashedPassword
                }
            })

            res.status(201).json({
                username,
                message: "Created user successfully"
            })
        } catch (err) {
            next(err)
        }
    }
]

module.exports = {
    login,
    signup
}
