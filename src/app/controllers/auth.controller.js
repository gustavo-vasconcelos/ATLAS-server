const User = require("../models/users.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const config = require("../../config")
const crypto = require("crypto")

function generateToken(userId, userProfileId) {
     return jwt.sign({
         id: userId,
         profileId: userProfileId
     }, config.auth.secret, {
        expiresIn: 3600
    })
}

async function signUp(req, res) {
    try {
        const user = await User.create(req.body)
        res.send({
            user,
            token: generateToken(user.id, user.profileId)
        })
    } catch (err) {
        res.status(400).send({ error: "Could not sign up. " + err })
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
            return res.status(404).send({error: "User not found."})
        } else {
            if(!await bcrypt.compare(password, user.password)) {
                return res.status(404).send({error: "User not found."})
            }
           
            user.password = undefined
            return res.send({
                user,
                token: generateToken(user.id, user.profileId)
            })
        }

    } catch (err) {
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
        res.send()
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


module.exports = { signUp, signIn, forgotPassword, resetPassword }
