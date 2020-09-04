const moment = require('moment-timezone')
const db = require('../models')
const Users = db.users;
const Institution = db.institution;
const saltedMd5 = require('salted-md5');
const randomstring = require("randomstring");
const TokenSign = require('../middleware/tokensign');
const nodeCountries = require('node-countries');
const { institution } = require('../models');

exports.postTest = async function (req, res, next) {
    return res.status(200).json({
        status: 'success',
        msg: 'Your token is working properly!',
        data: {}
    });
}

exports.postSignup = async function (req, res, next) {
    let randomString = randomstring.generate({ length: 8 });
    let saltedHashPassword = saltedMd5(randomString, req.body.password);
    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;
    
    const user = new Users({
		name: req.body.name,
		username: req.body.username,
		email: req.body.email.toLowerCase(),
		password: saltedHashPassword,
        role: 'user',
		status: 'active',
		bio: '',
        occupation: '',
        isVerified: false,
        profilePic: '',
        country: req.body.country,
        points: 0,
        salt: randomString
    });
    
    let token = TokenSign(user.id, user.username, user.role, 'user');

    user.save(user)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'User successfully created',
            data: { token: token, user: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });   
}

exports.postLogin = async function (req, res, next) {
   let email = req.body.email;
   let username = req.body.username;
   let type = '';

   var user;
   var institution;
   
   //if not email not null/undefined
   if (email) {
        
        user = await Users.findOne({ 'email': email }, function (err, person) {
            if (err) return handleError(err);
        });

        institution = await Institution.findOne({ 'email': email }, function (err, person) {
            if (err) return handleError(err);
        });

        if (!user && !institution)
            return res.status(500).json({
                status: 'error',
                msg: 'Account with such email is not found!',
                data: {}
            });
   } else if (username) {
        user = await Users.findOne({ 'username': username }, function (err, person) {
            if (err) return handleError(err);
        });

        institution = await Institution.findOne({ 'username': username }, function (err, person) {
            if (err) return handleError(err);
        });
        if (!user && !institution)
            return res.status(500).json({
                status: 'error',
                msg: 'Account with such username is not found!',
                data: {}
            });

   }

   if(user) type='user';
   if(institution) type='institution'

   let salt = user.salt;

   let saltedHashPassword = saltedMd5(salt, req.body.password);

   if(saltedHashPassword === user.password) {
    let token = TokenSign(user.id, user.username, user.role, type);
    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully sign in!',
        data: { token: token, user: user }
    });
   } else {
    return res.status(500).json({
        status: 'error',
        msg: 'Password mismatch!',
        data: {}
    });
   }
}