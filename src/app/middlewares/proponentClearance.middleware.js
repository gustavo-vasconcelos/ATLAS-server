module.exports = (req, res, next) => {
    if(req.loggedUserProfile === "student" || !req.loggedUserProfile) {
        return res.status(403).send({"error": "Wrong way."})
    }
    return next()
}