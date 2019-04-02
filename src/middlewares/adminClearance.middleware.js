module.exports = (req, res, next) => {
    if(req.loggedUserProfile !== "admin") {
        return res.status(403).send({"error": "Wrong way."})
    }
    return next()
}