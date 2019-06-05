const express = require("express")
const router = express.Router()
const controller = require("../controllers/auth.controller")
const auth = require("../middlewares/auth.middleware")

router.get("/jwt", auth, controller.getUserByJwt)
router.post("/sign-up", controller.signUp)
router.post("/sign-in", controller.signIn)
router.post("/forgot-password", controller.forgotPassword)
router.post("/reset-password", controller.resetPassword)
router.post("/permissions", controller.checkPermissions)

module.exports = app => app.use("/auth", router)

