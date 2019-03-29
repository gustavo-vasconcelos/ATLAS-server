const express = require("express")
const Tag = require("../models/tags.model")
const router = express.Router()

router.post("/add", async (req, res) => {
    try {
        const tag = await Tag.create(req.body)
        return res.send({ tag })
    } catch (err) {
        return res.status(400).send({ error: "Could not add tag. Error: " + err})
    }
})

module.exports = app => app.use("/tags", router)