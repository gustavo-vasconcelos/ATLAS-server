const Medal = require("../models/medals.model")

async function add(req, res) {
    try {
        await Medal.create(req.body)
        return res.send()
    } catch (err) {
        return res.status(400).send({ error: "Could not add medal. " + err })
    }
}

async function get(req, res) {
    try {
        return res.send(await Medal.find())
    } catch (err) {
        return res.status(400).send({ error: "Could not get medals. " + err })
    }
}

async function getById(req, res) {
    const _id = req.params.id
    const error = "Could not get medal. "
    try {
        const response = await Medal.findOne({ _id })
        if (response) {
            return res.send(response)
        } else {
            return res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        return res.status(400).send({ error: error + err })
    }
}

async function edit(req, res) {
    const _id = req.params.id
    const error = "Could not edit medal. "
    try {
        if (await Medal.findOne({ _id })) {
            await Medal.findByIdAndUpdate(_id, req.body)
            return res.send()
        } else {
            return res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        return res.status(400).send({ error: error + err })
    }
}

async function remove(req, res) {
    const _id = req.params.id
    const error = "Could not remove medal. "
    try {
        if (await Medal.findOne({ _id })) {
            await Medal.findByIdAndDelete(_id)
            return res.send()
        } else {
            return res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        return res.status(400).send({ error: error + err })
    }
}

module.exports = { add, get, getById, edit, remove }