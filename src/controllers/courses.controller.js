const Course = require("../models/courses.model")

async function add(req, res) {
    try {
        await Course.create(req.body)
        res.send()
    } catch (err) {
        res.status(400).send({ error: "Could not add course. " + err })
    }
}

async function get(req, res) {
    try {
        res.send(await Course.find())
    } catch (err) {
        res.status(400).send({ error: "Could not get courses. " + err })
    }
}

async function edit(req, res) {
    const _id = req.params.id
    const error = "Could not edit course. "
    try {
        if (await Course.findOne({ _id })) {
            await Course.findByIdAndUpdate(_id, req.body)
            res.send()
        } else {
            res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        res.status(400).send({ error: error + err })
    }
}

async function remove(req, res) {
    const _id = req.params.id
    const error = "Could not remove course. "
    try {
        if (await Course.findOne({ _id })) {
            await Course.findByIdAndDelete(_id)
            res.send()
        } else {
            res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        res.status(400).send({ error: error + err })
    }
}

module.exports = { get, add, edit, remove }