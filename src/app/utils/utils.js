module.exports = {
    resolvePage(page, limit) {
        return limit * (page - 1)
    }
}