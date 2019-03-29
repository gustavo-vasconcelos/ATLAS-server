const express = require("express")
const Course = require("../models/courses.model")

async function get(req, res) {
    try {
        const result = await Course.find()
        res.send(result)
    } catch (err) {
        res.status(400).send({ error: "Could not get courses. " + err })
    }
}

async function add(req, res) {
    const { name } = req.body
    const error = "Could not add course. "
    try {
        if (await Course.findOne({ name })) {
            res.status(400).send({ error: error + " #" + name + " already exists." })
        } else {
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