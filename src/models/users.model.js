const mongoose = require("../database/connection")

const UserSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    profileId: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        lowercase: true
    },
    password: {
        type: String,
        select: false
    },
    email: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    gender: {
        type: Number,
        required: true
    },
    accountCreation: {
        date: {
            type: String,
            required: true
        },
        hour: {
            type: Number,
            required: true
        }
    },
    interests: {
        tags: [
            {
                type: Number,
                required: true
            }
        ],
        courses: [
            {
                type: Number,
                required: true
            }
        ],
        proponents: [
            {
                type: Number,
                required: true
            }
        ]
    },
    notifications: [
        {
            id: {
                type: Number,
                required: true
            },
            eventId: {
                type: Number,
                required: true
            },
            matching: {
                tags: [
                    {
                        type: Number,
                        required: true
                    }
                ],
                courses: [
                    {
                        type: Number,
                        required: true
                    }
                ],
                proponents: [
                    {
                        type: Number,
                        required: true
                    }
                ]
            },
            moment: {
                type: String,
                required: true
            }
        }
    ]
})

const User = mongoose.model("User", UserSchema)

module.exports = User