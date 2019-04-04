const express = require("express")
const router = express.Router()
const controller = require("../controllers/chat/chat.controller")
const auth = require("../middlewares/auth.middleware")

router.get("/", controller.get)
router.get("/:id", controller.getById)
router.post("/", controller.add)
router.put("/:id", controller.edit)
router.delete("/:id", controller.remove)

module.exports = app => app.use("/chat", router)