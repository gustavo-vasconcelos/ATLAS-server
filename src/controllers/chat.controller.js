module.exports = (http) => {
    const io = require("socket.io")(http)
    io.on("connection", function (socket) {
        console.log("A user connected: " + socket.id)
        socket.on("CHAT_MESSAGE", data => {
            io.emit("CHAT_MESSAGE", data)
        })
    })
}


