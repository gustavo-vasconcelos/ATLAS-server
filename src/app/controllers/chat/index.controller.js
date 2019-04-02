const axios = require("axios")

module.exports = (http) => {
    const io = require("socket.io")(http)
    io.on("connection", function (socket) {
        console.log("A user connected: " + socket.id)

        socket.on("CHAT_MESSAGE", message => {
            (async () => {
                try {
                    await axios.post("https://atlas-server-carlosguedespinto.c9users.io/chat",
                        {
                            author: message.author,
                            type: message.type,
                            data: message.data
                        }
                    )
                } catch (err) {
                    console.log(err)
                }
            })()

            io.emit("CHAT_MESSAGE", message)
        })

        socket.on("DISCONNECTION", data => {

        })
    })
}