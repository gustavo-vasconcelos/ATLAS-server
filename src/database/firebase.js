const firebase = require("firebase")
const config = require("../config")

const connection = {
    apiKey: config.database.firebase.apiKey,
    authDomain: `${config.database.firebase.projectId}.firebaseapp.com`,
    databaseURL: `https://${config.database.firebase.projectId}.firebaseio.com`,
    storageBucket: `${config.database.firebase.projectId}.appspot.com`,
}

firebase.initializeApp(connection)

module.exports = firebase