const mongoose = require("../../database/connection")
const ObjectId = mongoose.Schema.Types.ObjectId
const bcrypt = require("bcrypt")

const MedalSchema = new mongoose.Schema({
    details: {
        title: {
            type: String,
            required: true
        },
        details: {
            type: String,
            required: true
        },
        picture: {
            type: String,
            required: true
        }
    },
    constrains: {
        type: {
            type: String,
            required: true
        },
        constrain: {
            type: Number,
            required: true
        }
    }
})

const Medal = mongoose.model("Medal", MedalSchema)

module.exports = Medal