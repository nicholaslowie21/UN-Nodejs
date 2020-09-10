const moment = require('moment-timezone')
const db = require('../models')
const Users = db.users;

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
        data: { users }
    });
}

exports.promoteToRegionalAdmin = async function (req, res) {
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

    target.role = 'regionalAdmin';

    target.save(target)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'User successfully promoted to regional admin',
            data: { target: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    }); 
}

exports.promoteToAdmin = async function (req, res) {
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
            msg: 'User successfully promoted to admin',
            data: { target: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    }); 
}

exports.promoteToAdminLead = async function (req, res) {
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

    target.role = 'adminLead';

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
}

// demotion of any type of admin uses this function since any demotion is back to user
exports.demoteAnyAdmin = async function (req, res) {
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
            msg: 'User successfully demoted back to ordinary user',
            data: { target: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    }); 
}