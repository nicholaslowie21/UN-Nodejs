const jwt = require('jsonwebtoken');
const env = require('../config/env');

module.exports = function(id, username, role, type) {
    console.log('Token sign id, username, roles: ', id, username, role, type);
    
    return jwt.sign({ id: id, username: username, role: role, type: type }, env.jwtSecret);
}