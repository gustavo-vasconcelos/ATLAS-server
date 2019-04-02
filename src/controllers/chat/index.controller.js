const axios = require("axios")

module.exports = (http) => {
    const io = require("socket.io")(http)
    io.on("connection", function (socket) {
        console.log("A user connected: " + socket.id)

        socket.on("CONNECTION", data => {
        })


        socket.on("CHAT_MESSAGE", message => {
            //const { author, type, data } = message
            
            (async () => {
                try {
                    await axios.post("/chat",
                        {
                            author: message.author,
                            type: message.type,
                            data: message.data
                        },
                        {
                            proxy: {
                                host: "localhost",
                                port: 3000
                            }
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