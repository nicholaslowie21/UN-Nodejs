const jwt = require('jsonwebtoken');
const env = require('../config/env');


module.exports = function (req, res, next) {
    try {
        if(!req.headers['authorization']) throw new Error("JWT Token missing!")
        
        let token = req.headers['authorization'].split(' ')[1];
        var decoded = jwt.verify(token, env.jwtSecret);
        if (decoded) {
            req.body.id = decoded.id
            req.id = decoded.id
            req.body.role = decoded.role || ''
            req.role = decoded.role || ''
            req.body.type = decoded.type
            req.type = decoded.type
            next();
        }
        
    } catch (err) {
        console.log(err.message);
        return res.status(504).json({ status: 'error', msg: 'Unauthorized access' });
    }
};