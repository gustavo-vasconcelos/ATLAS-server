const mongoose = require("../database/connection")

const ChatSchema = new mongoose.Schema({
    author: {
        //type: mongoose.Schema.Types.ObjectId,
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    data: {
        text: {
            type: String
        },
        emoji: {
            type: String
        }
    }
})

const Chat = mongoose.model("Chat", ChatSchema)
module.exports = Chat