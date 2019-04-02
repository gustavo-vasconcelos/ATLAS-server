const jwt = require("jsonwebtoken")
const config = require("../config")

module.exports = (req, res, next) => {
    // gets request "authorization" header
    const authHeader = req.headers.authorization
    
    // if "authorization" does not exist
    if(!authHeader) {
        return res.status(401).send({ error: "Missing token." })
    }
    
    // splits "authorization" header
    const parts = authHeader.split(" ")
    
    
    // a token has this layout: "Bearer + token"
    if(parts.length !== 2) {
        return res.status(401).send({ error: "Token malformated." })
    }
    
    const [bearer, token] = parts
    
    if(bearer !== "Bearer") {
        return res.status(401).send({ error: "Token malformated." })
    }
    
    
    // verifies token integrity
    jwt.verify(token, config.auth.secret, (err, decoded) => {
        if(err) {
            return res.status(401).send({ error: "Invalid token." })
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