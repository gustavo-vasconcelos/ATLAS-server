const messages = require("../jsonmessages/messages")

module.exports = (req, res, next) => {
    if(req.loggedUserProfile !== "admin") {
        return res.status(messages.user.insufficientPermissions.status).send(messages.user.insufficientPermissions)
    }
    return next()
}