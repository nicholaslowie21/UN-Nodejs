const moment = require('moment-timezone')
const db = require('../models')
const Users = db.users;
const Helper = require('../service/helper.service')

exports.searchUsersToPromote = async function (req, res){

    var rgx = new RegExp(req.body.username, "i");
    
    const users = await Users.find({ 'username': { $regex: rgx } }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!users) {
        return res.status(500).json({
            status: 'error',
            msg: 'No users found! ',
            data: {}
        });
    }

    return res.status(200).json({
        status: 'success',
        msg: '',
        data: { users: users }
    });
}

exports.assignRegionalAdmin = async function (req, res) {
    // find target user by id
    const target = await Users.findOne({ '_id': req.body.targetId }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!target) 
    return res.status(500).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });

    target.role = 'regionaladmin';

    target.save(target)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'User successfully assigned as regional admin',
            data: { target: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    }); 

    let subject = 'KoCoSD Account Role'
    let theMessage = `
        <h1>Your account role has been updated!</h1>
        <p>You are now a Regional Admin.</p>
        <p>If there is any discrepancy, please contact our admin to resolve this.</p><br>
    `

    Helper.sendEmail(target.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })
}

exports.assignAdmin = async function (req, res) {
    // find target user by id
    const target = await Users.findOne({ '_id': req.body.targetId }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!target) 
    return res.status(500).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });

    target.role = 'admin';

    target.save(target)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'User successfully assigned as admin',
            data: { target: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    }); 

    let subject = 'KoCoSD Account Role'
    let theMessage = `
        <h1>Your account role has been updated!</h1>
        <p>You are now an Admin.</p>
        <p>If there is any discrepancy, please contact our admin to resolve this.</p><br>
    `

    Helper.sendEmail(target.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })
}

exports.assignAdminLead = async function (req, res) {
    // find target user by id
    const target = await Users.findOne({ '_id': req.body.targetId }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!target) 
    return res.status(500).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });

    target.role = 'adminlead';

    target.save(target)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'User successfully promoted to admin lead',
            data: { target: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    }); 

    
    let subject = 'KoCoSD Account Role'
    let theMessage = `
        <h1>Your account role has been updated!</h1>
        <p>You are now an Admin Lead.</p>
        <p>If there is any discrepancy, please contact our admin to resolve this.</p><br>
    `

    Helper.sendEmail(target.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })
}

// demotion of any type of admin uses this function since any demotion is back to user
exports.assignUser = async function (req, res) {
    // find target user by id
    const target = await Users.findOne({ '_id': req.body.targetId }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!target) 
    return res.status(500).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });

    target.role = 'user';

    target.save(target)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'User successfully assigned back to ordinary user',
            data: { target: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    }); 

    let subject = 'KoCoSD Account Role'
    let theMessage = `
        <h1>Your account role has been updated!</h1>
        <p>You are now a User.</p>
        <p>If there is any discrepancy, please contact our admin to resolve this.</p><br>
    `

    Helper.sendEmail(target.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })
}