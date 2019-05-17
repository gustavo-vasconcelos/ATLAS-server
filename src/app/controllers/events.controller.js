const EventCollection = require("../models/events.model")
const moment = require("moment")

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
    try {
        return res.send(await EventCollection.find())
    } catch (err) {
        return res.status(400).send({ error: "Could not get events. " + err })
    }
}

async function getById(req, res) {
    const _id = req.params.id
    const error = "Could not get event. "
    try {
        const response = await EventCollection.findOne({ _id })
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
    try {
        const response = await EventCollection.find({
            dateStart: {
                $gte: date,
                $lte: moment(date).endOf('day').toDate()
            }
        })
        if (response.length) {
            return res.send(response)
        } else {
            return res.status(404).send({ error: error + `There are not events.`})
        }
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

async function getCreatedByAuthorId(req, res) {
    const authorId = req.params.id
    
    try {
        return res.send(await EventCollection.find({ authorId }))
    } catch (err) {
        return res.status(400).send({ error: `Could not get events created by '${authorId}': ${err}` })
    }
   
}

async function getEnrollmentsByAuthorId(req, res) {
    const userId = req.params.id

    try {
        return res.send(await EventCollection.find({
            "enrollments.userId": userId 
        }))
    } catch (err) {
        return res.status(400).send({ error: `Could not get enrolled events of user '${userId}': ${err}` })
    }
}

module.exports = { add, get, getById, getByDate, edit, remove, getCreatedByAuthorId, getEnrollmentsByAuthorId }