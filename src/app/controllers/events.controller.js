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
const messages = require("../jsonmessages/messages")

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
        const event = await EventCollection.findOne({ _id })
        .select("-__v")
        .sort({ dateStart: 1, hourStart: 1 }).lean()
        if (event) {
            // get related events (with same tags or courses)
            const related = await EventCollection.find().and([
                {
                    $or: [
                        {
                            tags: {
                                $in: event.tags
                            },
                        },
                        {
                            coursesIds: {
                                $in: event.coursesIds
                            }
                        }
                    ]
                },
                {
                    _id: {
                        $ne: event._id
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
                } else if(a.dateStart < b.dateStart) {
                    return 1
                }
                return 0
            })
            
            // resolves info (tags, courses, author username)
            const users = await User.find().select("username picture").lean()
            const tags = await Tag.find().select("-__v").lean()
            const courses = await Course.find().select("-__v").lean()
            
            // resolves event info
            event.author = controllers.users.util.getUsernameById(event.authorId, users)
            event.author.picture = undefined
            event.authorId = undefined
            
            event.tags = controllers.tags.util.getByIdsArray(event.tags, tags)
            
            event.courses = controllers.courses.util.getByIdsArray(event.coursesIds, courses)
            event.coursesIds = undefined
            
            let enrollments = []
            event.enrollments.forEach(enrollment => {
                enrollment.user = controllers.users.util.getUsernameById(enrollment.userId, users)
                enrollment.userId = undefined
            })
            
            event.discussions.forEach(discussion => {
                discussion.answers = discussion.answers.length
                discussion.content = undefined
                
                discussion.author = controllers.users.util.getUsernameById(discussion.authorId, users)
                discussion.authorId = undefined
                
                discussion.usersVoted.forEach(userVoted => {
                    userVoted = controllers.users.util.getUsernameById(userVoted, users)
                })
                
                
            })
            
            // resolves related events info
            related.forEach(relatedEvent => {
                relatedEvent.author = controllers.users.util.getUsernameById(relatedEvent.authorId, users)
                relatedEvent.author.picture = undefined
                relatedEvent.authorId = undefined
                
                relatedEvent.tags = controllers.tags.util.getByIdsArray(relatedEvent.tags, tags)
            })
            
            return res.send({
                event: event,
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
            return res.status(400).send({
                name: "wrongQueryParameters",
                messages: {
                    en: "Select one of the following occasions as query parameter: 'today', 'before', 'after'."
                },
                content: {
                    events: []
                },
                status: 400,
                success: false
            })
        }
        if(!events.length) {
            res.status(messages.event.notFound.status).send(messages.event.notFound)
        }
        await util.resolveEventInfo(events)
        return res.status(messages.success().status).send(messages.success("getEventsByOccasion", { events }))
    } catch(err) {
        return res.status(messages.db.error.status).send(messages.db.error)
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

async function getDiscussionById(req, res) {
    const { id: _id, discussionId } = req.params

    try {
        const event = await EventCollection.findOne({ _id }).lean()
        if(!event) {
            return res.send({ error: "Event not found." })
        }
        
        let eventDiscussion
        event.discussions.forEach(discussion => {
            if(discussion._id.equals(discussionId)) {
                eventDiscussion = discussion
            }
        })
        
        const users = await User.find().select("username picture profileId").lean()
        // resolves author info
        eventDiscussion.author = controllers.users.util.getUsernameById(eventDiscussion.authorId, users)
        eventDiscussion.authorId = undefined
        
        // resolves answers authors info
        eventDiscussion.answers.forEach(answer => {
            answer.author = controllers.users.util.getUsernameById(answer.authorId, users)
            answer.authorId = undefined
        })
        

        return res.send({
            event: {
                _id: event._id,
                category: event.category,
                name: event.name
            },
            discussion: eventDiscussion
        })
    } catch(err) {
        return res.status(400).send({ error: "Could not find discussion. " + err })
    }
}

async function addDiscussion(req, res) {
    const _id = req.params.id
    const { authorId, category, title, content } = req.body
    try {
        const event = await EventCollection.findOne({ _id })
        if(!event) {
            return res.status(400).send({ error: "Event does not exist." })
        }
        
        // verifies user
        const user = User.findOne({ _id: authorId }).lean()
        if(!user) {
            return res.status(400).send({ error: "User does not exist." })
        }
        
        event.discussions.push({ authorId, category, title, content, upvotes: 0, downvotes: 0 })
        await event.save()
        return res.send()
    } catch(err) {
        return res.status(400).send({ error: "Could not add discussion: " + err })
    }
}

async function removeDiscussionById(req, res) {
    
}

async function addDiscussionAnswer(req, res) {
    const { id: _id, discussionId } = req.params
    const { event, discussion } = req
    const { authorId, content } = req.body
    
    try {
        discussion.answers.push({ authorId, content })
        await event.save()
        return res.send()
    } catch(err) {
        return res.status(400).send({ error: err.message })
    }
}

async function removeDiscussionAnswer(req, res) {
    
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
    },
    middlewares: {
        async verifiesEventIntegrity(req, res, next) {
            try {
                const event = await EventCollection.findOne({ _id: req.params.id })
                if(!event) {
                    return res.status(messages.event.notFound.status).send(messages.event.notFound)
                }
                req.event = event
                return next()
            } catch (err) {
                return res.status(messages.db.error.status).send(messages.db.error)
            }
        },
        async verifiesDiscussionIntegrity(req, res, next) {
            try {
                const event = req.event
                const discussion = event.discussions.find(eventDiscussion => eventDiscussion._id.equals(req.params.discussionId))
                if(!discussion) {
                    return res.status(messages.event.discussion.notFound.status).send(messages.event.discussion.notFound)
                }
                req.discussion = discussion
                return next()
            } catch (err) {
                return res.status(messages.db.error.status).send(messages.db.error)
            }
        }
    }
}

module.exports = {
    util,
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
    removeEnrollment,
    getDiscussionById,
    addDiscussion,
    removeDiscussionById,
    addDiscussionAnswer,
    removeDiscussionAnswer
}