const Tag = require("../models/tags.model")

async function add(req, res) {
    try {
        await Tag.create(req.body)
        res.send()
    } catch (err) {
        res.status(400).send({ error: "Could not add tag. " + err })
    }
}

async function get(req, res) {
    try {
        res.send(await Tag.find())
    } catch (err) {
        res.status(400).send({ error: "Could not get tags. " + err })
    }
}

async function getById(req, res) {
    const _id = req.params.id
    const error = "Could not get tag. "
    try {
        const response = await Tag.findOne({ _id })
        if (response) {
            res.send(response)
        } else {
            res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        res.status(400).send({ error: error + err })
    }
}

async function edit(req, res) {
    const _id = req.params.id
    const error = "Could not edit tag. "
    try {
        if (await Tag.findOne({ _id })) {
            await Tag.findByIdAndUpdate(_id, req.body)
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
    const error = "Could not remove tag. "
    try {
        if (await Tag.findOne({ _id })) {
            await Tag.findByIdAndDelete(_id)
            res.send()
        } else {
            res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        res.status(400).send({ error: error + err })
    }
}

module.exports = { add, get, getById, edit, remove }