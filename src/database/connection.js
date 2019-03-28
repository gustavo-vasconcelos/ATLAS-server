const MongoClient = require("mongodb").MongoClient
const uri = `mongodb+srv://atlas_db:${databasePassword}@atlas-tqd0c.mongodb.net/test?retryWrites=true`
const client = new MongoClient(uri, { useNewUrlParser: true })
client.connect(err => {
  const collection = client.db("app").collection("devices")
  // perform actions on the collection object
  client.close()
})