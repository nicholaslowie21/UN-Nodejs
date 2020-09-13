const moment = require('moment-timezone')
const db = require('../models')
const Users = db.users
const Projects = db.project
const Helper = require('../service/helper.service')

exports.searchUsers = async function (req, res){

    var rgx = new RegExp(req.query.username, "i");
    
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
        msg: 'You have successfully queried for the users',
        data: { users: users }
    });
}

exports.getRegionalAdmins = async function (req, res){    
    var users = await Users.find({ 'role': "regionaladmin" }, function (err, person) {
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
        msg: 'List of regional admins successfully retrieved',
        data: { regionalAdmins: users }
    });
}

exports.getAdmins = async function (req, res){    
    var users = await Users.find({ 'role': "admin" }, function (err, person) {
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
        msg: 'List of admins successfully retrieved',
        data: { admins: users }
    });
}

exports.getAdminLeads = async function (req, res){    
    var users = await Users.find({ 'role': "adminlead", "username": { $ne: "superadmin"} }, function (err, person) {
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
        msg: 'List of admin leads successfully retrieved',
        data: { adminLeads: users }
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

exports.suspendUser = async function (req, res) {
    // find target user by id
    const target = await Users.findOne({ '_id': req.body.targetId }, function (err) {
        if (err) return handleError(err);
    });

    if(!target) 
    return res.status(500).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });

    target.status = 'suspended';

    target.save(target)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'User successfully suspended!',
            data: { target: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    }); 

    
    let subject = 'KoCoSD Account Suspension'
    let theMessage = `
        <h1>Your account has been suspended!</h1>
        <p>If there is any discrepancy, please contact our admin to resolve this.</p><br>
    `

    Helper.sendEmail(target.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })
}

exports.activateUser = async function (req, res) {
    // find target user by id
    const target = await Users.findOne({ '_id': req.body.targetId }, function (err) {
        if (err) return handleError(err);
    });

    if(!target) 
    return res.status(500).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });

    target.status = 'active';

    target.save(target)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'User successfully activated!',
            data: { target: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    }); 

    
    let subject = 'KoCoSD Account Re-activation'
    let theMessage = `
        <h1>Your account has been re-activated!</h1>
        <p>If there is any discrepancy, please contact our admin to resolve this.</p><br>
    `

    Helper.sendEmail(target.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })
}

exports.suspendProject = async function (req, res) {
    // find target user by id
    const target = await Projects.findOne({ '_id': req.body.targetId }, function (err) {
        if (err) return handleError(err);
    });

    if(!target) 
    return res.status(500).json({
        status: 'error',
        msg: 'Project not found!',
        data: {}
    });

    target.status = 'suspended';

    target.save(target)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Project successfully suspended!',
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

exports.activateProject = async function (req, res) {
    // find target user by id
    const target = await Projects.findOne({ '_id': req.body.targetId }, function (err) {
        if (err) return handleError(err);
    });

    if(!target) 
    return res.status(500).json({
        status: 'error',
        msg: 'Project not found!',
        data: {}
    });

    target.status = 'ongoing';

    target.save(target)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Project successfully re-activated!',
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

handleError = (err) => {
    console.log("handleError :"+ err)
 }