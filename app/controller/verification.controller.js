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
        return res.status(400).json({
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

exports.institutionRequestRegional = async function (req, res){
    const user = await Users.findOne({ '_id': req.body.id }, function (err, info) {
        if (err) return handleError(err);
    });

    if(!user) {
        return res.status(400).json({
            status: 'error',
            msg: 'No such user found! ',
            data: {}
        });
    }

    const institutions = await Institutions.find({ 'status': 'pending', 'country':user.country }, function (err) {
        if (err) return handleError(err);
    });

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for regional new institutions account request',
        data: { institutions: institutions }
    });
}

exports.userRequest = async function (req, res){
    const admin = await Users.find({ '_id': req.body.id }, function (err, info) {
        if (err) return handleError(err);
    });

    if(!admin) {
        return res.status(400).json({
            status: 'error',
            msg: 'No such user found! ',
            data: {}
        });
    }

    const verifyrequests = await VerifyRequests.find({ 'status': 'pending' }, function (err, info) {
        if (err) return handleError(err);
    });

    

    var theList = []

    for (var i = 0; i < verifyrequests.length; i++) {
        var user = await Users.findOne({ '_id': verifyrequests[i].userId }, function (err, info) {
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
            "country": "",
            "requestId": ""
        }

        if(!user) {
            verifyrequests[i].status = "closed";
            verifyrequests[i].save();
        } else {
            verifyrequest.userId = verifyrequests[i].userId;
            verifyrequest.status = verifyrequests[i].status;
            verifyrequest.imgPath = verifyrequests[i].imgPath;
            verifyrequest.createdAt = verifyrequests[i].createdAt;
            verifyrequest.requestId = verifyrequests[i].id;
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

exports.userRequestRegional = async function (req, res){
    const admin = await Users.findOne({ '_id': req.body.id }, function (err, info) {
        if (err) return handleError(err);
    });

    if(!admin) {
        return res.status(400).json({
            status: 'error',
            msg: 'No such user found! ',
            data: {}
        });
    }

    const verifyrequests = await VerifyRequests.find({ 'status': 'pending', 'country': admin.country }, function (err) {
        if (err) return handleError(err);
    });


    var theList = []

    for (var i = 0; i < verifyrequests.length; i++) {
        var user = await Users.findOne({ '_id': verifyrequests[i].userId }, function (err, info) {
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
            "country": "",
            "requestId":"",
        }
        
        if(!user) {
            verifyrequests[i].status = "closed";
            verifyrequests[i].save();
        } else {
            verifyrequest.userId = verifyrequests[i].userId;
            verifyrequest.status = verifyrequests[i].status;
            verifyrequest.imgPath = verifyrequests[i].imgPath;
            verifyrequest.createdAt = verifyrequests[i].createdAt;
            verifyrequest.requestId = verifyrequests[i].id;
            verifyrequest.name = user.name;
            verifyrequest.username = user.username;
            verifyrequest.email = user.email;
            verifyrequest.country = user.country;

            theList.push(verifyrequest);
        }        
    }

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for regional user account verification request',
        data: { verifyRequests: theList }
    });
}

exports.rejectInstitution = async function (req, res){
    const user = await Users.find({ '_id': req.body.id }, function (err, info) {
        if (err) return handleError(err);
    });

    if(!user) {
        return res.status(400).json({
            status: 'error',
            msg: 'No such user found! ',
            data: {}
        });
    }

    const institution = await Institutions.findOne({ '_id': req.body.institutionId }, function (err, info) {
        if (err) return handleError(err);
    });

    if(!institution) {
        return res.status(400).json({
            status: 'error',
            msg: 'No such account found! ',
            data: {}
        });
    }

    let theEmail = institution.email;

    institution.deleteOne({ "_id": req.body.institutionId }, function (err) {
        if (err) return handleError(err);
      });

    let subject = 'KoCoSD Institution Account'
    let theMessage = `
        <h1>Your account has been declined!</h1>
        <p>You may contact our admin if there is any discrepancies</p><br>
    `

    Helper.sendEmail(theEmail, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })

    var action = "Account rejected an institution request. The institution: "+institution.username+" ("+institution.id+")"
    Helper.createAuditLog(action,"admin",req.id)

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully declined the institution account',
        data: {  }
    });
    
}

exports.verifyInstitution = async function (req, res){
    const user = await Users.find({ '_id': req.body.id }, function (err, info) {
        if (err) return handleError(err);
    });

    if(!user) {
        return res.status(400).json({
            status: 'error',
            msg: 'No such user found! ',
            data: {}
        });
    }

    const institution = await Institutions.findOne({ '_id': req.body.institutionId }, function (err, info) {
        if (err) return handleError(err);
    });

    if(!institution) {
        return res.status(400).json({
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
    });

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

    var action = "Account verified an institution request. The institution: "+institution.username+" ("+institution.id+")"
    Helper.createAuditLog(action,"admin",req.id)

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully verified the institution account',
        data: { institution: institution }
    });
}

exports.acceptUserRequest = async function (req, res){
    const admin = await Users.find({ '_id': req.body.id }, function (err, info) {
        if (err) return handleError(err);
    });

    if(!admin) {
        return res.status(400).json({
            status: 'error',
            msg: 'No such admin found! ',
            data: {}
        });
    }

    const verifyrequest = await VerifyRequests.findOne({ '_id': req.body.requestId }, function (err) {
        if (err) return handleError(err);
    });

    if(!verifyrequest || verifyrequest.status != "pending") {
        return res.status(400).json({
            status: 'error',
            msg: 'No such request found! ',
            data: {}
        });
    }

    const user = await Users.findOne({ '_id': verifyrequest.userId }, function (err) {
        if (err) return handleError(err);
    });

    if(!user) {
        return res.status(400).json({
            status: 'error',
            msg: 'No such user found! ',
            data: {}
        });
    }

    user.isVerified = "true";
    user.save().catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: { }
        });    
    });

    verifyrequest.status = "accepted";
    verifyrequest.save().catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: { }
        });    
    });

    let subject = 'KoCoSD User Account Verification'
    let theMessage = `
        <h1>Your account verification request has been accepted!</h1>
        <p>If there is any discrepancy, you may contact our admin</p>
        <p>If this is not you, please contact our admin to resolve this.</p><br>
    `

    Helper.sendEmail(user.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })
    
    Helper.createNotification("KoCoSD Admin", "Congratz! Your account is now verified", user.id, "user")

    title = "Account Verified"
    desc = "This account has been verified by our admins"
    accountId = user.id
    accountType = "user"
        
    Helper.createProfileFeed(title,desc,accountId,accountType)

    var action = "Account accepted a user verification request. The user: "+user.username+" ("+user.id+")"
    Helper.createAuditLog(action,"admin",req.id)

    var action = "Account verified!"
    Helper.createAuditLog(action,"user",user.id)

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully accepted for a user account verification request',
        data: {}
    });

    
}

exports.declineUserRequest = async function (req, res){
    const admin = await Users.find({ '_id': req.body.id }, function (err, info) {
        if (err) return handleError(err);
    });

    if(!admin) {
        return res.status(400).json({
            status: 'error',
            msg: 'No such admin found! ',
            data: {}
        });
    }

    const verifyrequest = await VerifyRequests.findOne({ '_id': req.body.requestId }, function (err) {
        if (err) return handleError(err);
    });

    if(!verifyrequest || verifyrequest.status != "pending") {
        return res.status(400).json({
            status: 'error',
            msg: 'No such request found! ',
            data: {}
        });
    }

    const user = await Users.findOne({ '_id': verifyrequest.userId }, function (err) {
        if (err) return handleError(err);
    });

    if(!user) {
        return res.status(400).json({
            status: 'error',
            msg: 'No such user found! ',
            data: {}
        });
    }

    user.isVerified = "false";
    user.save().catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: { }
        });    
    });

    verifyrequest.status = "declined";
    verifyrequest.save().catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: { }
        });    
    });

    let subject = 'KoCoSD User Account Verification'
    let theMessage = `
        <h1>Your account verification request has been declined!</h1>
        <p>If there is any discrepancy, you may contact our admin</p>
        <p>If this is not you, please contact our admin to resolve this.</p><br>
    `

    Helper.sendEmail(user.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })

    Helper.createNotification("KoCoSD Admin", "Your verification request is rejected.", user.id, "user")

    var action = "Account declined a user verification request. The user: "+user.username+" ("+user.id+")"
    Helper.createAuditLog(action,"admin",req.id)

    var action = "Account verification request declined."
    Helper.createAuditLog(action,"user",user.id)

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully declined for a user account verification request',
        data: {}
    });
}

handleError = (err) => {
    console.log("handleError :"+ err)
 }