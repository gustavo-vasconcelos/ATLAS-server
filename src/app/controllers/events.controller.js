const EventCollection = require("../models/events.model")
const moment = require("moment")
const axios = require("axios")
const config = require("../../config")
const User = require("../models/users.model")
const Tag = require("../models/tags.model")
const Course = require("../models/courses.model")
const utils = require("../utils/utils")

const controllers = {
    tags: require("./tags.controller"),
    users: require("./users.controller"),
    courses: require("./courses.controller")
}
const messages = require("../jsonmessages/messages")

async function add(req, res) {
    let {
        name,
        category,
        tags,
        description,
        hourStart,
        hourEnd,
        dateStart,
        duration,
        paid,
        paymentPrice,
        classroom,
        coursesIds,
        thumbnail,
        poster,
        orientation,
        gallery
    } = req.body
    
    try {
        tags.forEach((tag, index) => {
            const tagIndex = tags.indexOf(tag)
            if(tagIndex !== -1 && index !== tagIndex) {
                return res.status(400).send({
                    name: "repeatedCourse",
                    status: 400,
                    success: false
                })
            }
        })
        
        coursesIds.forEach((course, index) => {
            const courseIndex = coursesIds.indexOf(course)
            if(courseIndex !== -1 && index !== courseIndex) {
                return res.status(400).send({
                    name: "repeatedTag",
                    status: 400,
                    success: false
                })
            }
        })
        
        let dateEnd = new Date(dateStart)
        dateEnd.setDate(dateEnd.getDate() + duration - 1)
        
        if(!paid) {
            paymentPrice = 0
        }
        
        const event = await EventCollection.create({
            authorId: req.loggedUserId,
            name,
            category,
            tags,
            description,
            hourStart,
            hourEnd,
            dateStart,
            dateEnd,
            durationDays: duration,
            paid,
            paymentPrice,
            classroom,
            coursesIds,
            picture: {
                gallery,
                thumbnail,
                poster: {
                    url: poster,
                    orientation
                }
            }
        })
        
        event.qr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http://${config.appUrl}/evento/${event._id}`
        event.authorId = undefined
        const user = User.findOne({ _id: req.loggedUserId }).select("username").lean()
        event.author = {
            _id: req.loggedUserId,
            username: user.username
        }
        
        return res.send({
            name: "addedEvent",
            content: { event },
            status: 200,
            success: true
        })
    } catch (err) {
        return res.status(messages.db.error).send(messages.db.error)
    }
}

async function get(req, res) {
    const page = parseInt(req.query.page)
    try {
        if(!page) {
            let events, users
            if(req.loggedUserProfile === "proponent") {
                events = await EventCollection.find({ authorId: req.loggedUserId })
                .select("name")
                .sort({ dateStart: 1, hourStart: 1 })
                .lean()
            } else {
                events = await EventCollection.find()
                .select("name authorId")
                .sort({ dateStart: 1, hourStart: 1 })
                .lean()
                
                users = await User.find({ profileId: { $ne: 1 } }).select("username").lean()
            }
            
            events.forEach(event => {
                event.qr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http://${config.appUrl}/evento/${event._id}`
                
                if(req.loggedUserProfile === "admin") {
                    event.author = controllers.users.util.getUsernameById(event.authorId, users)
                    event.authorId = undefined
                }
            })
            res.send(messages.success("getEvents", { events }))
        } else {
            res.send(await EventCollection.find()
            .select(util.data.defaultSelection)
            .sort({ dateStart: 1, hourStart: 1 }).skip(utils.resolvePage(page, 5)).limit(5))
        }
        return
    } catch (err) {
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function getById(req, res) {
    const { event } = req
    try {
        // gets related events (with same tags or courses)
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
        .sort({ picture: 1 })
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
        
        return res.send(messages.success("getEventById", {
            event: event,
            related
        }))
    } catch (err) {
        return res.status(messages.db.error.status).send(messages.db.error)
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
    const occasion = req.params.occasion
    
    try {
        let events = null
        if(occasion === "previous") {
            events = await EventCollection.find({
                dateStart: {
                    $lt: moment(new Date).toDate()
                }
            })
            .select(util.data.defaultSelection)
            .sort({ dateStart: -1, hourStart: -1 }).lean()
        } else if(occasion === "next") {
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
                    en: "Select one of the following occasions as query parameter: 'today', 'previous', 'next'."
                },
                content: {
                    events: []
                },
                status: 400,
                success: false
            })
        }
        if(!events.length) {
            return res.status(messages.success().status).send(messages.success(`getByOccasion(${occasion})`, { events }))
        }
        await util.resolveEventInfo(events)
        return res.status(messages.success().status).send(messages.success("getEventsByOccasion", { events }))
    } catch(err) {
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function edit(req, res) {
    let {
        name,
        category,
        tags,
        description,
        hourStart,
        hourEnd,
        dateStart,
        duration,
        paid,
        paymentPrice,
        classroom,
        coursesIds,
        thumbnail,
        poster,
        orientation,
        gallery
    } = req.body
    
    try {
        if(req.loggedUserProfile === "proponent" && req.event.authorId !== req.loggedUserId) {
            return res.status(401).send({
                name: "insufficientPermissions",
                status: 401,
                success: false
            })
        }
        
        tags.forEach((tag, index) => {
            const tagIndex = tags.indexOf(tag)
            if(tagIndex !== -1 && index !== tagIndex) {
                return res.status(400).send({
                    name: "repeatedCourse",
                    status: 400,
                    success: false
                })
            }
        })
        
        coursesIds.forEach((course, index) => {
            const courseIndex = coursesIds.indexOf(course)
            if(courseIndex !== -1 && index !== courseIndex) {
                return res.status(400).send({
                    name: "repeatedTag",
                    status: 400,
                    success: false
                })
            }
        })
        
        let dateEnd = new Date(dateStart)
        dateEnd.setDate(dateEnd.getDate() + duration - 1)
        
        if(!paid) {
            paymentPrice = 0
        }
        
        const event = await EventCollection.findByIdAndUpdate(req.event._id, {
            name,
            category,
            tags,
            description,
            hourStart,
            hourEnd,
            dateStart,
            dateEnd,
            durationDays: duration,
            paid,
            paymentPrice,
            classroom,
            coursesIds,
            picture: {
                gallery,
                thumbnail,
                poster: {
                    url: poster,
                    orientation
                }
            }
        })
        return res.send({
            name: "editedEvent",
            content: { event },
            status: 200,
            success: true
        })
    } catch (err) {
        return res.status(messages.db.error).send(messages.db.error)
    }
}

async function remove(req, res) {
    try {
        if(req.loggedUserProfile === "proponent" && req.event.authorId !== req.loggedUserId) {
            return res.status(401).send({
                name: "insufficientPermissions",
                status: 401,
                success: false
            })
        }
        await EventCollection.findByIdAndDelete(req.event._id)
        return res.send({
            name: "removedEvent",
            status: 200,
            success: true
        })
    } catch (err) {
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function getByAuthorId(req, res) {
    const authorId = req.params.id
    
    try {
        const events = await EventCollection.find({ authorId })
        .select(util.data.defaultSelection)
        .sort({ dateStart: 1, hourStart: 1 }).lean()
        
        if(!events.length) {
            return res.status(messages.event.notFound.status).send(messages.event.notFound)
        }

        await util.resolveEventInfo(events)
        
        return res.status(messages.success().status).send(messages.success("getEventsByAuthorId", { events }))
    } catch (err) {
        return res.status(messages.db.error.status).send(messages.db.error)
    }
   
}

async function addEnrollment(req, res) {
    const userId = req.loggedUserId
    try {
        const event = await EventCollection.findOne({ _id: req.event._id })
        if(req.loggedUserProfile === "admin") {
            return res.status(401).send({
                name: "cannotEnroll",
                message: {
                    en: "Cannot enroll to event as admin.",
                },
                status: 401,
                success: false
            })
        }
        
        const alreadyEnrolled = event.enrollments.find(enrollment => enrollment.userId.equals(userId))
        if(alreadyEnrolled) {
            return res.status(400).send({
                name: "alreadyEnrolled",
                message: {
                    en: "User already enrolled to event."
                },
                status: 400,
                success: false
            })
        }
        
        event.enrollments.push({
            userId,
            paid: false
        })
        await event.save()
        
        const messagePt = event.paid ?
            `Dirija-se junto ao proponente de evento para efetuar o pagamento da inscrição (${event.paymentPrice} €).` :
            `A sua inscrição no evento ${event.name} efetuada com sucesso.`
        return res.send({
            name: "userEnrolled",
            message: {
                pt: messagePt,
            },
            content: {
                enrollment: event.enrollments[event.enrollments.length - 1]
            },
            status: 200,
            success: true
        })
    } catch(err) {
        console.log(err)
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function removeEnrollment(req, res) {
    const userId =  req.loggedUserId
    try {
        const event = await EventCollection.findOne({ _id: req.event._id })
        
        const enrolledEvent = event.enrollments.findIndex(enrollment => enrollment.userId.equals(userId))
        if(enrolledEvent === -1) {
            return res.status(400).send({
                name: "notEnrolled",
                message: {
                    en: "User is not enrolled.",
                },
                status: 400,
                success: false
            })
        }
        event.enrollments.splice(enrolledEvent, 1)
        await event.save()
        return res.send({
            name: "removedEnrollment",
            status: 200,
            success: true
        })
    } catch(err) {
        console.log(err)
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function removeEnrollmentByUserId(req, res) {
    const { userId } = req.params
    try {
        if(
            (req.loggedUserProfile === "proponent" &&
            !req.event.authorId.equals(req.loggedUserId))
        ) {
            return res.status(401).send({
                name: "insufficientPermissions",
                status: 401,
                success: false
            })
        }
        
        // verifies user
        const user = await User.findOne({ _id: userId })
        if(!user) {
            return res.status(400).send({
                name: "userNotFound",
                status: 404,
                success: false
            })
        }     
        
        const event = await EventCollection.findOne({ _id: req.event._id })
        
        const enrolledEvent = event.enrollments.findIndex(enrollment => enrollment.userId.equals(userId))
        if(enrolledEvent === -1) {
            return res.status(400).send({
                name: "userNotFound",
                message: {
                    en: "User is not enrolled.",
                },
                status: 400,
                success: false
            })
        }
        event.enrollments.splice(enrolledEvent, 1)
        await event.save()
        return res.send({
            name: "enrollmentRemoved",
            status: 200,
            success: true
        })
    } catch(err) {
        return res.status(400).send({ error: "Could not remove enrollment: " + err })
    }
}

async function changePayment(req, res) {
    const { userId } = req.params
    try {
        if(
            (req.loggedUserProfile === "proponent" &&
            !req.event.authorId.equals(req.loggedUserId))
        ) {
            return res.status(401).send({
                name: "insufficientPermissions",
                status: 401,
                success: false
            })
        }
        const event = await EventCollection.findOne({ _id: req.event._id })
        
        if(!event.paid) {
            return res.status(400).send({
                name: "cannotChangePayment",
                message: {
                    en: "This event is not paid."
                },
                status: 400,
                success: false
            })
        }
        
        const enrollment = event.enrollments.find(e => e.userId.equals(userId))
        
        if(!enrollment) {
            return res.status(400).send({
                name: "userNotEnrolled",
                message: {
                    en:"User is not enrolled on this event."
                },
                status: 400,
                success: false
            })
        }
        
        enrollment.paid = !enrollment.paid
        
        await event.save()
        res.status(messages.success().status).send(messages.success("paymentChanged", { enrollment }))
    } catch(err) {
        console.log(err)
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function getDiscussionById(req, res) {
    const { event, discussion } = req

    try {
        const users = await User.find().select("username picture profileId").lean()
        // resolves author info
        discussion.author = controllers.users.util.getUsernameById(discussion.authorId, users)
        discussion.authorId = undefined
        
        // resolves answers authors info
        discussion.answers.forEach(answer => {
            answer.author = controllers.users.util.getUsernameById(answer.authorId, users)
            answer.authorId = undefined
        })

        return res.send({
            name: "getEventDiscussion",
            content: {
                event: {
                    _id: event._id,
                    category: event.category,
                    name: event.name,
                    author: {
                        _id: event.authorId,
                        username: users.find(user => user._id.equals(event.authorId)).username
                    }
                },
                discussion
            },
            status: 200,
            success: true
        })
    } catch(err) {
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function addDiscussion(req, res) {
    const { category, title, content } = req.body
    try {
        const event = await EventCollection.findOne({ _id: req.event._id })
        
        if(category !== "Dúvida" && category !== "Sugestão") {
            return res.status(400).send({
                name: "wrongParameter",
                error: "Parameter 'category' must be one of the following: ['Dúvida', 'Sugestão']",
                status: 400,
                success: false
            })
        }
        
        event.discussions.push({
            authorId: req.loggedUserId,
            category,
            title,
            content,
            upvotes: 0,
            downvotes: 0
        })
        await event.save()
        return res.send(messages.success("addedDiscussion", { discussion: event.discussions[event.discussions.length - 1] }))
    } catch(err) {
        console.log(err)
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function editDiscussion(req, res) {
    const { title, category, content } = req.body
    try {
        if(
            (req.loggedUserProfile === "student" &&
            !req.discussion.authorId.equals(req.loggedUserId)) ||
            (req.loggedUserProfile === "proponent" &&
            !req.event.authorId.equals(req.loggedUserId))
        ) {
            return res.status(401).send({
                name: "insufficientPermissions",
                status: 401,
                success: false
            })
        }
        
        if(category !== "Dúvida" && category !== "Sugestão") {
            return res.status(400).send({
                name: "wrongParameter",
                error: "Parameter 'category' must be one of the following: ['Dúvida', 'Sugestão']",
                status: 400,
                success: false
            })
        }
        
        const event = await EventCollection.findOne({ _id: req.event._id })
        let discussion
        event.discussions.forEach(eventDiscussion => {
            if(eventDiscussion._id.equals(req.discussion._id)) {
                eventDiscussion.title = title
                eventDiscussion.category = category
                eventDiscussion.content = content
            }
            discussion = eventDiscussion
        })
        await event.save()
        return res.send({
            name: "editedDiscussion",
            content: { discussion },
            status: 200,
            success: true
        })
    } catch(err) {
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function removeDiscussionById(req, res) {
    try {
        if(
            (req.loggedUserProfile === "student" &&
            !req.discussion.authorId.equals(req.loggedUserId)) ||
            (req.loggedUserProfile === "proponent" &&
            !req.event.authorId.equals(req.loggedUserId))
        ) {
            return res.status(401).send({
                name: "insufficientPermissions",
                status: 401,
                success: false
            })
        }
        
        const event = await EventCollection.findOne({ _id: req.event._id })
        event.discussions.forEach((discussion, index) => {
            if(discussion._id.equals(req.discussion._id)) {
                event.discussions.splice(index, 1)
            }
        })
        await event.save()
        return res.send({
            name: "removedDiscussion",
            status: 200,
            success: true
        })
    } catch(err) {
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function voteDiscussion(req, res) {
    const { type } = req.body
    try {
        if(type !== "upvote" && type !== "downvote") {
            return res.status(400).send({
                name: "wrongParameter",
                error: "Parameter 'type' must be one of the following: ['upvote', 'downvote']",
                status: 400,
                success: false
            })
        }
        
        const event = await EventCollection.findOne({ _id: req.event._id })
        let eventDiscussion
        event.discussions.forEach(discussion => {
            if(discussion._id.equals(req.discussion._id)) {
                eventDiscussion = discussion
                const index = discussion.usersVoted.indexOf(req.loggedUserId)
                if(index !== -1) {
                    return res.status(400).send({
                        name: "userAlreadyVoted",
                        message: {
                            pt: "Já votou nesta discussão."  
                        },
                        status: 400,
                        success: false
                    })
                }
                if(type === "upvote") {
                    discussion.upvotes++   
                } else {
                    discussion.downvotes++
                }
                discussion.usersVoted.push(req.loggedUserId)
            }
        })
        await event.save()
        return res.send(messages.success("userVoted", {
            discussion: {
                upvotes: eventDiscussion.upvotes,
                downvotes: eventDiscussion.downvotes,
                usersVoted: eventDiscussion.usersVoted
            }
        }))
    } catch(err) {
        console.log(err)
        return res.status(messages.db.error.status).send(messages.db.error)
    }
    
}

async function addDiscussionAnswer(req, res) {
    try {
        const event = await EventCollection.findOne({ _id: req.event._id })
        let answer
        event.discussions.forEach(discussion => {
            if(discussion._id.equals(req.discussion._id)) {
                discussion.answers.push({
                    content: req.body.content,
                    authorId: req.loggedUserId
                })
                answer = discussion.answers[discussion.answers.length - 1]
            }
        })
        await event.save()
        const { _id, content, createdAt } = answer
        const user = await User.findOne({ _id: req.loggedUserId })
        return res.send({
            name: "addedAnswer",
            content: {
                answer: {
                    _id,
                    content,
                    createdAt,
                    author: {
                        _id: req.loggedUserId,
                        profileId: user.profileId,
                        username: user.username,
                        picture: user.picture
                    }
                }
            },
            status: 200,
            success: true
        })
    } catch(err) {
        console.log(err)
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function removeDiscussionAnswer(req, res) {
    try {
        if(
            (req.loggedUserProfile === "student" &&
            !req.answer.authorId.equals(req.loggedUserId)) ||
            (req.loggedUserProfile === "proponent" &&
            !req.event.authorId.equals(req.loggedUserId)) &&
            !req.answer.authorId.equals(req.loggedUserId)
        ) {
            return res.status(401).send({
                name: "insufficientPermissions",
                status: 401,
                success: false
            })
        }
        const event = await EventCollection.findOne({ _id: req.event._id })
        const discussion = event.discussions.find(discussion => discussion._id.equals(req.discussion._id))
        const answerIndex = discussion.answers.findIndex(answer => answer._id.equals(req.answer._id))
        discussion.answers.splice(answerIndex, 1)
        event.save()
        
        return res.send({
            name: "removedAnswer",
            content: {
                answerId: req.answer._id  
            },
            status: 200,
            success: true
        })
    } catch(err) {
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function getSuggested(req, res) {
    const { userId } = req.params
    try {
        const user = await User.findOne({ _id: userId }).lean()
        if(!user) {
            return res.status(messages.user.notFound.status).send(messages.user.notFound)
        }
        
        const suggestedEvents = await EventCollection.find({
            dateStart: {
                $gte: new Date()
            }
        }).and([
            {
                $or: [
                    {
                        tags: {
                            $in: user.interests.tags
                        },
                    },
                    {
                        coursesIds: {
                            $in: user.interests.courses
                        }
                    },
                    {
                        authorId: {
                            $in: user.interests.proponents
                        }
                    }
                ]
            }
        ])
        .select("_id picture.thumbnail tags authorId name category classroom hourStart hourEnd dateStart dateEnd enrollments description classroom")
        .sort({ dateStart: 1, hourStart: 1 })
        .lean()
        
        // resolves info (tags, courses, author username)
        const users = await User.find().select("username picture").lean()
        const tags = await Tag.find().select("-__v").lean()
        const courses = await Course.find().select("-__v").lean()
        
        // resolves related events info
        suggestedEvents.forEach(suggested => {
            suggested.author = controllers.users.util.getUsernameById(suggested.authorId, users)
            suggested.author.picture = undefined
            suggested.authorId = undefined
            
            suggested.tags = controllers.tags.util.getByIdsArray(suggested.tags, tags)
        })
        return res.send({
            name: "getSuggestedEvents",
            content: {
                events: suggestedEvents
            },
            status: 200,
            success: true
        })
    } catch(err) {
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function getTopEvents(req, res) {
    try {
        const events = await EventCollection.find().select(util.data.defaultSelection).sort({ dateStart: -1, hourStart: -1 }).lean()
        // resolves info (tags, courses, author username)
        const users = await User.find().select("username picture").lean()
        const tags = await Tag.find().select("-__v").lean()
        const courses = await Course.find().select("-__v").lean()
        
        events.forEach(event => {
            event.author = controllers.users.util.getUsernameById(event.authorId, users)
            event.author.picture = undefined
            event.authorId = undefined
            
            event.tags = controllers.tags.util.getByIdsArray(event.tags, tags)
            
            //event.enrollments = event.enrollments.length
        })
        
        events.sort((a, b) => {
            if(a.enrollments.length < b.enrollments.length) return 1
            if(a.enrollments.length > b.enrollments.length) return -1
            return 0
        })
        
        events.length = events.length > 4 ? 4 : events.length
        
        return res.send({
            name: "getTopEvents",
            content: { events },
            status: 200,
            success: true
        })
    } catch(err) {
        return res.status(messages.db.error.status).send(messages.db.error)
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
    },
    middlewares: {
        async verifyEventIntegrity(req, res, next) {
            try {
                const event = await EventCollection.findOne({ _id: req.params.id })
                .select("-__v")
                .sort({ dateStart: 1, hourStart: 1 })
                .lean()
                if(!event) {
                    return res.status(messages.event.notFound.status).send(messages.event.notFound)
                }
                req.event = event
                return next()
            } catch (err) {
                return res.status(messages.db.error.status).send(messages.db.error)
            }
        },
        async verifyDiscussionIntegrity(req, res, next) {
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
        },
        async verifyAnswerIntegrity(req, res, next) {
            try {
                const discussion = req.discussion
                const answer = discussion.answers.find(answer => answer._id.equals(req.params.answerId))
                if(!answer) {
                    return res.status(messages.event.answer.notFound.status).send(messages.event.answer.notFound)
                }
                req.answer = answer
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
    addEnrollment,
    removeEnrollment,
    removeEnrollmentByUserId,
    changePayment,
    getDiscussionById,
    addDiscussion,
    editDiscussion,
    removeDiscussionById,
    voteDiscussion,
    addDiscussionAnswer,
    removeDiscussionAnswer,
    getSuggested,
    getTopEvents
}