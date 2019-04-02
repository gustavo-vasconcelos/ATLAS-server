const express = require("express")
const router = express.Router()
const controller = require("../controllers/courses.controller")
const auth = require("../middlewares/auth.middleware")
const adminClearance = require("../middlewares/adminClearance.middleware")

router.get("/", auth, controller.get)
router.post("/", auth, adminClearance, controller.add)
router.put("/:id", auth, adminClearance, controller.edit)
router.delete("/:id", auth, adminClearance, controller.remove)

module.exports = app => app.use("/courses", router)