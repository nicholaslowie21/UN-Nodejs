const jwt = require('jsonwebtoken');
const env = require('../config/env');

module.exports = function(id, role, type) {
    console.log('Token sign id, role, type: ', id, role, type);
    
    return jwt.sign({ id: id, role: role, type: type }, env.jwtSecret);
}