const moment = require('moment-timezone')
const db = require('../models')
const Target = db.target
const User = db.users
const Institution = db.institution
const Project = db.project
const Testimonial = db.testimonial
const Helper = require('../service/helper.service')

exports.getCommonProject = async function (req, res){
    
    var targetAccount = await getAccount(req.id, req.type)
    if(!targetAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving your account',
        data: { }
    });

    var creatorAccount = await getAccount(req.query.accountId, req.query.accountType)
    if(!creatorAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving account',
        data: { }
    });

    var projectsA = targetAccount.projects
    var projectsB = creatorAccount.projects
    
    if(projectsB.length < projectsA.length) {
        var temp = projectsA
        projectsA = projectsB
        projectsB = temp
    }

    var theList = []

    for(var i = 0 ; i < projectsA.length; i++) {
        if(projectsB.includes(projectsA[i])) theList.push(projectsA[i])
    }

    var theProjects = []

    for(var i = 0; i < theList.length; i++) {
        var temp = await getProject(theList[i])
        if(temp) theProjects.push(temp)
    }

    theProjects.reverse()

    return res.status(200).json({
        status: 'success',
        msg: 'Common projects retrieved',
        data: { theProjects: theProjects }
    });
}

exports.getOutgoingTestimonial = async function (req, res){
    
    var myAccount = await getAccount(req.id, req.type)
    if(!myAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving your account',
        data: { }
    });

    const testimonials = await Testimonial.find({ 'status': req.query.status, 'creatorId': req.query.accountId, 'creatorType': req.query.accountType}, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong while retrieving testimonials',
            data: { }
        });
    });

    if (!testimonials)
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving testimonials',
        data: { }
    });

    var theList = []

    for(var i = 0; i < testimonials.length; i++) {
        var temp = JSON.parse(JSON.stringify(testimonials[i]))
        var targetAccount = await getAccount(testimonials[i].targetId, testimonials[i].targetType)
        var theProject = await getProject(testimonials[i].projectId)
        if(!targetAccount) continue
        if(!theProject) continue
        temp.targetName = targetAccount.name
        temp.targetUsername = targetAccount.username
        temp.targetImg = targetAccount.ionicImg
        temp.projectTitle = theProject.title
        theList.push(temp)
    }

    theList.reverse()

    return res.status(200).json({
        status: 'success',
        msg: 'My outgoing testimonials retrieved',
        data: { testimonials: theList }
    });
}

exports.getMyTestimonial = async function (req, res){
    
    var myAccount = await getAccount(req.id, req.type)
    if(!myAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving your account',
        data: { }
    });

    const testimonials = await Testimonial.find({ 'status': req.query.status, 'targetId': req.query.accountId, 'targetType': req.query.accountType}, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong while retrieving testimonials',
            data: { }
        });
    });

    if (!testimonials)
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving testimonials',
        data: { }
    });

    var theList = []

    for(var i = 0; i < testimonials.length; i++) {
        var temp = JSON.parse(JSON.stringify(testimonials[i]))
        var targetAccount = await getAccount(testimonials[i].creatorId, testimonials[i].creatorType)
        var theProject = await getProject(testimonials[i].projectId)
        
        if(!targetAccount) continue
        if(!theProject) continue
        
        temp.creatorName = targetAccount.name
        temp.creatorUsername = targetAccount.username
        temp.creatorImg = targetAccount.ionicImg
        temp.projectTitle = theProject.title
        
        theList.push(temp)
    }

    theList.reverse()

    return res.status(200).json({
        status: 'success',
        msg: 'My testimonials retrieved',
        data: { testimonials: theList }
    });
}

exports.requestTestimonial = async function (req, res){
    
    var targetAccount = await getAccount(req.id, req.type)
    if(!targetAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving your account',
        data: { }
    });

    var creatorAccount = await getAccount(req.body.accountId, req.body.accountType)
    if(!creatorAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving account',
        data: { }
    });

    var theProject = await getProject(req.body.projectId)

    if(!theProject)
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while verifying project',
        data: { }
    });
    
    if(!targetAccount.projects.includes(theProject.id) || !creatorAccount.projects.includes(theProject.id))
    return res.status(400).json({
        status: 'error',
        msg: 'This project is not mutual',
        data: { }
    });

    var theRequest = await Testimonial.findOne({ 'targetId': req.id, 'targetType':req.type, 
        'creatorId':creatorAccount.id, 'creatorType': req.body.accountType, 'projectId': req.body.projectId,
        'status': { $in: ['open','requested','pending'] }}, function (err) {
        if (err) 
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: { }
        });
    });

    if(theRequest)
    return res.status(400).json({
        status: 'error',
        msg: 'There was already such testimonial query',
        data: { }
    });

    const newRequest = new Testimonial({
        targetId: targetAccount.id,
        targetType: req.type,
        creatorId: creatorAccount.id,
        creatorType: req.body.accountType,
        status:'requested',
        projectId: req.body.projectId
    })

    newRequest.save(newRequest)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Testimonial request created!',
            data: { testimonial: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });   

    Helper.createNotification("Testimonial", targetAccount.name + " requested for your testimonial. Check them out!", creatorAccount.id, req.body.accountType)
}

exports.writeTestimonial = async function (req, res){
    
    var targetAccount = await getAccount(req.body.accountId, req.body.accountType)
    if(!targetAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving account',
        data: { }
    });

    var creatorAccount = await getAccount(req.id, req.type)
    if(!creatorAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving account',
        data: { }
    });

    var theProject = await getProject(req.body.projectId)

    if(!theProject)
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while verifying project',
        data: { }
    });
    
    if(!targetAccount.projects.includes(theProject.id) || !creatorAccount.projects.includes(theProject.id))
    return res.status(400).json({
        status: 'error',
        msg: 'This project is not mutual',
        data: { }
    });

    var theRequest = await Testimonial.findOne({ 'targetId': req.id, 'targetType':req.type, 
        'creatorId':creatorAccount.id, 'creatorType': req.body.accountType, 'projectId': req.body.projectId,
        'status': { $in: ['open','requested','pending'] }}, function (err) {
        if (err) 
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: { }
        });
    });

    if(theRequest)
    return res.status(400).json({
        status: 'error',
        msg: 'There was already such testimonial query',
        data: { }
    });

    const newRequest = new Testimonial({
        targetId: targetAccount.id,
        targetType: req.body.accountType,
        creatorId: creatorAccount.id,
        creatorType: req.type,
        status:'pending',
        projectId: req.body.projectId,
        desc: req.body.desc
    })

    newRequest.save(newRequest)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Testimonial created!',
            data: { testimonial: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    Helper.createNotification("Testimonial", creatorAccount.name + " write a testimonial for you. Check them out!", targetAccount.id, req.body.accountType)
    
}

exports.updateTestimonialStatus = async function (req, res){
    
    var myAccount = await getAccount(req.id, req.type)
    if(!myAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving your account',
        data: { }
    });

    var testimonial = await Testimonial.findOne({ '_id': req.body.testimonialId }, function (err) {
        if (err) 
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: { }
        });
    });

    if(!testimonial)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such testimonial',
        data: { }
    });

    if(testimonial.targetId != req.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to perform this action',
        data: { }
    });

    if( req.body.status === 'open' && testimonial.status != 'pending')
    return res.status(400).json({
        status: 'error',
        msg: 'This update is invalid',
        data: { }
    });

    if( req.body.status === 'dismissed' && testimonial.status != 'pending')
    return res.status(400).json({
        status: 'error',
        msg: 'This update is invalid',
        data: { }
    });

    testimonial.status = req.body.status

    testimonial.save(testimonial)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Testimonial updated successfully!',
            data: { testimonial: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
    
    Helper.createNotification("Testimonial", myAccount.name + " updated the status of the testimonial you wrote about them to "+req.body.status, testimonial.creatorId, testimonial.creatorType)
}

exports.updateOutgoingTestimonialStatus = async function (req, res){
    
    var myAccount = await getAccount(req.id, req.type)
    if(!myAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving your account',
        data: { }
    });

    var testimonial = await Testimonial.findOne({ '_id': req.body.testimonialId }, function (err) {
        if (err) 
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: { }
        });
    });

    if(!testimonial)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such testimonial',
        data: { }
    });

    if(req.id != testimonial.creatorId)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to perform this action!',
        data: { }
    });

    if( req.body.status === 'pending' && testimonial.status != 'requested')
    return res.status(400).json({
        status: 'error',
        msg: 'This update is invalid',
        data: { }
    });

    if(req.body.status === 'pending' && req.body.desc.length === 0)
    return res.status(400).json({
        status: 'error',
        msg: 'This desc field is invalid',
        data: { }
    });

    if(req.body.status === 'pending') testimonial.desc = req.body.desc
    testimonial.status = req.body.status

    testimonial.save(testimonial)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Testimonial updated successfully!',
            data: { testimonial: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
    
    Helper.createNotification("Testimonial", myAccount.name + " updated the status of the testimonial they wrote about you to "+req.body.status, testimonial.targetId, testimonial.targetType)
}

async function getProject(theId) {
    const project = await Project.findOne({ '_id': theId}, function (err) {
        if (err) {
            console.log("The projectId in your contribution is invalid! error: "+err.message)
            return
        }
    });

    if(!project) {
        console.log("Error: Something went wrong when retrieving needs")
        return
    }

    return project
}

async function getAccount(theId, theType) {
    var account;

    if(theType === "user") {
        account = await User.findOne({ '_id': theId }, function (err) {
            if (err) {
                console.log("error [testimonial]: (getAccount)" + err.toString())
                return
            }
        });
    } else if (theType === 'institution') {
        account = await Institution.findOne({ '_id': theId }, function (err) {
            if (err) {
                console.log("error [testimonial]: (getAccount)" + err.toString())
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

exports.possibleTarget = async function (req, res){
    
    var sdgs = req.body.SDGs

    var targets = await Target.find({ 'SDG': {$in: sdgs} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the targets!',
            data: {}
        });
    }); 
    targets.sort(function(a, b){
        if(a.SDG === b.SDG) {
            var theA = ""+a.targetCode
            var theB = ""+b.targetCode
            if(theA<theB) return -1
            else return 1
        }            
        else
            return a.SDG - b.SDG
            
    })
    
    return res.status(200).json({
        status: 'success',
        msg: 'Possible targets retrieved',
        data: { targets: targets }
    });
}

exports.updateAccountTarget = async function (req, res){
    
    var account;

    if(req.type === "user") {
        account = await User.findOne({ '_id': req.id }, function (err) {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong!'+err.message,
                    data: {}
                });
            }
        });
    } else if (req.type === 'institution') {
        account = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong!'+err.message,
                    data: {}
                });
            }
        });
    }

    if(!account) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving account!',
        data: {}
    });
    
    var targetIds = req.body.targetIds
    for(var i = 0; i < targetIds.length; i++){
        var target = await Target.findOne({ '_id': targetIds[i] }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue retrieving the target!',
                data: {}
            });
        }); 
    }

    account.targets = targetIds

    account.save(account)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Account targets updated',
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

exports.updateProjectTarget = async function (req, res){
    
    var project = await Project.findOne({ '_id': req.body.projectId }, function (err) {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong!'+err.message,
                    data: {}
                });
            }
    });
    

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving project!',
        data: {}
    });
    

    var targetIds = req.body.targetIds
    for(var i = 0; i < targetIds.length; i++){
        var target = await Target.findOne({ '_id': targetIds[i] }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue retrieving the target!',
                data: {}
            });
        }); 
    }

    project.targets = targetIds

    project.save(project)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Project targets updated',
            data: { project: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.accountTargetLists = async function (req, res){
    
    var account;

    if(req.query.accountType === "user") {
        account = await User.findOne({ '_id': req.query.accountId }, function (err) {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong!'+err.message,
                    data: {}
                });
            }
        });
    } else if (req.query.accountType === 'institution') {
        account = await Institution.findOne({ '_id': req.query.accountId }, function (err) {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong!'+err.message,
                    data: {}
                });
            }
        });
    }

    if(!account) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving account!',
        data: {}
    });
    
    var targetIds = account.targets
    var theList = [];
    for(var i = 0; i < targetIds.length; i++){
        var target = await Target.findOne({ '_id': targetIds[i] }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue retrieving the target!',
                data: {}
            });
        }); 

        theList.push(target)
    }

    theList.sort(function(a, b){
        if(a.SDG === b.SDG) {
            var theA = ""+a.targetCode
            var theB = ""+b.targetCode
            if(theA<theB) return -1
            else return 1
        }            
        else
            return a.SDG - b.SDG
            
    })

    return res.status(200).json({
        status: 'success',
        msg: 'Account targets retrieved',
        data: { targets: theList }
    });
}

exports.getProjectTarget = async function (req, res){
    
    var project = await Project.findOne({ '_id': req.query.projectId }, function (err) {
        if (err) {
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong!'+err.message,
                data: {}
            });
        }
    });


    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving project!',
        data: {}
    });

    var targetIds = project.targets
    var theList = [];
    for(var i = 0; i < targetIds.length; i++){
        var target = await Target.findOne({ '_id': targetIds[i] }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue retrieving the target!',
                data: {}
            });
        }); 

        theList.push(target)
    }

    theList.sort(function(a, b){
        if(a.SDG === b.SDG) {
            var theA = ""+a.targetCode
            var theB = ""+b.targetCode
            if(theA<theB) return -1
            else return 1
        }            
        else
            return a.SDG - b.SDG
            
    })

    return res.status(200).json({
        status: 'success',
        msg: 'Project targets retrieved',
        data: { targets: theList }
    });
}


