const express = require("express")
const Event = require("../models/events.model")
const router = express.Router()

router.post("/add", (req, res) => {

})

module.exports = app => app.use("/events", router)