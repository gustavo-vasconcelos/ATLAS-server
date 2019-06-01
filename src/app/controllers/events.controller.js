const EventCollection = require("../models/events.model")
const moment = require("moment")
const axios = require("axios")
const config = require("../../config")
const User = require("../models/users.model")
const Tag = require("../models/tags.model")
const Course = require("../models/courses.model")
const utils = require("../utils")
const controllers = {
    tags: require("./tags.controller"),
    users: require("./users.controller"),
    courses: require("./courses.controller")
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
            res.send(await EventCollection.find()
            .select(util.data.defaultSelection)
            .sort({ dateStart: 1, hourStart: 1 }).skip(utils.resolvePage(page, 5)).limit(5))
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
        const response = await EventCollection.find({ _id })
        .select("-__v")
        .sort({ dateStart: 1, hourStart: 1 })
        .lean()
        if (response) {
            await util.resolveEventInfo(response)
            return res.send(response)
        } else {
            return res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        return res.status(400).send({ error: error + err })
    }
}

async function getByIdAndRelated(req, res) {
    const _id = req.params.id
    const error = "Could not get event. "
    try {
        const response = await EventCollection.findOne({ _id })
        .select("-__v")
        .sort({ dateStart: 1, hourStart: 1 }).lean()
        if (response) {
            // get related events (with same tags or courses)
            const related = await EventCollection.find().and([
                {
                    $or: [
                        {
                            tags: {
                                $in: response.tags
                            },
                        },
                        {
                            coursesIds: {
                                $in: response.coursesIds
                            }
                        }
                    ]
                },
                {
                    _id: {
                        $ne: response._id
                    }
                }
            ])
            .select("_id picture.thumbnail tags authorId name category classroom hourStart hourEnd dateStart dateEnd enrollments description classroom")
            .sort({ dateStart: 1, hourStart: 1 })
            .lean()
            
            // randomly sorts related events
            related.sort((a, b) => {
                return 0.5 - Math.random()
            })
            
            if(related.length > 4) related.length = 4
            
            // sorts by date again
            related.sort((a, b) => {
                if(a.dateStart > b.dateStart) {
                    return -1
                } else {
                    return 1
                }
                return 0
            })
            
            // resolves info (tags, courses, author username)
            const users = await User.find().select("username picture").lean()
            const tags = await Tag.find().select("-__v").lean()
            const courses = await Course.find().select("-__v").lean()
            
            // event
            response.author = controllers.users.util.getUsernameById(response.authorId, users)
            response.author.picture = undefined
            response.authorId = undefined
            
            response.tags = controllers.tags.util.getByIdsArray(response.tags, tags)
            
            response.courses = controllers.courses.util.getByIdsArray(response.coursesIds, courses)
            response.coursesIds = undefined
            
            let enrollments = []
            for(let enrollment of response.enrollments) {
                enrollment.user = controllers.users.util.getUsernameById(enrollment.userId, users)
                enrollment.userId = undefined
            }
            
            for(const event of related) {
                event.author = controllers.users.util.getUsernameById(event.authorId, users)
                event.author.picture = undefined
                event.authorId = undefined
                
                event.tags = controllers.tags.util.getByIdsArray(event.tags, tags)
            }
            
            return res.send({
                event: response,
                related
            })
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
    const selectOptions = ""
    
    let events = null
    
    try {
        if(occasion === "before") {
            if(page) {
                events = await EventCollection.find({
                    dateStart: {
                        $lt: date
                    }
                })
                .select(util.data.defaultSelection)
                .sort({ dateStart: 1, hourStart: 1 })
                .skip(utils.resolvePage(page, 5)).limit(5).lean()
            } else {
                events = await EventCollection.find({
                    dateStart: {
                        $lt: date
                    }
                })
                .select(util.data.defaultSelection)
                .sort({ dateStart: 1, hourStart: 1 }).lean()
            }
        } else if (occasion === "after") {
            if(page) {
                events = await EventCollection.find({
                    dateStart: {
                        $gt: date
                    }
                })
                .select(util.data.defaultSelection)
                .sort({ dateStart: 1, hourStart: 1 })
                .skip(utils.resolvePage(page, 5)).limit(5).lean()
            } else {
                events = await EventCollection.find({
                    dateStart: {
                        $gt: date
                    }
                })
                .select(util.data.defaultSelection)
                .sort({ dateStart: 1, hourStart: 1 }).lean()
            }
        } else {
            events = await EventCollection.find({
                dateStart: {
                    $gte: date,
                    $lte: date
                }
            })
            .select(util.data.defaultSelection)
            .sort({ dateStart: 1, hourStart: 1 }).lean()
        }
        // resolves tags names and author username
        if(events) {
            await util.resolveEventInfo(events) 
            return res.send(events)
        } else {
            return res.send({ error: "Could not find events with these parameters." })
        }
        
    } catch (err) {
        return res.status(400).send({ error: error + err })
    }
}

async function getOccasions(req, res) {
    const occasion = req.query.occasion
    
    try {
        let events = null
        if(occasion === "before") {
            events = await EventCollection.find({
                dateStart: {
                    $lt: moment(new Date).toDate()
                }
            })
            .select(util.data.defaultSelection)
            .sort({ dateStart: 1, hourStart: 1 }).lean()
        } else if(occasion === "after") {
            events = await EventCollection.find({
                dateStart: {
                    $gt: moment(new Date).toDate(),
                }
            })
            .select(util.data.defaultSelection)
            .sort({ dateStart: 1, hourStart: 1 }).lean()
        } else if(occasion === "today") {
            events = await EventCollection.find({
                dateStart: {
                    $gte: moment(new Date).startOf('day').toDate(),
                    $lte: moment(new Date).endOf('day').toDate()
                }
            })
            .select(util.data.defaultSelection)
            .sort({ dateStart: 1, hourStart: 1 }).lean()
        } else {
            return res.send({ error: "Could not get events. Select an occasion as query parameter: ['today', 'before', 'after']." })
        }
        if(events) {
            await util.resolveEventInfo(events)
            return res.send(events)
        }
        return res.send()
    } catch(err) {
        return res.status(400).send({error: "Could not get today events: " + err})
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
        const events = await EventCollection.find({ authorId })
        .select(util.data.defaultSelection)
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
        })
        .select(util.data.defaultSelection)
        .sort({ dateStart: 1, hourStart: 1 }).lean()

        await util.resolveEventInfo(events)
        
        return res.send(events)
    } catch(err) {
        return res.status(400).send({ error: `Could not get enrolled events: ${err}` })
    }
}

async function addEnrollment(req, res) {
    const _id = req.params.id
    const { userId, paid } = req.body
    
    try {
        const event = await EventCollection.findOne({ _id })
        if(!event) {
            return res.status(400).send({ error: "Event does not exist." })
        }
        
        // verifies user
        const user = await User.findOne({ _id: userId })
        if(!user) {
            return res.status(400).send({ error: "User does not exist." })
        }
        
        const alreadyEnrolled = event.enrollments.find(enrollment => enrollment.userId.equals(userId))
        if(alreadyEnrolled) {
            return res.status(400).send({ error: "User already enrolled." })
        }
        
        event.enrollments.push({ userId, paid })
        await event.save()
        
        return res.send()
    } catch(err) {
        return res.status(400).send({ error: "Could not add enrollment: " + err })
    }
}

async function removeEnrollment(req, res) {
    const { id: _id, userId } = req.params
    
    try {
        const event = await EventCollection.findOne({ _id })
        if(!event) {
            return res.status(400).send({ error: "Event does not exist." })
        }
        
        // verifies user
        const user = await User.findOne({ _id: userId })
        if(!user) {
            return res.status(400).send({ error: "User does not exist." })
        }
        
        const enrolledEvent = event.enrollments.findIndex(enrollment => enrollment.userId.equals(userId))
        if(enrolledEvent === -1) {
            return res.status(400).send({ error: "User is not enrolled." })
        }
        event.enrollments.splice(enrolledEvent, 1)
        await event.save()
        return res.send()
    } catch(err) {
        return res.status(400).send({ error: "Could not remove enrollment: " + err })
    }
}

const util = {
    data: {
        defaultSelection: "_id picture.thumbnail tags authorId name category classroom hourStart hourEnd dateStart dateEnd enrollments description coursesIds classroom"  
    },
    async resolveEventInfo(events) {
        const proponents = await User.find({ profileId: { $ne: 1 } }).select("username").lean()
        const tags = await Tag.find().select("-__v").lean()
        const courses = await Course.find().select("-__v").lean()
        
        for(const event of events) {
            event.author = controllers.users.util.getUsernameById(event.authorId, proponents)
            event.authorId = undefined
            
            event.tags = controllers.tags.util.getByIdsArray(event.tags, tags)
            
            event.courses = controllers.courses.util.getByIdsArray(event.coursesIds, courses)
            event.coursesIds = undefined
        }
    }
}

module.exports = {
    add,
    get,
    getById,
    getByDate,
    getOccasions,
    edit,
    remove,
    getByAuthorId,
    getEnrolledByUserId,
    getByIdAndRelated,
    addEnrollment,
    removeEnrollment
}