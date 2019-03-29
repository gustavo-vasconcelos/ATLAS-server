const mongoose = require("../database/connection")

const CourseSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    abbreviation: {
        type: String,
        required: true
    }
})

const Course = mongoose.model("Course", CourseSchema)

module.exports = Course