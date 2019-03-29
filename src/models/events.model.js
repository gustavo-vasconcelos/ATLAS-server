const mongoose = required("mongoose")

const EventSchema = new mongoose.Schema({
    id: Number,
    authorId: Number,
    name: String,
    category: String,
    tags: [Number],
    description: String,
    classroom: String,
    coursesIds: Array,
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