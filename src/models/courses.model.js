const mongoose = require("../database/connection")

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    abbreviation: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    }
})

const Course = mongoose.model("Course", CourseSchema)

module.exports = Course