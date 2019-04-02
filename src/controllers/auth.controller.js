const User = require("../models/users.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const config = require("../config")

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


module.exports = { signUp, signIn }
