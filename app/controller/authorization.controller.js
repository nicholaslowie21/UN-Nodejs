const moment = require('moment-timezone')
const db = require('../models')
const Users = db.users;
const Institution = db.institution;
const PasswordReset = db.passwordreset;
const VerifyRequest = db.verifyrequest;
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
        isVerified: "false",
        profilePic: '',
        country: req.body.country,
        points: 0,
        salt: randomString,
        wallet: 0,
        gender: req.body.gender
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
		status: 'pending',
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

   if(user) { 
        if(user.status != 'active') {
            return res.status(500).json({
                status: 'error',
                msg: 'Account is currently suspended!',
                data: {}
            });
        }
        type='user';
   }
   if(institution){ 

        if(institution.status != 'active') {
        return res.status(500).json({
            status: 'error',
            msg: 'Account is currently not verified or suspended!',
            data: {}
        });
        }
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

    let verifyOldPassword = saltedMd5(user.salt,req.body.oldpassword);
    if(verifyOldPassword != user.password) {
        return res.status(500).json({
            status: 'error',
            msg: 'The old password mismatched!',
            data: {}
        });
    }

    let randomString = randomstring.generate({ length: 8 });
    let saltedHashPassword = saltedMd5(randomString, req.body.newpassword);
    
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
    
    let subject = 'KoCoSD Password Change'
    let theMessage = `
        <h1>Password Change!</h1>
        <p>You have change your account password.</p>
        <p>If this is not you, please contact our admin to resolve this.</p><br>
    `

    Helper.sendEmail(user.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })
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

    let verifyOldPassword = saltedMd5(institution.salt,req.body.oldpassword);
    if(verifyOldPassword != institution.password) {
        return res.status(500).json({
            status: 'error',
            msg: 'The old password mismatched!',
            data: {}
        });
    }

    let randomString = randomstring.generate({ length: 8 });
    let saltedHashPassword = saltedMd5(randomString, req.body.newpassword);
    
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

    let subject = 'KoCoSD Password Change'
    let theMessage = `
        <h1>Password Change!</h1>
        <p>You have change your account password.</p>
        <p>If this is not you, please contact our admin to resolve this.</p><br>
    `

    Helper.sendEmail(institution.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })
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

exports.getChangePassword = async function (req,res) {
    let passreset = await PasswordReset.findOne({ 'token': req.params.token }, function (err, person) {
        if (err) 
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    if(passreset){
        if (moment(passreset.expiredAt).isSameOrBefore(moment.tz('Asia/Singapore').format())) {
            console.log('Expired Password Change Request');
            res.render('error-reset', { title: "Reset password", message: 'Your request is already expired!'});
            return;
        } else {
            console.log('Success access to change password page');
            res.render('password-reset', { title: "Reset password", token: req.params.token });
        }
    } else {
        res.render('error-reset', { title: "Reset password", message: 'No such request found!'});
        return;
    }
}

exports.postUpdatePassword = async function(req, res) {
    console.log("reach post update password")
    let password = req.body.password

	if (!req.body.token) {
        res.render('error-reset', { title: "Reset password", message: 'Your request token is corrupted, please make a new request!'});
        return;
    }

    if(!password){        
        res.render('error-reset', { title: "Reset password", message: 'Your password is empty!'});
        return;
    }

    if(password.length < 8) {
        res.render('error-reset', { title: "Reset password", message: 'Password length must be longer than 8!'});
        return;
    }
    
    
    let passreset = await PasswordReset.findOne({ 'token': req.body.token }, function (err, person) {
        if (err) 
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    if(!passreset) {
        res.render('error-reset', { title: "Reset password", message: 'Your password change request is missing!'});
        return;
    }

    if(passreset && passreset.status === 'pending'){
        if(passreset.type === 'user') {
            let user = await Users.findOne({ '_id': passreset.accountId }, function (err, person) {
                if (err) return handleError(err);
            });

            if(!user)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong!',
                data: {}
            });

            let randomString = randomstring.generate({ length: 8 });
            let saltedHashPassword = saltedMd5(randomString, req.body.password);
    
            user.password = saltedHashPassword;
            user.salt = randomString;

            passreset.status = 'completed';
            passreset.save();

            user.save(user)
            .then(data => {
                res.render('success-reset', { title: "Reset password"});
                return;
            }).catch(err => {
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong! Error: ' + err.message,
                    data: {}
                });
            });
            

        } else {
            let institution = await Institution.findOne({ '_id': passreset.accountId }, function (err, person) {
                if (err) return handleError(err);
            });

            if(!institution)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong!',
                data: {}
            });

            let randomString = randomstring.generate({ length: 8 });
            let saltedHashPassword = saltedMd5(randomString, req.body.password);
    
            institution.password = saltedHashPassword;
            institution.salt = randomString;

            passreset.status = 'completed';
            passreset.save();

            institution.save(institution)
            .then(data => {
                res.render('success-reset', { title: "Reset password"});
                return;
            }).catch(err => {
                res.render('error-reset', { title: "Reset password"});
                return;
            });

        }
    } else {
        res.render('error-reset', { title: "Reset password", message: 'You might have changed your password!'});
        return;
    }
}

exports.verifyRequest = async function(req,res) {
    if(req.body.type != 'user') {
        return res.status(500).json({
            status: 'error',
            msg: 'Only user can request for verification',
            data: {}
        });
    }
    
    const verifyrequest = new VerifyRequest({
        id: req.body.id,
        status: 'pending'
    });
    
    verifyrequest.save(verifyrequest)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Verification request successfully sent!',
            data: { verifyrequest: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}