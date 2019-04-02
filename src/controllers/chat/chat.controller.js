const Chat = require("../../models/chat.model")

async function add(req, res) {
    try {
        await Chat.create(req.body)
        res.send()
    } catch (err) {
        res.status(400).send({ error: "Could not add chat. " + err })
    }
}

async function get(req, res) {
    try {
        res.send(await Chat.find())
    } catch (err) {
        res.status(400).send({ error: "Could not get chats. " + err })
    }
}

async function edit(req, res) {
    const _id = req.params.id
    const error = "Could not edit chat. "
    try {
        if (await Chat.findOne({ _id })) {
            await Chat.findByIdAndUpdate(_id, req.body)
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
    const error = "Could not remove chat. "
    try {
        if (await Chat.findOne({ _id })) {
            await Chat.findByIdAndDelete(_id)
            res.send()
        } else {
            res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        res.status(400).send({ error: error + err })
    }
}

module.exports = { get, add, edit, remove }