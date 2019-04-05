const express = require("express")
const router = express.Router()
const controller = require("../controllers/auth.controller")

router.post("/sign-up", controller.signUp)
router.post("/sign-in", controller.signIn)
router.post("/forgot-password", controller.forgotPassword)
router.post("/reset-password", controller.resetPassword)

module.exports = app => app.use("/auth", router)

//E e assim que se programa. Mais nada
