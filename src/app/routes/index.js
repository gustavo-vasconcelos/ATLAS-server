const fs = require("fs")
const path = require("path")

module.exports = app => {
    fs
        .readdirSync(__dirname) // gets all filenames from /controllers
        .filter(file => file.indexOf(".route") !== -1) // filters filenames to only allow the ones containing ".route"
        .forEach(file => require(path.resolve(__dirname, file))(app)) // makes the require and passes app as a parameter
}	