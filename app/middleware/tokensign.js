const jwt = require('jsonwebtoken');
const env = require('../config/env');

module.exports = function(id, username, roles) {
    console.log('Token sign id, username, roles: ', id, username, roles);
    
    return jwt.sign({ id: id, username: username, roles: roles }, env.jwtSecret);
}