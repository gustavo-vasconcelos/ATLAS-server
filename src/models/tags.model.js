const mongoose = require("../database/connection")

const TagSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    }
})

const Tag = mongoose.model("Tag", TagSchema)

module.exports = Tag