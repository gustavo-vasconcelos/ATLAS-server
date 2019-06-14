const User = require("../models/users.model")
const Tag = require("../models/tags.model")
const Course = require("../models/courses.model")
const EventCollection = require("../models/events.model")
const utils = require("../utils/utils")
const controllers = {
    tags: require("./tags.controller"),
    courses: require("./courses.controller")
}
const messages = require("../jsonmessages/messages")
const http = require("axios")

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
    let { 
        firstName,
        lastName,
        profileId,
        username,
        email,
        picture,
        gender
    } = req.body
    const error = "Could not edit user. "
    try {
        let user = await User.findOne({ _id })
        if (user) {
            if(!gender) gender = user.gender
            gender = (gender < 1 || gender > 2) ? 1 : Math.floor(gender)
            
            if(!picture) {
                picture = gender === 1 ? "https://i.imgur.com/uUbH9go.png" : "https://i.imgur.com/moL2juW.png"
            }
            
            if(req.loggedUserProfile !== "admin") {
                await User.findOneAndUpdate({ _id }, {
                    firstName,
                    lastName,
                    picture,
                    gender
                })
            } else {
                if(!profileId) profileId = user.profileId
                profileId = (profileId < 1 || profileId > 3) ? 1 : Math.floor(profileId)
                
                let error = ""
                let errors = []
                const sameEmail = await User.findOne({
                    _id: { $ne: _id },
                    email
                })
                
                if(sameEmail) {
                    error += "Email em uso. "
                    errors.push({
                        type: "email",
                        value: email
                    })
                }
                
                const sameUsername = await User.findOne({
                    _id: { $ne: _id },
                    username
                })
                
                if(sameUsername && !sameEmail) {
                    error += "Nome de utilizador em uso."
                    errors.push({
                        type: "username",
                        value: username
                    })
                }
                
                
                if(sameEmail || sameUsername) {
                    return res.send({
                        name: "error",
                        errors,
                        message: { 
                            pt: error
                        },
                        status: 400,
                        success: false
                    })
                }
                
                await User.findOneAndUpdate({ _id }, {
                    firstName,
                    lastName,
                    picture,
                    gender,
                    username,
                    email,
                    profileId
                })
            }
            
            const updatedUser = await User.findOne({ _id }).lean()
            
            // gets main info
            const proponents = await User.find({ profileId: { $ne: 1 } }).select("username").lean()
            const tags = await Tag.find().select("-__v").lean()
            const courses = await Course.find().select("-__v").lean()
            
            // converts ids to info
            updatedUser.interests.tags = controllers.tags.util.getByIdsArray(updatedUser.interests.tags, tags)
            updatedUser.interests.courses = controllers.courses.util.getByIdsArray(updatedUser.interests.courses, courses)
            updatedUser.interests.proponents = util.getUsernamesByIdsArray(updatedUser.interests.proponents, proponents)
            
            return res.send({
                name: "userEdited",
                content: {
                    user: updatedUser
                },
                status: 200,
                success: true
            })
        } else {
            return res.status(404).send({
                name: "userNotFound",
                status: 404,
                success: false
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function remove(req, res) {
    const _id = req.params.id
    try {
        const user = await User.findOne({ _id })
        
        if(!user) {
            return res.status(messages.user.notFound.status).send(messages.user.notFound)
        } else if(user._id.equals(req.loggedUserId)){
            return res.status(400).send({
                name: "cannotRemoveSelf",
                message: {
                    en: "Cannot remove yourself.",
                },
                status: 400,
                success: false
            })
        }
        
        const createdEvents = await EventCollection.find({ "authorId": _id })
        if(createdEvents.length) {
            return res.status(400).send({
                name: "cannotRemoveUser",
                message: {
                    pt: `O utilizador @${user.username} criou ${createdEvents.length} eventos: ${createdEvents.map(createdEvent => createdEvent.name).join(", ")}. Remova os eventos em questão para continuar.`
                }
            })
        }
        
        // removes enrollments, created discussions and discussion answers
        const events = await EventCollection.find({
            $or: [
                {
                    "enrollments.userId": _id
                },
                {
                    "discussions.authorId": _id
                },
                {
                    "discussions.answers.authorId": _id
                }
            ]
        }).select("enrollments discussions")

        for(const event of events) {
            event.enrollments.forEach((enrollment, index) => {
                if(enrollment.userId.equals(user._id)) {
                    event.enrollments.splice(index, 1)
                }
            })

            event.discussions.forEach((discussion, index) => {
                if(discussion.authorId.equals(_id)) {
                    event.discussions.splice(index, 1)
                } else {
                    discussion.answers.forEach((answer, answerIndex) => {
                        if(answer.authorId.equals(_id)) {
                            discussion.answers.splice(answerIndex, 1)
                        }
                    })
                }
            })
            await event.save()
        }
        //await events.save()
        
        // when everything is removed, removes user
        //await user.remove()
        res.send({
            name: "userRemoved",
            status: 200,
            success: true
        })
    } catch (err) {
        console.log(err)
        return res.status(messages.db.error.status).send(messages.db.error)
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
