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
    tags: [
        {
            type: Number,
            required: true
        }
    ],
    description: {
        type: String,
        required: true
    },
    classroom: {
        type: String,
        required: true
    },
    coursesIds: [
        {
            type: Number,
            required: true
        }
    ],
    hourStart: {
        type: Number,
        required: true
    },
    hourEnd: {
        type: Number,
        required: true
    },
    dateStart: {
        type: Date,
        required: true
    },
    durationDays: {
        type: Number,
        required: true
    },
    dateEnd: {
        type: Date,
        required: true
    },
    picture: {
        thumbnail: {
            type: String,
            required: true
        },
        poster: {
            url: {
                type: String,
                required: true
            },
            orientation: {
                type: String,
                required: true
            }
        },
        gallery: [
            {
                type: String,
                required: true
            }
        ]
    },
    paid: {
        type: Boolean,
        required: true
    },
    paymentPrice: {
        type: Number,
        required: true
    },
    discussions: [
        {
            id: {
                type: Number,
                required: true
            },
            authorId: {
                type: Number,
                required: true
            },
            category: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            content: {
                type: String,
                required: true
            },
            upvotes: {
                type: Number,
                required: true
            },
            downvotes: {
                type: Number,
                required: true
            },
            usersVoted: [
                {
                    type: Number,
                    required: true
                }
            ],
            answers: [
                {
                    id: {
                        type: Number,
                        required: true
                    },
                    authorId: {
                        type: Number,
                        required: true
                    },
                    content: {
                        type: String,
                        required: true
                    },
                    moment: {
                        type: String,
                        required: true
                    }
                }
            ],
            moment: {
                type: String,
                required: true
            }
        }
    ],
    enrollments: [
        {
            userId: {
                type: Number,
                required: true
            },
            paid: {
                type: Boolean,
                required: true
            },
            moment: {
                type: String,
                required: true
            }
        }
    ]
})

const Event = mongoose.model("Event", EventSchema)

module.exports = Event