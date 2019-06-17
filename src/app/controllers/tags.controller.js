const Tag = require("../models/tags.model")
const utils = require("../utils/utils")
const messages = require("../jsonmessages/messages")
const User = require("../models/users.model.js")
const EventCollection = require("../models/events.model.js")

async function add(req, res) {
    const { name } = req.body
    try {
        const tag = await Tag.create({ name })
        return res.send({
            name: "addedTag",
            content: { tag },
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
    try {
        const tag = await Tag.findOne({ _id })
        if (!tag) {
            return res.status(404).send({
                name: "tagNotFound",
                status: 404,
                success: false
            })
        }
        
        const alreadyExists = await Tag.findOne({ name: req.body.name })
        if(alreadyExists) {
            return res.status(400).send({
                name: "tagAlreadyExists",
                error: {
                    type: "name",
                    value: req.body.name
                },
                message: {
                    pt: `A tag #${req.body.name} já existe.`
                },
                status: 400,
                success: false
            })
        }
        await Tag.findByIdAndUpdate(_id, req.body)
        return res.send({
            name: "editedTag",
            content: { tag },
            status: 200,
            success: true
        })
    } catch (err) {
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function remove(req, res) {
    const _id = req.params.id
    try {
        const tag = await Tag.findOne({ _id })
        if (!tag) {
            return res.status(404).send({
                name: "tagNotFound",
                status: 404,
                success: false
            })
        }
        const users = await User.find()
        for(const user of users) {
            user.interests.tags.forEach((interestedTag, index) => {
                if(interestedTag.equals(_id)) {
                    return res.status(400).send({
                        name: "tagUsed",
                        message: {
                            pt: "Tag em uso."
                        },
                        status: 400,
                        success: false
                    })
                }
            })
        }
        
        const events = await EventCollection.find()
        for(const event of events) {
            event.tags.forEach((eventTag, index) => {
                if(eventTag.equals(_id)) {
                    event.tags.splice(index, 1)
                }
            })
            await event.save()
        }
        
        await Tag.findByIdAndDelete(_id)
        return res.send({
            name: "removedTag",
            status: 200,
            success: true
        })
    } catch (err) {
        console.log(err)
        return res.status(messages.db.error.status).send(messages.db.error)
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