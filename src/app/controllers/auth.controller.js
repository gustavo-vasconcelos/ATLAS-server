const User = require("../models/users.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const config = require("../../config")
const crypto = require("crypto")
const messages = require("../jsonmessages/messages")

function generateToken(userId, userProfileId) {
     return jwt.sign({
         id: userId,
         profileId: userProfileId
     }, config.auth.secret, {
        expiresIn: 3600
    })
}

async function getUserByJwt(req, res) {
    try {
        return res.send(await User.findOne({ _id: req.loggedUserId }).select("username profileId picture").lean())
    } catch(err) {
        return res.status(messages.token.invalid.status).send(messages.token.invalid)
    }
}

async function signUp(req, res) {
    req.body.profileId = 1
    try {
        req.body.gender = (req.body.gender < 1 || req.body.gender > 2) ? 1 : Math.floor(req.body.gender)

        if(!req.body.picture) {
            req.body.picture = req.body.gender === 1 ? "https://i.imgur.com/uUbH9go.png" : "https://i.imgur.com/moL2juW.png"
        }
        
        let errors = []
        
        const sameEmail = await User.findOne({ email: req.body.email })
        if(sameEmail) {
            errors.push({
                type: "email",
                value: req.body.email
            })
        }
        
        const sameUsername = await User.findOne({ username: req.body.username })
        if(sameUsername) {
            errors.push({
                type: "username",
                value: req.body.username
            })
        }
        
        if(errors.length) {
            return res.status(messages.user.signUpError().status).send(messages.user.signUpError(errors))
        }
        
        const user = await User.create(req.body)
        return res.status(messages.user.signUpSuccess.status).send(messages.user.signUpSuccess)
    } catch (err) {
        return res.status(messages.db.error).send(messages.db.error)
    }
}

async function signIn(req, res) {
    const { username, password } = req.body
    
    if(!username || !password) {
        return res.status(400).send({ error: "Missing arguments." })
    }
    
    try {
        const user = await User.findOne({ username }).select("+password")
        if(!user) {
            return res.status(messages.user.invalidUsername.status).send(messages.user.invalidUsername)
        } else {
            if(!await bcrypt.compare(password, user.password)) {
                return res.status(messages.user.invalidPassword.status).send(messages.user.invalidPassword)
            }
           
            user.password = undefined
            return res.status(messages.user.loginSuccess().status).send(
                messages.user.loginSuccess(
                    generateToken(user._id, user.profileId),
                    { 
                        _id: user._id,
                        username: user.username,
                        profileId: user.profileId,
                        picture: user.picture
                    }
                )
            )
        }

    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: err })
    }
}

async function forgotPassword(req, res) {
    const { email } = req.body
    
    try {
        const user = await User.findOne({ email })
        
        if(!user) {
            return res.status(404).send({ error: "User not found." })
        }
        
        const token = crypto.randomBytes(15).toString("hex")
        const expires = new Date()
        expires.setHours(expires.getHours() + 2)
        
        await User.findByIdAndUpdate(user.id, {
            "$set": {
                passwordReset: {
                    token,
                    expires
                }
            }
        })
        return res.send()
    } catch (err) {
        return res.status(400).send({ error: err })
    }
}

async function resetPassword(req, res) {
    const { email, token, password } = req.body
    
    try {
        const user = await User.findOne({ email }).select("+ passwordReset")
        if(!user) {
            return res.status(404).send({ error: "User not found." })
        }
        
        if(token !== user.passwordReset.token) {
            return res.status(404).send({ error: "Token not found." })
        }
        
        const now = new Date()
        if(now > user.passwordReset.expires) {
            return res.status(400).send({ error: "Token expired." })
        }
        
        // saves new password and clears token
        user.passwordReset = undefined
        user.password = password
        await user.save()
        
        return res.send()
    } catch (err) {
        return res.status(400).send({ error: err })
    }
}

async function checkPermissions(req, res) {
    
}


module.exports = { getUserByJwt, signUp, signIn, forgotPassword, resetPassword, checkPermissions }
