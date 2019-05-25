const User = require("../models/users.model")
const Tag = require("../models/tags.model")
const Course = require("../models/courses.model")
const utils = require("../utils")
const controllers = {
    tags: require("./tags.controller"),
    courses: require("./courses.controller")
}

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
        let users
        if(username) {
            users = await User.findOne({ username }, "-__v").lean()
        } else {
            users = await User.find({}, "-__v").lean()
        }
        
        // if there is only one user there is need to make it an array, so for loop can be used
        if(users) {
            if(!users.length) {
                const temp = users
                users = []
                users.push(temp)
            }
        } else {
            // no user found
            return res.send({})
        }
        await util.resolveInterests(users)
        
        return users.length === 1 ? res.send(users[0]) : res.send(users)
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

const util = {
    getUsernamesByIdsArray(ids, proponents) {
        let proponentsInfo = []
        ids.forEach(id => {
            proponents.forEach(proponent => {
                if(proponent._id.equals(id)) {
                    proponentsInfo.push(proponent)
                }
            })
        })
        return proponentsInfo
    },
    getUsernameById(id, proponents) {
        let proponentsInfo = []
        if(Array.isArray(proponents)) {
            proponents.forEach(proponent => {
                if(proponent._id.equals(id)) {
                    proponentsInfo.push(proponent)
                }
            })
        } else {
            if(proponents._id.equals(id)) {
                proponentsInfo.push(proponents)
            }   
        }
        return proponentsInfo[0]
    },
    async resolveInterests(users) {
        const tags = await Tag.find().select("-__v").lean()
        const courses = await Course.find().select("-__v").lean()
        const proponents = await User.find({ profileId: { $ne: 1 } }).select("username").lean()
        
        for(const user of users) {
            // converts ids to info
            user.interests.tags = controllers.tags.util.getByIdsArray(user.interests.tags, tags)
            user.interests.courses = controllers.courses.util.getByIdsArray(user.interests.courses, courses)
            user.interests.proponents = util.getUsernamesByIdsArray(user.interests.proponents, proponents)
        }
    }
}

module.exports = { add, get, getById, edit, remove, util }
