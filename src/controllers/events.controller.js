const express = require("express")
const router = express.Router()

router.post("/add", (req, res) => {

})


module.exports = app => app.use("/events", router)