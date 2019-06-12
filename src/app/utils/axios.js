const axios = require("axios")
const config = require("../../config")

module.exports = axios.create({
    baseUrl: config.apiUrl
})