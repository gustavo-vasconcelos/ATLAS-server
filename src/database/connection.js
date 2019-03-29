const mongoose = require("mongoose")
const config = require("../config")

const uri = `mongodb+srv://atlas_db:${config.database.password}@atlas-tqd0c.mongodb.net/test?retryWrites=true`

mongoose.connect(uri, { useMongoClient: true })
mongoose.Promise = global.Promise

module.exports = mongoose