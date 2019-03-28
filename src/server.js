const express = require("express")
const app = express()


require("./controllers/events.controller")(app)

app.listen(3000)