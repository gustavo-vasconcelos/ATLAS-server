const mongoose = require("../database/connection")

const TagSchema = new mongoose.Schema({
    id: Number,
    name: String
})

const Tag = mongoose.model("Tag", TagSchema)

module.exports = Tag