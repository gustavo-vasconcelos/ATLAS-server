const express = require("express")
const router = express.Router()
const controller = require("../controllers/users.controller")
const auth = require("../middlewares/auth.middleware")
const proponentClearance = require("../middlewares/proponentClearance.middleware")
const adminClearance = require("../middlewares/adminClearance.middleware")

router.get("/", controller.get)
router.get("/:id", controller.getById)
router.post("/", auth, adminClearance, controller.add)
router.put("/:id", auth, adminClearance, controller.edit)
router.delete("/:id", auth, adminClearance, controller.remove)

module.exports = app => app.use("/users", router)