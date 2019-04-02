const express = require("express")
const router = express.Router()
const controller = require("../controllers/chat/chat.controller")

router.get("/", controller.get)
router.post("/", controller.add)
router.put("/:id", controller.edit)
router.delete("/:id", controller.remove)

module.exports = app => app.use("/chat", router)