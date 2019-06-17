const Course = require("../models/courses.model")
const messages = require("../jsonmessages/messages")

async function add(req, res) {
    try {
        const course = await Course.create(req.body)
        return res.send({
            name: "addedCourse",
            content: { course },
            status: 200,
            success: true
        })
    } catch (err) {
        return res.status(400).send({ error: "Could not add course. " + err })
    }
}

async function get(req, res) {
    try {
        const courses = await Course.find().sort({ name: 1 }).lean()
        return res.status(messages.success().status).send(messages.success("getCourses", { courses }))
    } catch (err) {
        return res.status(messages.db.error.status).send(messages.db.error)
    }
}

async function getById(req, res) {
    const _id = req.params.id
    const error = "Could not get course. "
    try {
        const response = await Course.findOne({ _id })
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
    const error = "Could not edit course. "
    try {
        if (await Course.findOne({ _id })) {
            await Course.findByIdAndUpdate(_id, req.body)
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
    const error = "Could not remove course. "
    try {
        if (await Course.findOne({ _id })) {
            await Course.findByIdAndDelete(_id)
            return res.send()
        } else {
            return res.status(404).send({ error: error + `Cannot find id '${_id}'`})
        }
    } catch (err) {
        return res.status(400).send({ error: error + err })
    }
}

const util = {
    getByIdsArray(ids, tags) {
        let coursesInfo = []
        ids.forEach(id => {
            tags.forEach(tag => {
                if(tag._id.equals(id)) {
                    coursesInfo.push(tag)
                }
            })
        })
        return coursesInfo
    }
}

module.exports = { add, get, getById, edit, remove, util }