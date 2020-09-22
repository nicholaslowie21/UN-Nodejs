module.exports = function (req, res, next) {
    req.thePath = []
    next()
};