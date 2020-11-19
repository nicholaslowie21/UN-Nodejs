const { get } = require('http')
const moment = require('moment-timezone')
const db = require('../models')
const Users = db.users
const Projects = db.project
const Institutions = db.institution
const Reward = db.reward
const AuditLog = db.auditlog
const AccountClaim = db.accountclaim
const Helper = require('../service/helper.service')

exports.searchUsers = async function (req, res){

    var rgx = new RegExp(req.query.username, "i");
    
    const users = await Users.find({ 'username': { $regex: rgx } }, function (err) {
        if (err) return handleError(err);
    });

    if(!users) {
        return res.status(500).json({
            status: 'error',
            msg: 'No users found! ',
            data: {}
        });
    }
    
    var action = "Account search for users, keywords (username): "+req.query.username
    
    Helper.createAuditLog(action,"admin",req.id)

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for the users',
        data: { users: users }
    });
}

exports.allProjects = async function (req, res){
    const projects = await Projects.find({ 'status': { $ne: 'closed' } }, function (err) {
        if (err) return handleError(err);
    });

    if(!projects) {
        return res.status(500).json({
            status: 'error',
            msg: 'No users found! ',
            data: {}
        });
    }
    
    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for projects',
        data: { projects: projects }
    });
}

exports.searchInstitutions = async function (req, res){

    var rgx = new RegExp(req.query.username, "i");
    
    const institutions = await Institutions.find({ 'username': { $regex: rgx } }, function (err) {
        if (err) return handleError(err);
    });

    if(!institutions) {
        return res.status(500).json({
            status: 'error',
            msg: 'No users found! ',
            data: {}
        });
    }

    var action = "Account search for institutions, keywords (username): "+req.query.username
    
    Helper.createAuditLog(action,"admin",req.id)

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for the institutions',
        data: { institutions: institutions }
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

    var action = "Account assigned "+target.username+" as regional admin"
    
    Helper.createAuditLog(action,"admin",req.id)

    Helper.createNotification("KoCoSD Admin", "You have been assigned as regional admin!", target.id, "user")
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

    var action = "Account assigned "+target.username+" as admin"
    
    Helper.createAuditLog(action,"admin",req.id)

    Helper.createNotification("KoCoSD Admin", "You have been assigned as admin!", target.id, "user")
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

    var action = "Account assigned "+target.username+" as admin lead"
    
    Helper.createAuditLog(action,"admin",req.id)

    Helper.createNotification("KoCoSD Admin", "You have been assigned as admin lead!", target.id, "user")
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

    var action = "Account demoted "+target.username+" back as user"
    
    Helper.createAuditLog(action,"admin",req.id)

    Helper.createNotification("KoCoSD Admin", "Your account has been demoted back to user!", target.id, "user")
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

    var action = "Suspended an account: "+target.username
    
    Helper.createAuditLog(action,"admin",req.id)
}

exports.suspendInstitution = async function (req, res) {
    // find target institution by id
    const target = await Institutions.findOne({ '_id': req.body.targetId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong!',
            data: {}
        });
    });

    if(!target) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    target.status = 'suspended';

    target.save(target)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Institution account successfully suspended!',
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

    var action = "Suspended an institution account: "+target.username
    
    Helper.createAuditLog(action,"admin",req.id)
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

    var action = "Re-activate an account: "+target.username
    
    Helper.createAuditLog(action,"admin",req.id)
}

exports.activateInstitution = async function (req, res) {
    // find target user by id
    const target = await Institutions.findOne({ '_id': req.body.targetId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong!',
            data: {}
        });
    });

    if(!target) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    target.status = 'active';

    target.save(target)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Institution successfully re-activated!',
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

    var action = "Re-activate an institution account: "+target.username
    
    Helper.createAuditLog(action,"admin",req.id)
}

exports.suspendProject = async function (req, res) {
    const target = await Projects.findOne({ '_id': req.body.targetId }, function (err) {
        if (err) return handleError(err);
    });

    if(!target) 
    return res.status(500).json({
        status: 'error',
        msg: 'Project not found!',
        data: {}
    });

    var targetHost;

    if (target.hostType === "institution") {
        targetHost = await Institutions.findOne({ '_id': target.host }, function (err) {
            if (err) return handleError(err);
        });

    } else if (target.hostType === "user") {
        targetHost = await Users.findOne({ '_id': target.host }, function (err) {
            if (err) return handleError(err);
        });
    }

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
    let subject = 'KoCoSD Project Suspended'
    let theMessage = `
        <h1>Your project has been suspended!</h1>
        <p>The project code is ${target.code}<p>
        <p>Please contact our admin to resolve this.</p><br>
    `

    Helper.sendEmail(targetHost.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })

    var action = "Suspended a project: "+target.title
    
    Helper.createAuditLog(action,"admin",req.id)

    Helper.createNotification("KoCoSD Admin", "Project: "+target.title+" has been suspended.", target.host, target.hostType)
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

    var targetHost;

    if (target.hostType === "institution") {
        targetHost = await Institutions.findOne({ '_id': target.host }, function (err) {
            if (err) return handleError(err);
        });

    } else if (target.hostType === "user") {
        targetHost = await Users.findOne({ '_id': target.host }, function (err) {
            if (err) return handleError(err);
        });
    }

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

    let subject = 'KoCoSD Project Re-activated'
    let theMessage = `
        <h1>Your project has been reactivated!</h1>
        <p>The project code is ${target.code}<p>
        <p>If there is any discrepancy, please contact our admin to resolve this.</p><br>
    `

    Helper.sendEmail(targetHost.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })

    var action = "Re-activate a project "+target.title
    
    Helper.createAuditLog(action,"admin",req.id)

    Helper.createNotification("KoCoSD Admin", "Project: "+target.title+" has been re-activated.", target.host, target.hostType)
}

exports.getAuditLogs = async function (req, res) {
    const logs = await AuditLog.find({ 'targetId': req.query.targetId, 'targetType': req.query.targetType }, function (err) {
        if (err) return handleError(err);
    });

    if(!logs) 
    return res.status(500).json({
        status: 'error',
        msg: 'Logs not found!',
        data: {}
    });

    logs.reverse();

    var action = "Retrieved logs for "+req.query.targetId+", "+req.query.targetType
    
    Helper.createAuditLog(action,"admin",req.id)

    return res.status(200).json({
        status: 'success',
        msg: 'Log successfully retrieved!',
        data: { logs: logs }
    });
}

exports.getAccountClaims = async function (req, res) {
    const claims = await AccountClaim.find({ 'status': req.query.status}, function (err) {
        if (err) return handleError(err);
    });

    if(!claims) 
    return res.status(500).json({
        status: 'error',
        msg: 'Claims not found!',
        data: {}
    });

    var theList = []
    for(var i = 0; i < claims.length; i++) {
        var temp = JSON.parse(JSON.stringify(claims[i]))
        var tempAcc = await getAccount(temp.accountId, temp.accountType)

        if(!tempAcc) continue

        temp.account = tempAcc
        theList.push(temp)

    }
    
    return res.status(200).json({
        status: 'success',
        msg: 'Claims successfully retrieved!',
        data: { claims: theList }
    });
}

exports.validateAccountClaim = async function (req, res) {
    const claim = await AccountClaim.findOne({ '_id': req.body.claimId}, function (err) {
        if (err) return handleError(err);
    });

    if(!claim) 
    return res.status(500).json({
        status: 'error',
        msg: 'Claim not found!',
        data: {}
    });

    var account = await getAccount(claim.accountId, claim.accountType)
    if(!account) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    var gotError = false

    if(req.body.action === "accepted") {
        account.status = 'active'
        account.save().catch(err => {
            gotError = true
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! Error: '+err,
                data: {}
            });     
        })
    }

    if(gotError === true) return

    claim.status = req.body.action

    claim.save(claim)
    .then( data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Claim successfully validated!',
            data: { claim: data, account: account }
        });
    }).catch(err => {
        gotError = true
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });     
    })

    let subject = 'KoCoSD Account Claim'
    let theMessage = `
        <h1>Your account claim has been reviewed!</h1>
        <p>The status: ${req.body.action}.</p>
        <p>You may directly log in to our system if it is accepted by the admin</p>
        <p>If there is any discrepancy, please contact our admin to resolve this.</p><br>
    `
    
    Helper.sendEmail(account.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })
}

async function getAccount(theId, theType) {
    var account;

    if(theType === "user") {
        account = await Users.findOne({ '_id': theId }, function (err) {
            if (err) {
                console.log("error [mapping]: (getAccount)" + err.toString())
                return
            }
        });
    } else if (theType === 'institution') {
        account = await Institutions.findOne({ '_id': theId }, function (err) {
            if (err) {
                console.log("error [mapping]: (getAccount)" + err.toString())
                return
            }
        });
    }

    if(!account) {
        console.log("Error: Something went wrong when retrieving account")
        return
    }

    return account
}

exports.exportAuditLog = async function (req, res) {
    const logs = await AuditLog.find({ 'targetId': req.query.targetId, 'targetType': req.query.targetType }, function (err) {
        if (err) return handleError(err);
    });

    if(!logs) 
    return res.status(500).json({
        status: 'error',
        msg: 'Logs not found!',
        data: {}
    });

    logs.reverse();

    var title = ""
    var target;
    if(req.query.targetType === 'admin' || req.query.targetType === 'user') {
        target = await Users.findOne({ '_id': req.query.targetId }, function (err) {
            if (err) return handleError(err);
        }); 
        title = target.username
    } else if(req.query.targetType === 'institution') {
        target = await Institutions.findOne({ '_id': req.query.targetId }, function (err) {
            if (err) return handleError(err);
        }); 
        title = target.username
    } else if(req.query.targetType === 'reward') {
        target = await Reward.findOne({ '_id': req.query.targetId }, function (err) {
            if (err) return handleError(err);
        }); 
        title = target.title
    } else if(req.query.targetType === 'project') {
        target = await Projects.findOne({ '_id': req.query.targetId }, function (err) {
            if (err) return handleError(err);
        }); 
        title = target.title
    }

    if(!target)
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong! Target not found.',
        data: {}
    });

    var pdf = require("pdf-creator-node");
    var fs = require('fs');

    let report = `
    <html>
    <body style="font-size: 20px">
        <h1> Subject: ${title}</h1>
        <ul>
            {{#each logs}}
            <li>Action: {{this.action}}</li>
            <li>Created At: {{this.createdAt}}</li>
            <br>
        {{/each}}
        </ul>
    </body>
    </html>
    `
    var options = {
        format: "A4",
        orientation: "portrait",
        border: "10mm",
        header: {
            height: "45mm",
            contents: '<div style="text-align: center;"><h1>KoCoSD Audit Logs</h1></div>'
        }
    };

    var theData = []

    for(var i = 0; i < logs.length; i++) {
        var theItem = {
            action: logs[i].action,
            createdAt: moment.tz(logs[i].createdAt, 'Asia/Singapore').format('LLLL')
        }
        theData.push(theItem)
    }

    let dir = 'public/auditLogs'
        
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    var thePath = `/public/auditLogs/${req.query.targetId}-auditLogs-${Date.now()}.pdf` 
    var document = {
        html: report,
        data: {
            logs: theData
        },
        path: "."+thePath
    };

    pdf.create(document, options)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Audit log export link successfully generated!',
            data: { thePath: thePath }
        });
    })
    .catch(error => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong!'+error.message,
            data: { }
        });
    });

    var action = "Generated export logs for "+req.query.targetId+", "+req.query.targetType
    action += " file path: "+thePath
    
    Helper.createAuditLog(action,"admin",req.id)
}

handleError = (err) => {
    console.log("handleError :"+ err)
 }