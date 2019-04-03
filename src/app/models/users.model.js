const mongoose = require("../../database/connection")
const ObjectId = mongoose.Schema.Types.ObjectId
const bcrypt = require("bcrypt")

const UserSchema = new mongoose.Schema({
    profileId: {
        type: Number,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        select: false,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    picture: {
        type: String,
        required: true
    },
    gender: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    interests: {
        tags: [
            {
                type: ObjectId,
                required: true
            }
        ],
        courses: [
            {
                type: ObjectId,
                required: true
            }
        ],
        proponents: [
            {
                type: ObjectId,
                required: true
            }
        ]
    },
    notifications: [
        {
            eventId: {
                type: ObjectId,
                required: true
            },
            matching: {
                tags: [
                    {
                        type: ObjectId,
                        required: true
                    }
                ],
                courses: [
                    {
                        type: ObjectId,
                        required: true
                    }
                ],
                proponents: [
                    {
                        type: ObjectId,
                        required: true
                    }
                ]
            },
            createdAt: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    passwordReset: {
        token: {
            type: String,
            select: false
        },
        expires: {
            type: Date,
            select: false
        }
    }
})

UserSchema.pre("save", async function (next) {
    const salt = 10
    const hash = await bcrypt.hash(this.password, salt)
    this.password = hash

    next()
})

const User = mongoose.model("User", UserSchema)

module.exports = User