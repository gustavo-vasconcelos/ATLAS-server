const express = require("express")
const Tag = require("../models/tags.model")
const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const tag = await Tag.find()
        res.send(tag)
    } catch (err) {
        res.status(400).send({ error: "Could not get tags. Error: " + err })
    }
})

router.post("/add", async (req, res) => {
    try {
        await Tag.create(req.body)
        res.send()
    } catch (err) {
        res.status(400).send({ error: "Could not add tag. Error: " + err })
    }
})

module.exports = app => app.use("/tags", router)