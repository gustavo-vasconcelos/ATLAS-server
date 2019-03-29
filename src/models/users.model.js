const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    id: Number,
    profileId: Number,
    name: String,
    username: {
        type: String,
        lowercase: true
    },
    password: {
        type: String,
        select: false
    },
    email: String,
    picture: String,
    gender: Number,
    accountCreation: {
        date: String,
        hour: String
    },
    interests: {
        tags: [Number],
        courses: [Number],
        proponents: [Number]
    },
    notifications: [
        {
            id: Number,
            eventId: Number,
            matching: {
                tags: [Number],
                courses: [Number],
                proponents: [Number]
            },
            moment: String
        }
    ]
})