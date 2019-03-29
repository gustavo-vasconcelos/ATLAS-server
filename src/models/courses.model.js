const mongoose = require("../database/connection")

const CourseSchema = new mongoose.Schema({
    id: Number,
    name: String,
    abbreviation: String
})

const Course = mongoose.model("Course", CourseSchema)

module.exports = Course