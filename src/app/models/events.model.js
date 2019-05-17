const mongoose = require("../../database/connection")
const ObjectId = mongoose.Schema.Types.ObjectId

const EventSchema = new mongoose.Schema({
    authorId: {
        type: ObjectId,
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
            type: ObjectId,
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
            type: ObjectId,
            required: true
        }
    ],
    hourStart: {
        type: String,
        required: true
    },
    hourEnd: {
        type: String,
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
            authorId: {
                type: ObjectId,
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
                    type: ObjectId,
                    required: true
                }
            ],
            answers: [
                {
                    authorId: {
                        type: ObjectId,
                        required: true
                    },
                    content: {
                        type: String,
                        required: true
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now()
                    }
                }
            ],
            createdAt: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    enrollments: [
        {
            userId: {
                type: ObjectId,
                required: true
            },
            paid: {
                type: Boolean,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now()
            }
        }
    ]
})

EventSchema.pre("save", function(next) {
    this.dateStart = Date.parse(this.dateStart)
    this.dateEnd = Date.parse(this.dateEnd)
    next()
})

const Event = mongoose.model("Event", EventSchema)
module.exports = Event