const express = require("express")
const Tag = require("../models/tags.model")

async function get(req, res) {
    try {
        const result = await Tag.find()
        res.send(result)
    } catch (err) {
        res.status(400).send({ error: "Could not get tags. " + err })
    }
}

async function add(req, res) {
    const { name } = req.body
    const error = "Could not add tag. "
    try {
        if (await Tag.findOne({ name })) {
            res.status(400).send({ error: error + "Tag #" + name + " already exists." })
        }
        else {
            try {
                await Tag.create(req.body)
                res.send()
            } catch (err) {
                res.status(400).send({ error: error + err })
            }
        }
    } catch (err) {
        res.status(400).send({ error: error + err })
    }
}

module.exports = { get, add }