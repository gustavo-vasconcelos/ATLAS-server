const mongoose = required("mongoose")

const TagSchema = new mongoose.Schema({
    id: Number,
    name: String
})