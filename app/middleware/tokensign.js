const jwt = require('jsonwebtoken');
const env = require('../config/env');

module.exports = function(id, username, role) {
    console.log('Token sign id, username, roles: ', id, username, role);
    
    return jwt.sign({ id: id, username: username, role: role }, env.jwtSecret);
}