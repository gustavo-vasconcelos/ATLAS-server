const messages = require("../jsonmessages/messages")

module.exports = (req, res, next) => {
    if(req.loggedUserProfile === "student" || !req.loggedUserProfile) {
        return res.status(messages.user.insufficientPermissions.status).send(messages.user.insufficientPermissions)
    }
    return next()
}