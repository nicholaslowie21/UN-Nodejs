const moment = require('moment-timezone')
const db = require('../models')
const Users = db.users;
const Institution = db.institution;
const PasswordReset = db.passwordreset;
const saltedMd5 = require('salted-md5');
const randomstring = require("randomstring");
const TokenSign = require('../middleware/tokensign');
const nodeCountries = require('node-countries');
const { v4: uuidv4 } = require('uuid');

const Helper = require('../service/helper.service');

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
    
    let token = TokenSign(user.id, user.role, 'user');

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

exports.postInstitutionSignup = async function (req, res, next) {
    let randomString = randomstring.generate({ length: 8 });
    let saltedHashPassword = saltedMd5(randomString, req.body.password);
    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;
    
    const institution = new Institution({
		name: req.body.name,
		username: req.body.username,
		email: req.body.email.toLowerCase(),
		password: saltedHashPassword,
		status: 'active',
        bio: '',
        phone: '',
        address: '',
        isVerified: false,
        profilePic: '',
        country: req.body.country,
        salt: randomString
    });
    
    let token = TokenSign(institution.id, institution.role, 'institution');

    institution.save(institution)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Account successfully created',
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

   if(institution){ 
       type='institution';
       user=institution;
       user.role = 'institution';
    }
   let salt = user.salt;

   let saltedHashPassword = saltedMd5(salt, req.body.password);

   if(saltedHashPassword === user.password) {
    let token = TokenSign(user.id, user.role, type);
    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully sign in!',
        data: { token: token, user: user, accountType: type }
    });
   } else {
    return res.status(500).json({
        status: 'error',
        msg: 'Password mismatch!',
        data: {}
    });
   }
}

exports.userChangePassword = async function (req, res, next) {
    const user = await Users.findOne({ '_id': req.body.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!user) 
    return res.status(500).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });

    let randomString = randomstring.generate({ length: 8 });
    let saltedHashPassword = saltedMd5(randomString, req.body.password);
    
    user.password = saltedHashPassword;
    user.salt = randomString;

    user.save(user)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'User password successfully updated',
            data: { user: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });   
}

exports.institutionChangePassword = async function (req, res, next) {
    const institution = await Institution.findOne({ '_id': req.body.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!institution) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    let randomString = randomstring.generate({ length: 8 });
    let saltedHashPassword = saltedMd5(randomString, req.body.password);
    
    institution.password = saltedHashPassword;
    institution.salt = randomString;

    institution.save(institution)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Account password successfully updated',
            data: { user: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });   
}

exports.postChangePasswordRequest = async function (req, res) {
	let email = req.body.email;

    if(!email) 
    return res.status(500).json({
        status: 'error',
        msg: 'Email is empty!',
        data: {}
    });

    var user;
    var institution;
    var account;
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

    if(user){ 
        type='user';
        account = user;
    }
    if(institution){ 
       type='institution';
       account=institution;
       account.role = 'institution';
    }

    const passwordreset  = new PasswordReset({
        token: uuidv4(),
        type: type,
        accountId: account.id,
        expiredAt: moment.tz('Asia/Singapore').add(30, 'minutes').format(),
        status: 'pending'
    });

    let passwordreseturl = 'https://localhost:8080/api/authorization/reset-password-request/'+passwordreset.token;
    let subject = 'KoCoSD Password Reset'
    let theMessage = `
        <h1>Password Reset Request</h1>
        <p>We received a request to reset your KoCoSD password.</p>
        <a href="${passwordreseturl}">Click here to change your password.</a><br>
    `
    

    passwordreset.save(passwordreset)
    .then(data => {
        Helper.sendEmail(req.body.email, subject, theMessage, function (info) {
            if (!info) {
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong while sending email!',
                    data: {}
                });
            } else {
                return res.status(200).json({
                    status: 'success',
                    msg: 'Please check your email to reset the password.',
                    data: {}
                });
            }
        })

    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

}