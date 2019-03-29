const mongoose = require("../database/connection")

const EventSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    authorId: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    tags: [Number],
    description: String,
    classroom: String,
    coursesIds: [Number],
    hourStart: Number,
    hourEnd: Number,
    dateStart: Date,
    durationDays: Number,
    dateEnd: Date,
    picture: {
        thumbnail: String,
        poster: {
            url: String,
            orientation: String
        },
        gallery: [String]
    },
    paid: Boolean,
    paymentPrice: Number,
    discussions: [
        {
            id: Number,
            authorId: Number,
            category: String,
            title: String,
            content: String,
            upvotes: Number,
            downvotes: Number,
            usersVoted: [Number],
            answers: [
                {
                    id: Number,
                    authorId: Number,
                    content: String,
                    moment: String
                }
            ],
            moment: String
        }
    ],
    enrollments: [
        {
            userId: Number,
            paid: Boolean,
            moment: String
        }
    ]
})

const Event = mongoose.model("Event", EventSchema)

module.exports = Event