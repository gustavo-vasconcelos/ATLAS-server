const EventCollection = require("../models/events.model")
const moment = require("moment")
const axios = require("axios")
const config = require("../../config")
const User = require("../models/users.model")
const Tag = require("../models/tags.model")
const utils = require("../utils")
const controllers = {
    tags: require("./tags.controller"),
    users: require("./users.controller")
}

async function add(req, res) {
    const { tags, enrollments } = req.body
    let repeatedTags = false, repeatedEnrollments = []
    try {
        
        tags.forEach((tag, index) => {
            const tagIndex = tags.indexOf(tag)
            if(tagIndex !== -1 && index !== tagIndex) {
                repeatedTags = true
            }
        })
        
        enrollments.forEach((enrollment, index) => { 
            const result = enrollments.find((enroll, enrollIndex) => enroll.userId === enrollment.userId && enrollIndex !== index)
            if(result) {
                repeatedEnrollments.push(result)
            }

        })

        if(!repeatedTags && !repeatedEnrollments.length) {
            await EventCollection.create(req.body)
            return res.send()
        } else {
            return res.status(400).send({error: "Could not add event. Duplicated tag id or enrollment id."})
        }
        
    } catch (err) {
        return res.status(400).send({ error: "Could not add event. " + err })
    }
}

async function get(req, res) {
    const page = parseInt(req.query.page)
    
    try {
        if(!page) {
            res.send(await EventCollection.find().sort({ dateStart: 1, hourStart: 1 }))
        } else {
            res.send(await EventCollection.find().sort({ dateStart: 1, hourStart: 1 }).skip(utils.resolvePage(page, 5)).limit(5))
        }
        return
    } catch (err) {
        return res.status(400).send({ error: "Could not get events. " + err })
    }
}

async function getById(req, res) {
    const _id = req.params.id
    const error = "Could not get event. "
    try {
        const response = await EventCollection.findOne({ _id }).sort({ dateStart: 1, hourStart: 1 })
        if (response) {
            return res.send(response)
        } else {
            return res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        return res.status(400).send({ error: error + err })
    }
}

async function getByDate(req, res) {
    const error = "Could not get events. "
    const date = moment(req.params.date).toDate()
    const occasion = req.query.occasion
    const page = parseInt(req.query.page)
    
    try {
        let response
        switch(occasion) {
            case "before":
                if(page) {
                    response = await EventCollection.find({
                        dateStart: {
                            $lt: date
                        }
                    }).sort({ dateStart: 1, hourStart: 1 })
                    .skip(utils.resolvePage(page, 5)).limit(5)
    
                    return res.send(response)
                } else {
                    response = await EventCollection.find({
                        dateStart: {
                            $lt: date
                        }
                    }).sort({ dateStart: 1, hourStart: 1 })
                    res.send(response)
                }
                break
            case "after":
                if(page) {
                
                } else {
                    
                }
                break
            case "today":
                response = await EventCollection.find({
                    dateStart: {
                        $gte: moment(new Date).startOf('day').toDate(),
                        $lte: moment(date).endOf('day').toDate()
                    }
                }).sort({ dateStart: 1, hourStart: 1 })
                return res.send(response)
                break
            default:
                response = await EventCollection.find({
                    dateStart: {
                        $gte: date,
                        $lte: moment(date).endOf('day').toDate()
                    }
                }).sort({ dateStart: 1, hourStart: 1 })
                return res.send(response)
        }
        return
    } catch (err) {
        return res.status(400).send({ error: error + err })
    }
}

async function edit(req, res) {
    const _id = req.params.id
    const error = "Could not edit event. "
    try {
        if (await EventCollection.findOne({ _id })) {
            await EventCollection.findByIdAndUpdate(_id, req.body)
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
    const error = "Could not remove event. "
    try {
        if (await EventCollection.findOne({ _id })) {
            await EventCollection.findByIdAndDelete(_id)
            return res.send()
        } else {
            return res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        return res.status(400).send({ error: error + err })
    }
}

async function getByAuthorId(req, res) {
    const authorId = req.params.id
    
    try {
        const events = await EventCollection.find({ authorId },
        "_id picture.thumbnail tags authorId name category classroom hourStart hourEnd dateStart dateEnd enrollments description")
        .sort({ dateStart: 1, hourStart: 1 }).lean()

        await util.resolveEventInfo(events)
        
        return res.send(events)
    } catch (err) {
        return res.status(400).send({ error: `Could not get events created by '${authorId}': ${err}` })
    }
   
}

async function getEnrolledByUserId(req, res) {
    const userId = req.params.id
    try {
        const events = await EventCollection.find({
            "enrollments.userId": userId
        },"_id picture.thumbnail tags authorId name category classroom hourStart hourEnd dateStart dateEnd enrollments description")
        .sort({ dateStart: 1, hourStart: 1 }).lean()

        await util.resolveEventInfo(events)
        
        return res.send(events)
    } catch(err) {
        return res.status(400).send({ error: `Could not get enrolled events: ${err}` })
    }
}

const util = {
    async resolveEventInfo(events) {
        const proponents = await User.find({ profileId: { $ne: 1 } }).select("username").lean()
        const tags = await Tag.find().select("-__v").lean()
        
        for(const event of events) {
            event.author = controllers.users.util.getUsernameById(event.authorId, proponents)
            event.authorId = undefined
            event.tags = controllers.tags.util.getByIdsArray(event.tags, tags)
        }
    }
}

module.exports = { add, get, getById, getByDate, edit, remove, getByAuthorId, getEnrolledByUserId }