const EventCollection = require("../models/events.model")

async function add(req, res) {
    try {
        await EventCollection.create(req.body)
        res.send()
    } catch (err) {
        res.status(400).send({ error: "Could not add event. " + err })
    }
}

async function get(req, res) {
    try {
        res.send(await EventCollection.find())
    } catch (err) {
        res.status(400).send({ error: "Could not get tags. " + err })
    }
}

async function edit(req, res) {
    const _id = req.params.id
    const error = "Could not edit event. "
    try {
        if (await EventCollection.findOne({ _id })) {
            await EventCollection.findByIdAndUpdate(_id, req.body)
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
    const error = "Could not remove event. "
    try {
        if (await EventCollection.findOne({ _id })) {
            await EventCollection.findByIdAndDelete(_id)
            res.send()
        } else {
            res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        res.status(400).send({ error: error + err })
    }
}

module.exports = { add, get, edit, remove }