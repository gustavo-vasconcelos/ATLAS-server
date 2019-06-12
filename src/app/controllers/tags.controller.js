const Tag = require("../models/tags.model")
const utils = require("../utils/utils")
const messages = require("../jsonmessages/messages")

async function add(req, res) {
    const { name } = req.body
    try {
        await Tag.create({ name })
        return res.send({
            name: "success",
            status: 200,
            success: true
        })
    } catch (err) {
        if(err.code === 11000) {
            return res.status(400).send({
                name: "tagAlreadyExists",
                error: {
                    type: "name",
                    value: name
                },
                message: {
                    pt: `A tag #${name} já existe.`
                },
                status: 400,
                success: false
            })
        }
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function get(req, res) {
    try {
        const tags = await Tag.find().select("-__v").sort({ name: 1 })
        return res.status(messages.success().status).send(messages.success("getTags", { tags }))
    } catch (err) {
        return res.status(messages.db.error.status).send(messages.db.error)
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