const express = require("express")
const router = express.Router()
const controller = require("../controllers/auth.controller")

router.post("/sign-up", controller.signUp)
router.post("/sign-in", controller.signIn)

module.exports = app => app.use("/auth", router)