const User = require("../models/users.model")

async function add(req, res) {
    try {
        await User.create(req.body)
        return res.send()
    } catch (err) {
        return res.status(400).send({ error: "Could not add user. " + err })
    }
}

async function get(req, res) {
    const { username } = req.query
    try {
        if(username) {
            const response = await User.findOne({ username })
            if(response) {
                return res.send(response)
            } else {
                return res.status(404).send({error: "User not found."})
            }
        } else {
            return res.send(await User.find())
        }
    } catch (err) {
        return res.status(400).send({ error: `Could not get users: ${err}.` })
    }
}

async function getById(req, res) {
    const _id = req.params.id
    const error = "Could not get user. "
    try {
        const response = await User.findOne({ _id })
        if (response) {
            return res.send(response)
        } else {
            return res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        return res.status(400).send({ error: error + err })
    }
}

async function getByUsername(req, res) {
    const username = req.params.username
    const error = "Could not get user. "
    try {
        const response = await User.findOne({ username })
        if (response) {
            return res.json(true)
        } else {
            return res.status(404).json(false)
        }
    } catch (err) {
        return res.status(400).send({ error: error + err })
    }
}

async function edit(req, res) {
    const _id = req.params.id
    const error = "Could not edit user. "
    try {
        if (await User.findOne({ _id })) {
            await User.findByIdAndUpdate(_id, req.body)
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
    const error = "Could not remove user. "
    try {
        if (await User.findOne({ _id })) {
            await User.findByIdAndDelete(_id)
            return res.send()
        } else {
            return res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        return res.status(400).send({ error: error + err })
    }
}

module.exports = { add, get, getById, getByUsername, edit, remove }
