const firebase = require("../database/firebase")
const participants = firebase.database().ref("participants/")
const messages = firebase.database().ref("messages/")

async function addParticipant(data) {
    try {
        await participants.push({
            socketId: data.socketId,
            id: data.id
        })
    } catch (err) {
        console.log(err)
    }
}
/*
async function addMessage(data) {
    try {
        await messages.push({
            socketId: data.socketId,
            id: data.id
        })
    } catch (err) {
        console.log(err)
    }
}
*/

module.exports = (http) => {
    const io = require("socket.io")(http)
    io.on("connection", function (socket) {
        console.log("A user connected: " + socket.id)

        socket.on("CONNECTION", data => {
            data.socketId = socket.id
            addParticipant(data)
        })

        
        socket.on("CHAT_MESSAGE", data => {
            io.emit("CHAT_MESSAGE", data)
        })
    })
}


