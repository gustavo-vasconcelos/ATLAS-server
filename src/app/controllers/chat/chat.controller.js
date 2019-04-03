const Chat = require("../../models/chat.model")

async function add(req, res) {
    try {
        await Chat.create(req.body)
        return res.send()
    } catch (err) {
        return res.status(400).send({ error: "Could not add chat. " + err })
    }
}

async function get(req, res) {
    try {
        return res.send(await Chat.find())
    } catch (err) {
        return res.status(400).send({ error: "Could not get chats. " + err })
    }
}

async function getById(req, res) {
    const _id = req.params.id
    const error = "Could not get chat. "
    try {
        const response = await Chat.findOne({ _id })
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
    const error = "Could not edit chat. "
    try {
        if (await Chat.findOne({ _id })) {
            await Chat.findByIdAndUpdate(_id, req.body)
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
    const error = "Could not remove chat. "
    try {
        if (await Chat.findOne({ _id })) {
            await Chat.findByIdAndDelete(_id)
            return res.send()
        } else {
            return res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        return res.status(400).send({ error: error + err })
    }
}

module.exports = { add, get, getById, edit, remove }