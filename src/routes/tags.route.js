const express = require("express")
const router = express.Router()
const controller = require("../controllers/tags.controller")

router.get("/", controller.get)
router.post("/", controller.add)
router.put("/:id", controller.edit)
router.delete("/:id", controller.remove)

module.exports = app => app.use("/tags", router)