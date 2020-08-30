const moment = require('moment-timezone')
const db = require('../models')
const Users = db.users;
const saltedMd5 = require('salted-md5');
const randomstring = require("randomstring");
const TokenSign = require('../middleware/tokensign');

exports.postSignup = async function (req, res, next) {
    let randomString = randomstring.generate({ length: 8 });
    let saltedHashPassword = saltedMd5(randomString, req.body.password);
    
    const user = new Users({
		name: req.body.name,
		username: req.body.username,
		email: req.body.email.toLowerCase(),
		password: saltedHashPassword,
        role: 'user',
		status: 'active',
		bio: req.body.bio || '',
        occupation: req.body.occupation || '',
        isVerified: false,
        profilePic: '',
        country: req.body.country,
        points: 0,
        salt: randomString
    });
    
    let token = TokenSign(user.id, user.username, user.role);

    user.save(user)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'User successfully created',
            data: { token: token, data: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
    
}