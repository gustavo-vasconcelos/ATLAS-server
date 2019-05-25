const Tag = require("../models/tags.model")
const utils = require("../utils")

async function add(req, res) {
    try {
        await Tag.create(req.body)
        return res.send()
    } catch (err) {
        return res.status(400).send({ error: "Could not add tag. " + err })
    }
}

async function get(req, res) {
    try {
        return res.send(await Tag.find())
    } catch (err) {
        return res.status(400).send({ error: "Could not get tags. " + err })
    }
}

async function getById(req, res) {
    const _id = req.params.id
    const error = "Could not get tag. "
    try {
        const response = await Tag.findOne({ _id })
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
    const error = "Could not edit tag. "
    try {
        if (await Tag.findOne({ _id })) {
            await Tag.findByIdAndUpdate(_id, req.body)
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
    const error = "Could not remove tag. "
    try {
        if (await Tag.findOne({ _id })) {
            await Tag.findByIdAndDelete(_id)
            return res.send()
        } else {
            return res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        return res.status(400).send({ error: error + err })
    }
}

const util = {
    getByIdsArray(ids, tags) {
        let tagsInfo = []
        ids.forEach(id => {
            tags.forEach(proponent => {
                if(proponent._id.equals(id)) {
                    tagsInfo.push(proponent)
                }
            })
        })
        return tagsInfo
    }
}

module.exports = { add, get, getById, edit, remove, util }