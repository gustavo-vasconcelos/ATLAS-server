const fs = require("fs")
const path = require("path")

module.exports = app => {
    /*
    fs
        .readdirSync(__dirname) // gets all filenames from /controllers
        .filter(file => file.indexOf(".controller") !== -1) // filters filenames to only allow the ones containing ".controller"
        .forEach(file => require(path.join(__dirname, file))(app)) // makes the require and passes app as a parameter
    */
   require("./tags.route")(app)
   require("./courses.route")(app)
}	