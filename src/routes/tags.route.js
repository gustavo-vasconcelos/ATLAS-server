const express = require("express")
const router = express.Router()
const tags = require("../controllers/tags.controller")

router.get("/", tags.get)
router.post("/", tags.add)

module.exports = app => app.use("/tags", router)