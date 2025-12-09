const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const db = require("../db/prisma");

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'cats'
}

passport.use(
    new JwtStrategy(opts, async (payload, done) => {
        try {
            const user = await db.user.findFirst({
                where: {
                    id: payload.id
                }
            })

            if (user) {
                return done(null, user)
            }

            return done(null, false)
        } catch (err) {
            return done(err)
        }
    })
)

module.exports = passport;
