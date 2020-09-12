const moment = require('moment-timezone')
const db = require('../models')
const Users = db.users
const Institutions = db.institution
const VerifyRequests = db.verifyrequest
const Helper = require('../service/helper.service')

exports.institutionRequest = async function (req, res){
    const user = await Users.find({ '_id': req.body.id }, function (err, info) {
        if (err) return handleError(err);
    });

    if(!user) {
        return res.status(500).json({
            status: 'error',
            msg: 'No such user found! ',
            data: {}
        });
    }

    const institutions = await Institutions.find({ 'status': 'pending' }, function (err, info) {
        if (err) return handleError(err);
    });

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for new institutions account request',
        data: { institutions: institutions }
    });
}

exports.userRequest = async function (req, res){
    const admin = await Users.find({ '_id': req.body.id }, function (err, info) {
        if (err) return handleError(err);
    });

    if(!admin) {
        return res.status(500).json({
            status: 'error',
            msg: 'No such user found! ',
            data: {}
        });
    }

    const verifyrequests = await VerifyRequests.find({ 'status': 'pending' }, function (err, info) {
        if (err) return handleError(err);
    });

    var verifyrequest = {
        "userId": "",
        "status": "",
        "imgPath": "",
        "createdAt": "",
        "name": "",
        "username": "",
        "email": "",
        "country": ""
    }

    var theList = []

    for (var i = 0; i < verifyrequests.length; i++) {
        var user = await Users.findOne({ '_id': verifyrequests[i].userId }, function (err, info) {
            if (err) return handleError(err);
        });
        
        if(!user) {
            verifyrequests[i].status = "closed";
            verifyrequests[i].save();
        } else {
            verifyrequest.userId = verifyrequests[i].userId;
            verifyrequest.status = verifyrequests[i].status;
            verifyrequest.imgPath = verifyrequests[i].imgPath;
            verifyrequest.createdAt = verifyrequests[i].createdAt;
            verifyrequest.name = user.name;
            verifyrequest.username = user.username;
            verifyrequest.email = user.email;
            verifyrequest.country = user.country;

            theList.push(verifyrequest);
        }        
    }

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for user account verification request',
        data: { verifyRequests: theList }
    });
}

exports.verifyInstitution = async function (req, res){
    const user = await Users.find({ '_id': req.body.id }, function (err, info) {
        if (err) return handleError(err);
    });

    if(!user) {
        return res.status(500).json({
            status: 'error',
            msg: 'No such user found! ',
            data: {}
        });
    }

    const institution = await Institutions.findOne({ '_id': req.body.institutionId }, function (err, info) {
        if (err) return handleError(err);
    });

    if(!institution) {
        return res.status(500).json({
            status: 'error',
            msg: 'No such account found! ',
            data: {}
        });
    }

    institution.isVerified = true;
    institution.status = "active";
    institution.save().catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: { }
        });    
    });;

    let subject = 'KoCoSD Institution Account Verified'
    let theMessage = `
        <h1>Your account has been verified!</h1>
        <p>You can now log in to your account in the app.</p>
        <p>If this is not you, please contact our admin to resolve this.</p><br>
    `

    Helper.sendEmail(institution.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully verified the institution account',
        data: { institution: institution }
    });
    
}

handleError = (err) => {
    console.log("handleError :"+ err)
 }