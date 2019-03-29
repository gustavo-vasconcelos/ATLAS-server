const express = require("express")
const router = express.Router()
const courses = require("../controllers/courses.controller")

router.get("/", courses.get)
router.post("/", courses.add)

module.exports = app => app.use("/courses", router)