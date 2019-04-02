const express = require("express")
const router = express.Router()
const controller = require("../controllers/events.controller")
const auth = require("../middlewares/auth.middleware")
const proponentClearance = require("../middlewares/proponentClearance.middleware")

router.get("/", controller.get)
router.get("/:id", controller.getById)
router.post("/", auth, proponentClearance, controller.add)
router.put("/:id", auth, proponentClearance, controller.edit)
router.delete("/:id", auth, proponentClearance, controller.remove)

module.exports = app => app.use("/events", router)