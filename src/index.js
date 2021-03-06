const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const http = require("http").Server(app)
const cors = require("cors")

const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(cors())


/*
const permittedLinker = ["http://localhost:8080", "https://atlas-gustavovasconcelos.c9users.io/"]

app.use(function (req, res, next) {
    let i = 0, notFound = 1, referer = req.get("Referer")
    console.log(referer)
    if(referer) {
        while(i < permittedLinker.length && notFound) {
            notFound = referer.indexOf(permittedLinker[i]) === -1
            i++
        }
    }
    
    if(notFound) {
        res.sendStatus(404)
    } else {
        next()
    }
})
*/

// imports all controllers

require("./app/routes/index")(app)

require("./app/controllers/chat/index.controller")(http)

http.listen(port, () => {
    console.log("Listening")
})