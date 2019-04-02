const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const http = require("http").Server(app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// imports all controllers
require("./routes/index")(app)

require("./controllers/chat/index.controller")(http)

http.listen(3000, () => {
    console.log("Listening")
})
