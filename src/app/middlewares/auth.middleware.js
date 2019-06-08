const jwt = require("jsonwebtoken")
const config = require("../../config")
const messages = require("../jsonmessages/messages")
const User = require("../models/users.model")

module.exports = (req, res, next) => {
    // gets request "authorization" header
    const authHeader = req.headers.authorization
    
    // if "authorization" does not exist
    if(!authHeader) {
        return res.status(messages.token.missing.status).send(messages.token.missing)
    }
    
    // splits "authorization" header
    const parts = authHeader.split(" ")
    
    
    // a token has this layout: "Bearer + token"
    if(parts.length !== 2) {
        return res.status(messages.token.malformated.status).send(messages.token.malformated)
    }
    
    const [bearer, token] = parts
    
    if(bearer !== "Bearer") {
        return res.status(messages.token.malformated.status).send(messages.token.malformated)
    }
    
    
    // verifies token integrity
    jwt.verify(token, config.auth.secret, async (err, decoded) => {
        if(err) {
            return res.status(messages.token.invalid.status).send(messages.token.invalid)
        }
        
        // compares token info with db info
        const user = await User.findOne({ _id: decoded.id, profileId: decoded.profileId })
        if(!user) {
            return res.status(messages.token.invalid.status).send(messages.token.invalid)
        }
        
        
        // stores variables into req object
        req.loggedUserId = decoded.id
        switch(decoded.profileId) {
            case 1: req.loggedUserProfile = "student"; break
            case 2: req.loggedUserProfile = "proponent"; break
            case 3: req.loggedUserProfile = "admin"; break
        }
        return next()
    })
    
}