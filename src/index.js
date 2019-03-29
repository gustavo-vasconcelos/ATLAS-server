const express = require("express")
const bodyParser = require("body-parser")

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// imports all controllers
require("./routes/index")(app)

app.listen(3000)

console.log("Listening")