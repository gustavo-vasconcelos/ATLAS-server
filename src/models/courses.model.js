const mongoose = require("mongoose")

const CourseSchema = new mongoose.Schema({
    id: Number,
    name: String,
    abbreviation: String
})