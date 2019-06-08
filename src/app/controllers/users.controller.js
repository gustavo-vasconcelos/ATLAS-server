const User = require("../models/users.model")
const Tag = require("../models/tags.model")
const Course = require("../models/courses.model")
const EventCollection = require("../models/events.model")
const utils = require("../utils")
const controllers = {
    tags: require("./tags.controller"),
    courses: require("./courses.controller")
}
const messages = require("../jsonmessages/messages")

async function add(req, res) {
    try {
        await User.create(req.body)
        return res.send()
    } catch (err) {
        return res.status(400).send({ error: "Could not add user. " + err })
    }
}

async function get(req, res) {
    try {
        const users = await User.find().select("picture firstName lastName username email profileId").lean()
        users.forEach(user => {
            switch(user.profileId) {
                case 1: 
                    user.profile = "Aluno"
                    break
                case 2:
                    user.profile = "Proponente"
                    break
                case 3:
                    user.profile = "Administrador"
                    break
            }
            user.profileId = undefined
        })
        res.status(messages.user.getUsers().status).send(messages.user.getUsers(users, "getUsers"))
    } catch(err) {
        console.log(err)
        res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function getToProfile(req, res) {
    const username = req.params.username
    try {
        const user = await User.findOne({ username }, "-__v").lean()
        if(!user) {
            return res.status(404).send({
                name: "userNotFound",
                content: {
                    user: {}
                },
                status: 404,
                success: false  
            })
        }
        
        // gets main info
        const proponents = await User.find({ profileId: { $ne: 1 } }).select("username").lean()
        const tags = await Tag.find().select("-__v").lean()
        const courses = await Course.find().select("-__v").lean()
        
        // converts ids to info
        user.interests.tags = controllers.tags.util.getByIdsArray(user.interests.tags, tags)
        user.interests.courses = controllers.courses.util.getByIdsArray(user.interests.courses, courses)
        user.interests.proponents = util.getUsernamesByIdsArray(user.interests.proponents, proponents)
        
        
        let createdEvents
        if(user.profileId > 1) {
            createdEvents = await EventCollection.find({ authorId: user._id })
            .select("_id picture.thumbnail tags authorId name category classroom hourStart hourEnd dateStart dateEnd enrollments description classroom")
            .sort({ dateStart: 1, hourStart: 1 }).lean()
        
             for(const event of createdEvents) {
                event.author = util.getUsernameById(event.authorId, proponents)
                event.authorId = undefined
                
                event.tags = controllers.tags.util.getByIdsArray(event.tags, tags)
                
                event.enrollments = event.enrollments.length
            }
        }
        
        const enrolledEvents = await EventCollection.find({
            "enrollments.userId": user._id
        })
        .select("_id picture.thumbnail tags authorId name category classroom hourStart hourEnd dateStart dateEnd enrollments description classroom")
        .sort({ dateStart: 1, hourStart: 1 }).lean()
        
        for(const event of enrolledEvents) {
            event.author = util.getUsernameById(event.authorId, proponents)
            event.authorId = undefined
            
            event.tags = controllers.tags.util.getByIdsArray(event.tags, tags)
            
            event.enrollments = event.enrollments.length
        }
        
        
        return res.send({
            name: "getUserByUsername",
            content: {
                user,
                events: {
                    created: createdEvents,
                    enrolled: enrolledEvents
                }
            },
            status: 200,
            success: true
        })
    } catch (err) {
        console.log(err)
        return res.status(messages.db.error.status).send(messages.db.error)
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

module.exports = { add, get, getById, edit, remove, util, getToProfile }
