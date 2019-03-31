const User = require("../models/users.model")

async function add(req, res) {
    try {
        await User.create(req.body)
        res.send()
    } catch (err) {
        res.status(400).send({ error: "Could not add user. " + err })
    }
}

async function get(req, res) {
    try {
        res.send(await User.find())
    } catch (err) {
        res.status(400).send({ error: "Could not get users. " + err })
    }
}

async function edit(req, res) {
    const _id = req.params.id
    const error = "Could not edit user. "
    try {
        if (await User.findOne({ _id })) {
            await User.findByIdAndUpdate(_id, req.body)
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
    const error = "Could not remove user. "
    try {
        if (await User.findOne({ _id })) {
            await User.findByIdAndDelete(_id)
            res.send()
        } else {
            res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        res.status(400).send({ error: error + err })
    }
}

module.exports = { add, get, edit, remove }
