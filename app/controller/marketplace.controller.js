const moment = require('moment-timezone')
const db = require('../models')
const Manpower = db.manpower
const User = db.users
const Knowledge = db.knowledge
const Item = db.item
const Venue = db.venue
const Money = db.money
const ResourceNeed = db.resourceneed
const Institution = db.institution
const ResourceReq = db.resourcereq
const ProjectReq = db.projectreq
const Project = db.project
const Contribution = db.contribution
const DiscoverWeekly = db.discoverweekly
const nodeCountries =  require("node-countries")
const Helper = require('../service/helper.service')
const { default: ShortUniqueId } = require('short-unique-id');
const uid = new ShortUniqueId();
const CronJob = require('cron').CronJob;

exports.reqResource = async function (req, res) {
    var theRequester    

    if (req.body.type === "user") {
        theRequester = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theRequester = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theRequester) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    var resource;

    if(req.body.resType === "item") {
        resource = await Item.findOne({ '_id': req.body.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.resType === "venue") {
        resource = await Venue.findOne({ '_id': req.body.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.resType === "manpower") {
        resource = await Manpower.findOne({ '_id': req.body.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    

    if(!resource)
    return res.status(500).json({
        status: 'error',
        msg: 'Such item resource not found!',
        data: {}
    });
    
    if(resource.status != "active")
    return res.status(500).json({
        status: 'error',
        msg: 'You cannot request for this resource!',
        data: {}
    });

    const resourceneed = await ResourceNeed.findOne({ '_id': req.body.needId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!resourceneed)
    return res.status(500).json({
        status: 'error',
        msg: 'Such item resource need not found!',
        data: {}
    });

    if(resourceneed.type != req.body.resType)
    return res.status(500).json({
        status: 'error',
        msg: 'Type mismatch! Resource need type and the resource type are different',
        data: {}
    });

    if(resourceneed.status != "progress")
    return res.status(500).json({
        status: 'error',
        msg: 'Your resource need status is no longer in progress',
        data: {}
    });

    const project = await Project.findOne({ '_id': resourceneed.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!project)
    return res.status(500).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    if(project.status != "ongoing")
    return res.status(500).json({
        status: 'error',
        msg: 'This project is not ongoing!',
        data: {}
    });

    if(project.host != req.body.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.body.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.body.id) valid = true;

    if(!valid)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to edit this project!',
        data: {}
    });

    var temp = await ResourceReq.findOne({ 'needId': resourceneed.id, "resourceId": resource.id, "resType": req.body.resType, "status":"pending" }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(temp)
    return res.status(500).json({
        status: 'error',
        msg: 'Such resource request have been created! ',
        data: {}
    }); 

    const resourcereq = new ResourceReq({
        projectId: project.id,
        needId: req.body.needId,
        resourceId: req.body.resourceId,
        resType: req.body.resType,
        status:"pending",
        desc: req.body.desc
    })

    resourcereq.save(resourcereq)
    .then(data => {
        var action = "Account requested a resource: "+resource.title+" ("+resource.id+", "+req.body.resType+")"
        action += " for project: "+project.title+" ("+project.id+","+project.code+")"

        Helper.createAuditLog(action,req.type,req.id)

        action = "Project requested a resource: "+ resource.title +" ("+resource.id+", "+req.body.resType+")"
    
        Helper.createAuditLog(action,"project",project.id)

        Helper.createNotification("Resource Request", "Resource: "+resource.title+" has been requested.", resource.owner, resource.ownerType)

        return res.status(200).json({
            status: 'success',
            msg: 'Resource request successfully created',
            data: { resourcereq: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.reqAutoResource = async function (req, res) {
    var theRequester    

    if (req.body.type === "user") {
        theRequester = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theRequester = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theRequester) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    var resource;

    if(req.body.resType === "item") {
        resource = await Item.findOne({ '_id': req.body.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.resType === "venue") {
        resource = await Venue.findOne({ '_id': req.body.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.resType === "manpower") {
        resource = await Manpower.findOne({ '_id': req.body.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!resource)
    return res.status(500).json({
        status: 'error',
        msg: 'Such item resource not found!',
        data: {}
    });
    
    if(resource.status != "active")
    return res.status(500).json({
        status: 'error',
        msg: 'You cannot request for this resource!',
        data: {}
    });

    const project = await Project.findOne({ '_id': req.body.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!project)
    return res.status(500).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    if(project.status != "ongoing")
    return res.status(500).json({
        status: 'error',
        msg: 'This project is not ongoing!',
        data: {}
    });

    var valid = false;

    if(project.host != req.body.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.body.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.body.id) valid = true;

    if(!valid)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to edit this project!',
        data: {}
    });

    const resourceneed = new ResourceNeed({
        title: resource.title,
        desc: "",
        type: req.body.resType,
        total: 0,
        completion: 0,
        projectId: project.id,
        code: theRequester.username+"-"+uid(),
        status: "progress",
        pendingSum: 0,
        receivedSum: 0
    });

    var theResourceNeed;

    await resourceneed.save(resourceneed)
    .then(data => {
        // console.log(data)
        theResourceNeed = data;
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });


    const resourcereq = new ResourceReq({
        projectId: project.id,
        needId: theResourceNeed.id,
        resourceId: req.body.resourceId,
        resType: req.body.resType,
        status:"pending",
        desc: req.body.desc
    })

    resourcereq.save(resourcereq)
    .then(data => {
        var action = "Account requested a resource (auto): "+resource.title+" ("+resource.id+", "+req.body.resType+")"
        action += " for project: "+project.title+" ("+project.id+","+project.code+")"

        Helper.createAuditLog(action,req.type,req.id)

        action = "Project requested a resource (auto): "+ resource.title +" ("+resource.id+", "+req.body.resType+")"
    
        Helper.createAuditLog(action,"project",project.id)

        Helper.createNotification("Resource Request", "Resource: "+resource.title+" has been requested.", resource.owner, resource.ownerType)

        return res.status(200).json({
            status: 'success',
            msg: 'Resource request successfully created',
            data: { resourcereq: data, resourceneed: theResourceNeed }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.useKnowledgeResource = async function (req, res) {
    var theRequester    

    if (req.body.type === "user") {
        theRequester = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theRequester = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theRequester) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    var resource;

    resource = await Knowledge.findOne({ '_id': req.body.resourceId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });    

    if(!resource)
    return res.status(500).json({
        status: 'error',
        msg: 'Such item resource not found!',
        data: {}
    });
    
    if(resource.status != "active")
    return res.status(500).json({
        status: 'error',
        msg: 'You cannot use this resource!',
        data: {}
    });

    const resourceneed = await ResourceNeed.findOne({ '_id': req.body.needId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!resourceneed)
    return res.status(500).json({
        status: 'error',
        msg: 'Such knowledge resource need not found!',
        data: {}
    });

    if(resourceneed.type != "knowledge")
    return res.status(500).json({
        status: 'error',
        msg: 'Type mismatch! Resource need type and the resource type are different',
        data: {}
    });

    if(resourceneed.status != "progress")
    return res.status(500).json({
        status: 'error',
        msg: 'Your resource need status is no longer in progress',
        data: {}
    });

    const project = await Project.findOne({ '_id': resourceneed.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!project)
    return res.status(500).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    if(project.status != "ongoing")
    return res.status(500).json({
        status: 'error',
        msg: 'This project is not ongoing!',
        data: {}
    });

    if(project.host != req.body.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.body.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.body.id) valid = true;

    if(!valid)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to edit this project!',
        data: {}
    });

    // var temp = await ResourceReq.findOne({ 'needId': resourceneed.id, "resourceId": resource.id, "resType": "knowledge", "status":"completed" }, function (err) {
    //     if (err)
    //     return res.status(500).json({
    //         status: 'error',
    //         msg: 'Something went wrong! '+err,
    //         data: {}
    //     });
    // });

    // if(temp)
    // return res.status(500).json({
    //     status: 'error',
    //     msg: 'Such knowledge resource use have been created! ',
    //     data: {}
    // }); 

    const resourcereq = new ResourceReq({
        projectId: project.id,
        needId: req.body.needId,
        resourceId: req.body.resourceId,
        resType: "knowledge",
        status:"completed",
        desc: req.body.desc
    })

    var contributions = []

    await resourcereq.save(resourcereq)
    .then(data => {

        for(var i = 0; i < resource.owner.length; i++) {
            const contribution = new Contribution({
                projectId: project.id,
                needId: resourceneed.id,
                requestId: data.id,
                requestType: "resource",
                resType: "knowledge",
                rating: 1,
                contributor: resource.owner[i].theId,
                contributorType: resource.owner[i].ownerType,
                status: 'active'
            });

            contribution.save().catch(err => {
                console.log("error: "+err.message)
            })
            contributions.push(contribution)

            Helper.createNotification("Knowledge Used", "Resource: "+resource.title+" has been used.", resource.owner[i].theId, resource.owner[i].ownerType)
        }

        var action = "Account use a knowledge resource: "+resource.title+" ("+resource.id+", "+"knowledge"+")"
        action += " for project: "+project.title+" ("+project.id+","+project.code+")"

        Helper.createAuditLog(action,req.type,req.id)

        action = "Project use a knowledge resource: "+ resource.title +" ("+resource.id+", "+"knowledge"+")"
    
        Helper.createAuditLog(action,"project",project.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Knowledge resource successfully used',
            data: { resourcereq: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    for(var j = 0; j < contributions.length; j++) {
        useKnowledgeEmail(contributions[j], project.code)
        addProjectIds(contributions[j].projectId, contributions[j].contributor, contributions[j].contributorType)
    }

}

exports.useAutoKnowledgeResource = async function (req, res) {
    var theRequester    

    if (req.body.type === "user") {
        theRequester = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theRequester = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theRequester) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    var resource;

    resource = await Knowledge.findOne({ '_id': req.body.resourceId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });    

    if(!resource)
    return res.status(500).json({
        status: 'error',
        msg: 'Such knowledge resource not found!',
        data: {}
    });
    
    if(resource.status != "active")
    return res.status(500).json({
        status: 'error',
        msg: 'You cannot use this resource!',
        data: {}
    });

    const project = await Project.findOne({ '_id': req.body.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!project)
    return res.status(500).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    if(project.status != "ongoing")
    return res.status(500).json({
        status: 'error',
        msg: 'This project is not ongoing!',
        data: {}
    });

    if(project.host != req.body.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.body.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.body.id) valid = true;

    if(!valid)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to edit this project!',
        data: {}
    });

    const resourceneed = new ResourceNeed({
        title: resource.title,
        desc: "",
        type: "knowledge",
        total: 0,
        completion: 0,
        projectId: project.id,
        code: theRequester.username+"-"+uid(),
        status: "progress",
        pendingSum: 0,
        receivedSum: 0
    });

    var theResourceNeed;

    await resourceneed.save(resourceneed)
    .then(data => {
        theResourceNeed = data;
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    const resourcereq = new ResourceReq({
        projectId: project.id,
        needId: theResourceNeed.id,
        resourceId: req.body.resourceId,
        resType: "knowledge",
        status:"completed",
        desc: req.body.desc
    })

    var contributions = []

    await resourcereq.save(resourcereq)
    .then(data => {

        for(var i = 0; i < resource.owner.length; i++) {
            const contribution = new Contribution({
                projectId: project.id,
                needId: theResourceNeed.id,
                requestId: data.id,
                requestType: "resource",
                resType: "knowledge",
                rating: 1,
                contributor: resource.owner[i].theId,
                contributorType: resource.owner[i].ownerType,
                status: 'active'
            });

            contribution.save().catch(err => {
                console.log("error: "+err.message)
            })
            contributions.push(contribution)
            
            Helper.createNotification("Knowledge Used", "Resource: "+resource.title+" has been used.", resource.owner[i].theId, resource.owner[i].ownerType)

        }

        var action = "Account use a knowledge resource (auto): "+resource.title+" ("+resource.id+", "+"knowledge"+")"
        action += " for project: "+project.title+" ("+project.id+","+project.code+")"

        Helper.createAuditLog(action,req.type,req.id)

        action = "Project use a knowledge resource(auto): "+ resource.title +" ("+resource.id+", "+"knowledge"+")"
    
        Helper.createAuditLog(action,"project",project.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Knowledge resource successfully used',
            data: { resourcereq: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    for(var j = 0; j < contributions.length; j++) {
        useKnowledgeEmail(contributions[j], project.code)
        addProjectIds(contributions[j].projectId, contributions[j].contributor, contributions[j].contributorType)
    }

}

async function useKnowledgeEmail(contribution, projectCode) {

    var target;
    if(contribution.contributorType === "user") {
        target= await User.findOne({ '_id': contribution.contributor, function (err) {
            if (err) console.log("Error: "+err.message)
        }});

    } else if (contribution.contributorType === "institution") {
        target= await Institution.findOne({ '_id': contribution.contributor, function (err) {
            if (err) console.log("Error: "+err.message)
        }});
    }

    if(!target) {
        console.log("target account not found")
        return;
    }

    let subject = 'KoCoSD Knowledge Resource Contribution'
    let theMessage = `
        <h1>Congratulations! A project has used your knowledge resource.</h1>
        <p>The project code ${projectCode}<p>
        <p>If there is any discrepancy, please contact our admin to resolve it.</p><br>
    `

    Helper.sendEmail(target.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })
}

exports.getManpowerList = async function (req, res) {    
    const manpowers = await Manpower.find({ 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!manpowers) 
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    var theList = []

    for(var i = 0; i < manpowers.length; i++) {
        var manpowerResource = {
            id:"",
            title: "",
            desc: "",
            owner: "",
            status: "",
            country: "",
            ownerType: "",
            ownerImg: "",
            ownerName: "",
            ownerUsername: "",
            createdAt:"",
            updatedAt:""
        }

        manpowerResource.id = manpowers[i].id
        manpowerResource.title = manpowers[i].title
        manpowerResource.desc = manpowers[i].desc
        manpowerResource.owner = manpowers[i].owner
        manpowerResource.status = manpowers[i].status
        manpowerResource.country = manpowers[i].country
        manpowerResource.ownerType = manpowers[i].ownerType
        manpowerResource.createdAt = manpowers[i].createdAt
        manpowerResource.updatedAt = manpowers[i].updatedAt


        await getOwnerInfo(manpowerResource)

        theList.push(manpowerResource)
    }

    theList.reverse()

    return res.status(200).json({
        status: 'success',
        msg: 'Manpower resource list successfully retrieved',
        data: { manpowers: theList }
    });
}

exports.getItemList = async function (req, res) {    
    const items = await Item.find({ 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!items) 
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    var theList = []

    for(var i = 0; i < items.length; i++) {
        var resourceItem = {
            id:"",
            title: "",
            desc: "",
            owner: "",
            status: "",
            country: "",
            imgPath: "",
            ownerType: "",
            ownerImg: "",
            ownerName: "",
            ownerUsername: "",
            createdAt:"",
            updatedAt:""
        }

        resourceItem.id = items[i].id
        resourceItem.title = items[i].title
        resourceItem.desc = items[i].desc
        resourceItem.owner = items[i].owner
        resourceItem.status = items[i].status
        resourceItem.country = items[i].country
        resourceItem.ownerType = items[i].ownerType
        resourceItem.imgPath = items[i].imgPath
        resourceItem.createdAt = items[i].createdAt
        resourceItem.updatedAt = items[i].updatedAt

        await getOwnerInfo(resourceItem)

        theList.push(resourceItem)
    }

    theList.reverse()

    return res.status(200).json({
        status: 'success',
        msg: 'Item resource list successfully retrieved',
        data: { items: theList }
    });
}

exports.getVenueList = async function (req, res) {    
    const venues = await Venue.find({ 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!venues) 
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    var theList = []

    for(var i = 0; i < venues.length; i++) {
        var resourceItem = {
            id:"",
            title: "",
            desc: "",
            owner: "",
            status: "",
            country: "",
            imgPath: [],
            ownerType: "",
            ownerImg: "",
            ownerName: "",
            ownerUsername: "",
            createdAt:"",
            updatedAt:""
        }

        resourceItem.id = venues[i].id
        resourceItem.title = venues[i].title
        resourceItem.desc = venues[i].desc
        resourceItem.owner = venues[i].owner
        resourceItem.status = venues[i].status
        resourceItem.country = venues[i].country
        resourceItem.ownerType = venues[i].ownerType
        resourceItem.imgPath = venues[i].imgPath
        resourceItem.createdAt = venues[i].createdAt
        resourceItem.updatedAt = venues[i].updatedAt

        await getOwnerInfo(resourceItem)

        theList.push(resourceItem)
    }

    theList.reverse()
    return res.status(200).json({
        status: 'success',
        msg: 'Venue resource list successfully retrieved',
        data: { venues: theList }
    });
}

exports.getKnowledgeList = async function (req, res) {    
    const knowledges = await Knowledge.find({ 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!knowledges) 
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    var theList = []

    for(var i = 0; i < knowledges.length; i++) {
        var resourceItem = {
            id:"",
            title: "",
            desc: "",
            owner: "",
            status: "",
            country: "",
            imgPath: [],
            ownerType: "",
            ownerImg: "",
            ownerName: "",
            ownerUsername: "",
            createdAt:"",
            updatedAt:"",
            knowType:"",
            link:"",
            patentNum:"",
            expiry:"",
            issn:"",
            doi:"",
            issueDate:""
        }

        resourceItem.id = knowledges[i].id
        resourceItem.title = knowledges[i].title
        resourceItem.desc = knowledges[i].desc
        resourceItem.owner = knowledges[i].owner[0].theId
        resourceItem.status = knowledges[i].status
        resourceItem.country = knowledges[i].country
        resourceItem.ownerType = knowledges[i].owner[0].ownerType
        resourceItem.imgPath = knowledges[i].imgPath
        resourceItem.createdAt = knowledges[i].createdAt
        resourceItem.updatedAt = knowledges[i].updatedAt
        resourceItem.knowType = knowledges[i].knowType
        resourceItem.link = knowledges[i].link
        resourceItem.patentNum = knowledges[i].patentNum
        resourceItem.expiry = knowledges[i].expiry
        resourceItem.issn = knowledges[i].issn
        resourceItem.doi = knowledges[i].doi
        resourceItem.issueDate = knowledges[i].issueDate
        
        await getOwnerInfo(resourceItem)

        theList.push(resourceItem)
    }

    theList.reverse()
    return res.status(200).json({
        status: 'success',
        msg: 'Knowledge resource list successfully retrieved',
        data: { knowledges: theList }
    });
}

exports.getResourceSuggestion = async function (req, res) {    
    const resourcneed = await ResourceNeed.findOne({ '_id': req.query.needId, 'status': 'progress' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!resourcneed) 
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving resourceneed!',
        data: {}
    });

    var needMap = new Map();
    var titleElements = resourcneed.title.toLowerCase().split(" ");

    for(var i = 0; i < titleElements.length; i++) {
        needMap.set(titleElements[i],1)
    }

    var resources = [];

    if(resourcneed.type === "item") {
        resources = await Item.find({ 'status': 'active' }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });

    } else if(resourcneed.type === "venue") {
        resources = await Venue.find({ 'status': 'active' }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if(resourcneed.type === "knowledge") {
        resources = await Knowledge.find({ 'status': 'active' }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if(resourcneed.type === "manpower") {
        resources = await Manpower.find({ 'status': 'active' }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }

    var theList = []

    for(var i = 0; i < resources.length; i++) {
        var suggestedResource = {
            id:"",
            title: "",
            desc: "",
            owner: "",
            status: "",
            country: "",
            ownerType: "",
            ownerImg: "",
            ownerName: "",
            ownerUsername: "",
            createdAt:"",
            updatedAt:"",
            matchPoint: 0
        }
        var resourceTitle = resources[i].title.toLowerCase().split(" ")

        suggestedResource.id = resources[i].id
        suggestedResource.title = resources[i].title
        suggestedResource.desc = resources[i].desc
        suggestedResource.owner = resources[i].owner
        suggestedResource.status = resources[i].status
        suggestedResource.country = resources[i].country
        suggestedResource.ownerType = resources[i].ownerType
        suggestedResource.createdAt = resources[i].createdAt
        suggestedResource.updatedAt = resources[i].updatedAt

        for(var j = 0; j < resourceTitle.length; j++) {
            if(needMap.get(resourceTitle[j])) suggestedResource.matchPoint += 10;
        }

        if(suggestedResource.matchPoint < 1) continue

        await getOwnerInfo(suggestedResource)
    
        theList.push(suggestedResource)
    }

    theList.reverse()
    theList.sort(function(a, b){return b.matchPoint - a.matchPoint})

    return res.status(200).json({
        status: 'success',
        msg: 'Suggested resource list successfully retrieved',
        data: { suggestedResources: theList }
    });
}

exports.getResourceNeedSuggestion = async function (req, res){
    var resource;

    if(req.query.resourceType === "item") {
        resource = await Item.findOne({ '_id': req.query.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });

    } else if(req.query.resourceType === "venue") {
        resource = await Venue.findOne({ '_id': req.query.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if(req.query.resourceType === "knowledge") {
        resource = await Knowledge.findOne({ '_id': req.query.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if(req.query.resourceType === "manpower") {
        resource = await Manpower.findOne({ '_id': req.query.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }

    if(!resource)
    return res.status(500).json({
        status: 'error',
        msg: 'Such resource not found!',
        data: {}
    });

    var resourceMap = new Map();
    var titleElements = resource.title.toLowerCase().split(" ");
    for(var i = 0; i < titleElements.length; i++) {
        resourceMap.set(titleElements[i],1)
    }
        
    const resourceneeds = await ResourceNeed.find({ 'type':req.query.resourceType, 'status': 'progress' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'An error occur when retrieving resource needs!',
            data: {}
        });
    });

    if(!resourceneeds)
    return res.status(500).json({
        status: 'error',
        msg: 'There was an issue retrieving resource needs!',
        data: {}
    });

    var theList = []

    for(var i = 0; i < resourceneeds.length; i++) {
        var suggestedResourceNeed = {
            id:"",
            title: "",
            desc: "",
            status: "",
            type: "",
            completion: 0,
            projectId: "",
            code: "",
            projectTitle: "",
            country: "",
            projectImg: "",
            projectSDGs: "",
            createdAt:"",
            updatedAt:"",
            matchPoint: 0
        }

        suggestedResourceNeed.id = resourceneeds[i].id
        suggestedResourceNeed.title = resourceneeds[i].title
        suggestedResourceNeed.desc = resourceneeds[i].desc
        suggestedResourceNeed.status = resourceneeds[i].status
        suggestedResourceNeed.type = resourceneeds[i].type
        suggestedResourceNeed.completion = resourceneeds[i].completion
        suggestedResourceNeed.projectId = resourceneeds[i].projectId
        suggestedResourceNeed.code = resourceneeds[i].code
        suggestedResourceNeed.createdAt = resourceneeds[i].createdAt
        suggestedResourceNeed.updatedAt = resourceneeds[i].updatedAt

        await getProjectInfo(suggestedResourceNeed)
        if(suggestedResourceNeed.projectTitle === "") continue

        var needTitle = suggestedResourceNeed.title.toLowerCase().split(" ")
        for(var j = 0; j < needTitle.length; j++ ) {
            if(resourceMap.get(needTitle[j])){ 
                suggestedResourceNeed.matchPoint += 10;
            }
        }

        if(suggestedResourceNeed.matchPoint < 1) continue
        if(resource.country === suggestedResourceNeed.country) suggestedResourceNeed.matchPoint += 5;
        
        theList.push(suggestedResourceNeed)     
            
    }

    theList.reverse()
    theList.sort(function(a, b){return b.matchPoint - a.matchPoint})

    return res.status(200).json({
        status: 'success',
        msg: 'Resource need suggestion successfully retrieved!',
        data: { resourceneedSuggestion: theList }
    });
}

async function runDiscoverWeekly () {
    const users = await User.find({ 'status': 'active' }, function (err) {
        if (err) console.log(err)
    });

    for(var i = 0; i < users.length; i++) {
        suggestDiscoverWeekly(users[i],"user")
    }

    const institutions = await Institution.find({ 'status': 'active' }, function (err) {
        if (err) console.log(err)
    });

    for(var i = 0; i < institutions.length; i++) {
        suggestDiscoverWeekly(institutions[i],"institution")
    }
}

async function suggestDiscoverWeekly(account, accountType) {

    var len = account.projects.length - 1
    var titleMap = new Map()

    for(var i = len; i > 0 && i > len-5; i--) {
        var project = {
            projectId: "",
            projectTitle: ""
        }
        project.projectId = account.projects[i]

        await getProjectInfo(project);
        if(project.projectTitle === "") continue;

        var titleSplit = project.projectTitle.toLowerCase().split(" ")
        for(var j = 0; j < titleSplit.length; j++) {
            titleMap.set(titleSplit[j],1)
        }
    }

    const projects = await Project.find({ 'status': 'ongoing' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    var theList = []

    for(var i = 0; i < projects.length; i++) {
        var projectItem = {
            projectId: "",
            matchPoint: 0
        }

        projectItem.projectId = projects[i].id
        var theTitles = projects[i].title.toLowerCase().split(" ")
        for(var j = 0; j < theTitles.length; j++) {
            if(titleMap.get(theTitles[j])) projectItem.matchPoint += 10
        }

        if(projects[i].country === account.country) projectItem.matchPoint += 10

        if(!account.projects.includes(projectItem.projectId))
            theList.push(projectItem)
    }
    
    theList.reverse()
    theList.sort(function(a, b){return b.matchPoint - a.matchPoint})
    

    var theProjectIds = []

    var listLen = theList.length
    
    for(var i = 0 ; i < 5 && i < listLen; i++ ) {
        theProjectIds.push(theList[i].projectId)
    }

    const discoverweekly = await DiscoverWeekly.findOne({ 'accountId': account.id, 'accountType':accountType }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(discoverweekly) {
        discoverweekly.projectIds = theProjectIds
        await discoverweekly.save().catch(err => {
            console.log(err)
        });
    } else {
        const newDW = new DiscoverWeekly({
            projectIds: theProjectIds,
            accountId: account.id,
            accountType: accountType
        })

        await newDW.save().catch(err => {
            console.log(err)
        });
    }
}

exports.triggerDiscoverWeekly = async function (req, res) {    
    runDiscoverWeekly()

    return res.status(200).json({
        status: 'success',
        msg: 'Discover Weekly successfully manually triggered',
        data: { }
    });
}

exports.testEndpoint = async function (req, res) {    
    var actor;
    if(req.type === "user") {
        actor = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }else if (req.type === "institution") {
        actor = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }

    await suggestDiscoverWeekly(actor,req.type)

    return res.status(200).json({
        status: 'success',
        msg: 'Test endpoint successfully retrieved',
        data: { }
    });
}

exports.getDiscoverWeekly = async function (req, res) {    
    var actor;
    if(req.type === "user") {
        actor = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }else if (req.type === "institution") {
        actor = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }

    if(!actor)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    var theList = []

    discoverWeekly = await DiscoverWeekly.findOne({ 'accountId': req.id, 'accountType': req.type }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!discoverWeekly)
    return res.status(500).json({
        status: 'error',
        msg: 'There is no discover weekly projects yet!',
        data: { }
    });

    var projectIds = discoverWeekly.projectIds;
    for(var i = 0; i < projectIds.length; i++) {
        var projectItem = {
            "id":"",
            "title": "",
            "desc": "",
            "host": "",
            "hostType": "",
            "status": "",
            "rating": "",
            "country": "",
            "code": "",
            "imgPath":"",
            "admins":[],
            "SDGs":[],
            "hostImg":"",
            "hostName":"",
            "hostUsername":"",
            "createdAt":"",
            "updatedAt":""
        }

        projectItem.id = projectIds[i]
        await getDiscoverProjectInfo(projectItem)
        if(projectItem.title === "") continue

        await getHostInfo(projectItem)
        if(projectItem.hostName === "") continue

        theList.push(projectItem)
    }
    
    return res.status(200).json({
        status: 'success',
        msg: 'Discover weekly projects successfully retrieved',
        data: { discoverweekly: theList }
    });
}

exports.getProjectList = async function (req, res) {    
    const projects = await Project.find({ 'status': 'ongoing' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!projects) 
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    var theList = []

    for(var i = 0; i < projects.length; i++) {
        var projectItem = {
            id:"",
            title: "",
            desc: "",
            owner: "",
            status: "",
            country: "",
            imgPath: "",
            ownerType: "",
            ownerImg: "",
            ownerName: "",
            ownerUsername: "",
            rating:"",
            code:"",
            SDGs:"",
            createdAt:"",
            updatedAt:""
        }

        projectItem.id = projects[i].id
        projectItem.title = projects[i].title
        projectItem.desc = projects[i].desc
        projectItem.owner = projects[i].host
        projectItem.status = projects[i].status
        projectItem.country = projects[i].country
        projectItem.ownerType = projects[i].hostType
        projectItem.imgPath = projects[i].imgPath
        projectItem.rating = projects[i].rating
        projectItem.SDGs = projects[i].SDGs
        projectItem.code = projects[i].code
        projectItem.createdAt = projects[i].createdAt
        projectItem.updatedAt = projects[i].updatedAt

        await getOwnerInfo(projectItem)

        theList.push(projectItem)
    }

    theList.reverse()

    return res.status(200).json({
        status: 'success',
        msg: 'Project list successfully retrieved',
        data: { projects: theList }
    });
}

exports.getProjectListFiltered = async function (req, res) {    
    var theFilter = req.body.filterSDGs

    if(!theFilter || !theFilter.length)
    return res.status(500).json({
        status: 'error',
        msg: 'The list of SDGs filter is invalid!',
        data: {}
    });

    const projects = await Project.find({ 'status': 'ongoing' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!projects) 
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    var theList = []

    for(var i = 0; i < projects.length; i++) {
        var projectItem = {
            id:"",
            title: "",
            desc: "",
            owner: "",
            status: "",
            country: "",
            imgPath: "",
            ownerType: "",
            ownerImg: "",
            ownerName: "",
            ownerUsername: "",
            rating:"",
            code:"",
            SDGs:"",
            matchPoint:0,
            createdAt:"",
            updatedAt:""
        }

        projectItem.id = projects[i].id
        projectItem.title = projects[i].title
        projectItem.desc = projects[i].desc
        projectItem.owner = projects[i].host
        projectItem.status = projects[i].status
        projectItem.country = projects[i].country
        projectItem.ownerType = projects[i].hostType
        projectItem.imgPath = projects[i].imgPath
        projectItem.rating = projects[i].rating
        projectItem.SDGs = projects[i].SDGs
        projectItem.code = projects[i].code
        projectItem.createdAt = projects[i].createdAt
        projectItem.updatedAt = projects[i].updatedAt

        await getOwnerInfo(projectItem)

        for(var j = 0; j < theFilter.length; j++) {
            if(projectItem.SDGs.includes(theFilter[j]))
                projectItem.matchPoint += 10
        }

        if(projectItem.matchPoint>0) theList.push(projectItem)
    }

    theList.reverse()
    theList.sort(function(a, b){return b.matchPoint - a.matchPoint})

    return res.status(200).json({
        status: 'success',
        msg: 'Project filtered list successfully retrieved',
        data: { projects: theList }
    });
}

exports.getFundingNeeds = async function (req, res) {    
    const fundingneeds = await ResourceNeed.find({ 'status': 'progress', 'type':'money' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    var theList = []

    for(var i = 0; i < fundingneeds.length; i++) {
        var fundingItem = {
            id:"",
            title: "",
            desc: "",
            owner: "",
            status: "",
            country: "",
            imgPath: "",
            ownerType: "",
            ownerImg: "",
            ownerName: "",
            ownerUsername: "",
            rating:"",
            code:"",
            SDGs:"",
            needId:"",
            fundingTitle: "",
            fundingDesc: "",
            fundingStatus: "",
            total:0,
            pendingSum:0,
            receivedSum:0,
            "createdAt":"",
            "updatedAt":""
        }
        
        fundingItem.needId = fundingneeds[i].id
        fundingItem.fundingTitle = fundingneeds[i].title
        fundingItem.fundingDesc = fundingneeds[i].desc
        fundingItem.fundingStatus = fundingneeds[i].status
        fundingItem.total = fundingneeds[i].total
        fundingItem.pendingSum = fundingneeds[i].pendingSum
        fundingItem.receivedSum = fundingneeds[i].receivedSum
        fundingItem.id = fundingneeds[i].projectId
        fundingItem.createdAt = fundingneeds[i].createdAt
        fundingItem.updatedAt = fundingneeds[i].updatedAt


        const project = await Project.findOne({ '_id': fundingItem.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });

        if(!project) continue;
        if(project.status != 'ongoing') continue

        fundingItem.title = project.title
        fundingItem.desc = project.desc
        fundingItem.owner = project.owner
        fundingItem.status = project.status
        fundingItem.country = project.country
        fundingItem.imgPath = project.imgPath                        
        fundingItem.desc = project.desc
        fundingItem.owner = project.host
        fundingItem.ownerType = project.hostType
        fundingItem.rating = project.rating
        fundingItem.code = project.code
        fundingItem.SDGs = project.SDGs
                
        await getOwnerInfo(fundingItem)

        theList.push(fundingItem)
    }
    
    theList.reverse()

    return res.status(200).json({
        status: 'success',
        msg: 'Funding need list successfully retrieved',
        data: { fundings: theList }
    });
}

exports.getFilteredFundingNeeds = async function (req, res) {    
    var theFilter = req.body.filterSDGs

    if(!theFilter.length)
    return res.status(500).json({
        status: 'error',
        msg: 'The list of SDGs filter is invalid!',
        data: {}
    });
    
    const fundingneeds = await ResourceNeed.find({ 'status': 'progress', 'type':'money' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    var theList = []

    for(var i = 0; i < fundingneeds.length; i++) {
        var fundingItem = {
            id:"",
            title: "",
            desc: "",
            owner: "",
            status: "",
            country: "",
            imgPath: "",
            ownerType: "",
            ownerImg: "",
            ownerName: "",
            ownerUsername: "",
            rating:"",
            code:"",
            SDGs:"",
            needId:"",
            fundingTitle: "",
            fundingDesc: "",
            fundingStatus: "",
            total:0,
            pendingSum:0,
            receivedSum:0,
            matchPoint:0,
            "createdAt":"",
            "updatedAt":""
        }
        
        fundingItem.needId = fundingneeds[i].id
        fundingItem.fundingTitle = fundingneeds[i].title
        fundingItem.fundingDesc = fundingneeds[i].desc
        fundingItem.fundingStatus = fundingneeds[i].status
        fundingItem.total = fundingneeds[i].total
        fundingItem.pendingSum = fundingneeds[i].pendingSum
        fundingItem.receivedSum = fundingneeds[i].receivedSum
        fundingItem.id = fundingneeds[i].projectId
        fundingItem.createdAt = fundingneeds[i].createdAt
        fundingItem.updatedAt = fundingneeds[i].updatedAt


        const project = await Project.findOne({ '_id': fundingItem.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });

        if(!project) continue;
        if(project.status != 'ongoing') continue

        fundingItem.title = project.title
        fundingItem.desc = project.desc
        fundingItem.owner = project.owner
        fundingItem.status = project.status
        fundingItem.country = project.country
        fundingItem.imgPath = project.imgPath                        
        fundingItem.desc = project.desc
        fundingItem.owner = project.host
        fundingItem.ownerType = project.hostType
        fundingItem.rating = project.rating
        fundingItem.code = project.code
        fundingItem.SDGs = project.SDGs
                
        await getOwnerInfo(fundingItem)
        for(var j = 0; j < theFilter.length; j++) {
            if(fundingItem.SDGs.includes(theFilter[j]))
                fundingItem.matchPoint += 10
        }

        if(fundingItem.matchPoint>0) theList.push(fundingItem)
    }
    

    return res.status(200).json({
        status: 'success',
        msg: 'Funding need list successfully retrieved',
        data: { fundings: theList }
    });
}

exports.reqProject = async function (req, res) {
    var theRequester    

    if (req.body.type === "user") {
        theRequester = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theRequester = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theRequester) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    var resource;

    if(req.body.resType === "item") {
        resource = await Item.findOne({ '_id': req.body.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });

        if(resource.owner!=req.body.id)
        return res.status(500).json({
            status: 'error',
            msg: 'You are not authorized to contribute this resource! ',
            data: {}
        });
    } else if (req.body.resType === "venue") {
        resource = await Venue.findOne({ '_id': req.body.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });

        if(resource.owner!=req.body.id)
        return res.status(500).json({
            status: 'error',
            msg: 'You are not authorized to contribute this resource! ',
            data: {}
        });
    } else if (req.body.resType === "manpower") {
        resource = await Manpower.findOne({ '_id': req.body.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });

        if(resource.owner!=req.body.id)
        return res.status(500).json({
            status: 'error',
            msg: 'You are not authorized to contribute this resource! ',
            data: {}
        });
    } else if (req.body.resType === "knowledge") {
        resource = await Knowledge.findOne({ '_id': req.body.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });

        var owners = resource.owner;
        let valid = false

        for(var x = 0 ; x < owners.length; x++) {
            if(owners[x].theId === req.body.id) {
                valid = true
                break
            }
        }

        if(!valid)
        return res.status(500).json({
            status: 'error',
            msg: 'You are not authorized to contribute this resource! ',
            data: {}
        });
    }
    

    if(!resource)
    return res.status(500).json({
        status: 'error',
        msg: 'Such item resource not found!',
        data: {}
    });
    
    if(resource.status != "active")
    return res.status(500).json({
        status: 'error',
        msg: 'You cannot request for this resource!',
        data: {}
    });

    const resourceneed = await ResourceNeed.findOne({ '_id': req.body.needId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!resourceneed)
    return res.status(500).json({
        status: 'error',
        msg: 'Such item resource need not found!',
        data: {}
    });

    if(resourceneed.type != req.body.resType)
    return res.status(500).json({
        status: 'error',
        msg: 'Type mismatch! Resource need type and the resource type are different',
        data: {}
    });

    if(resourceneed.status != "progress")
    return res.status(500).json({
        status: 'error',
        msg: 'Your resource need status is no longer in progress',
        data: {}
    });

    const project = await Project.findOne({ '_id': resourceneed.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!project)
    return res.status(500).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    if(project.status != "ongoing")
    return res.status(500).json({
        status: 'error',
        msg: 'This project is not ongoing!',
        data: {}
    });

    var temp = await ProjectReq.findOne({ 'ownerId':req.body.id, 'ownerType':req.body.type, 'needId': resourceneed.id, "resourceId": resource.id, "resType": req.body.resType, "status":"pending" }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(temp)
    return res.status(500).json({
        status: 'error',
        msg: 'Such project request have been created! ',
        data: {}
    }); 

    const projectreq = new ProjectReq({
        projectId: project.id,
        needId: req.body.needId,
        resourceId: req.body.resourceId,
        resType: req.body.resType,
        status: "pending",
        ownerId: req.body.id,
        ownerType: req.body.type,
        desc: req.body.desc
    })

    projectreq.save(projectreq)
    .then(data => {
        var action = "Account request to contribute to project: "+project.title+" ("+project.id+", "+project.code+")"
        action += " for resourceneed: "+resourceneed.title+" ("+resourceneed.id+","+req.body.resType+") "
        action += " using resource: "+resource.title+" ("+resource.id+","+req.body.resType+")"

        Helper.createAuditLog(action,req.type,req.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Project request successfully created',
            data: { projectreq: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.contributeMoney = async function (req, res) {
    var theRequester    

    if (req.body.type === "user") {
        theRequester = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theRequester = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theRequester) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const resourceneed = await ResourceNeed.findOne({ '_id': req.body.needId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!resourceneed)
    return res.status(500).json({
        status: 'error',
        msg: 'Such money resource need not found!',
        data: {}
    });

    if(resourceneed.type != "money")
    return res.status(500).json({
        status: 'error',
        msg: 'Type mismatch! Resource need type is not money',
        data: {}
    });

    if(resourceneed.status != "progress")
    return res.status(500).json({
        status: 'error',
        msg: 'Your resource need status is no longer in progress',
        data: {}
    });

    const project = await Project.findOne({ '_id': resourceneed.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!project)
    return res.status(500).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    if(project.status != "ongoing")
    return res.status(500).json({
        status: 'error',
        msg: 'This project is not ongoing!',
        data: {}
    });

    var temp = await ProjectReq.findOne({ "ownerId":theRequester.id,'needId': resourceneed.id, "resType": "money", "status":"accepted" }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(temp)
    return res.status(500).json({
        status: 'error',
        msg: 'Such project request have been created! ',
        data: {}
    }); 

    if(req.body.moneySum <= 0 ) 
    return res.status(500).json({
        status: 'error',
        msg: 'The amount input is invalid! ',
        data: {}
    }); 

    if(req.body.moneySum + resourceneed.pendingSum + resourceneed.receivedSum > resourceneed.total)
    return res.status(500).json({
        status: 'error',
        msg: 'The amount input is too high! ',
        data: {}
    }); 

    const money = new Money({
        sum: req.body.moneySum,
        desc: req.body.desc,
        owner: req.id,
        status: "active",
        country: theRequester.country,
        ownerType: req.type
    });

    var moneyResId;
    await money.save().then(data => {
        moneyResId = data.id;
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    const projectreq = new ProjectReq({
        projectId: project.id,
        needId: req.body.needId,
        resourceId: moneyResId,
        resType: "money",
        status: "accepted",
        ownerId: req.body.id,
        ownerType: req.body.type,
        desc: req.body.desc,
        moneySum: req.body.moneySum
    })

    resourceneed.pendingSum = resourceneed.pendingSum + req.body.moneySum
    resourceneed.save();

    projectreq.save(projectreq)
    .then(data => {
        var action = "Account request to contribute money to project: "+project.title+" ("+project.id+", "+project.code+")"
        action += " for resourceneed: "+resourceneed.title+" ("+resourceneed.id+","+"money"+") "
        action += " amount: $"+req.body.moneySum+" ("+moneyResId+","+"money"+")"

        Helper.createAuditLog(action,req.type,req.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Money contribution request successfully created',
            data: { resourceneed: resourceneed, moneyreq: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

}

async function getOwnerInfo(resourceItem) {
    var owner;

    if(resourceItem.ownerType === "user") {
        owner = await User.findOne({ '_id': resourceItem.owner }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if (resourceItem.ownerType === 'institution') {
        owner = await Institution.findOne({ '_id': resourceItem.owner }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!owner) {
        console.log("a "+resourceItem.owner+" "+resourceItem.ownerType)
        console.log("error: (getHostInfo) Such account not found!")
        return
    }

    resourceItem.ownerImg = owner.ionicImg
    resourceItem.ownerName = owner.name
    resourceItem.ownerUsername = owner.username
    resourceItem.ownerIsVerified = owner.isVerified
}

exports.currProjects = async function (req, res, next) {

    var theRequester

    if(req.query.accountType === "user") {
        theRequester = await User.findOne({ '_id': req.query.accountId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue while retrieving account! '+err.message,
                data: {}
            });

        });
    } else if(req.query.accountType === "institution") {
        theRequester = await Institution.findOne({ '_id': req.query.accountId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue while retrieving account! '+err.message,
                data: {}
            });

        });
    }


    if(!theRequester) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });
    
    let projects = theRequester.projects;
    let currProjects = []
   
    for (var i = 0; i < projects.length; i++) {
        var project = await Project.findOne({ '_id': projects[i] }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue while retrieving a project! '+err.message,
                data: {}
            });
        });
        if(!project) {
            theRequester.projects.pull(projects[i]);
        } else if(project.status === 'ongoing') {
            let valid = false;

            if(project.host != req.query.accountId) {
                let admins = project.admins;
                for(var j = 0; j < admins.length; j++) {
                    if(req.query.accountId === admins[j]) {
                        valid = true;
                        break;
                    }
                }
            } else if (project.host=== req.query.accountId) valid = true;
            if(valid) currProjects.push(project)
        }
    }

    theRequester.save(theRequester)
    .then().catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });   

    currProjects.reverse()

    return res.status(200).json({
        status: 'success',
        msg: 'Current Account Projects successfully retrieved',
        data: { theProjects: currProjects }
    });
}

exports.getLater = async function (req, res) {    
    const itemIds = await Item.find({ 'status': 'active', 'owner':req.body.id, 'ownerType':req.body.type }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    }).distinct('_id');

    const venueIds = await Venue.find({ 'status': 'active', 'owner':req.body.id, 'ownerType':req.body.type }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    }).distinct('_id');

    const manpowerIds = await Manpower.find({ 'status': 'active', 'owner':req.body.id, 'ownerType':req.body.type }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    }).distinct('_id');

    var resIds = [];
    resIds = resIds.concat(itemIds)
    resIds = resIds.concat(venueIds)
    resIds = resIds.concat(manpowerIds)

    const projectReqs = await ProjectReq.find({ 'status': req.query.reqType, 'resourceId' : { $in: resIds} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    var theList = []

    for(var i = 0; i < projectReqs.length; i++) {
        var projectReqItem = {
            id:"",
            projectId: "",
            needId: "",
            resourceId: "",
            resType: "",
            status: "",
            cancelType: "",
            createdAt: "",
            ownerId: "",
            ownerType: "",
            desc: "",
            moneySum: 0,
            projectTitle: "",
            projectSDGs: "",
            needTitle: "",
            needDesc: "",
            resourceTitle: "",
            requesterName: "",
            requesterUsername: ""
        }

        projectReqItem.id = projectReqs[i].id
        projectReqItem.needId = projectReqs[i].needId
        projectReqItem.resourceId = projectReqs[i].resourceId
        projectReqItem.resType = projectReqs[i].resType
        projectReqItem.status = projectReqs[i].status
        projectReqItem.cancelType = projectReqs[i].cancelType
        projectReqItem.createdAt = projectReqs[i].createdAt
        projectReqItem.ownerId = projectReqs[i].ownerId
        projectReqItem.ownerType = projectReqs[i].ownerType
        projectReqItem.desc = projectReqs[i].desc
        projectReqItem.moneySum = projectReqs[i].moneySum
        
        
                
        
        
    }
/*
    for(var i = 0; i < fundingneeds.length; i++) {
        var fundingItem = {
            id:"",
            title: "",
            desc: "",
            owner: "",
            status: "",
            country: "",
            imgPath: "",
            ownerType: "",
            ownerImg: "",
            ownerName: "",
            ownerUsername: "",
            rating:"",
            code:"",
            SDGs:"",
            needId:"",
            fundingTitle: "",
            fundingDesc: "",
            fundingStatus: "",
            total:0,
            pendingSum:0,
            receivedSum:0
        }
        
        fundingItem.needId = fundingneeds[i].id
        fundingItem.fundingTitle = fundingneeds[i].title
        fundingItem.fundingDesc = fundingneeds[i].desc
        fundingItem.fundingStatus = fundingneeds[i].status
        fundingItem.total = fundingneeds[i].total
        fundingItem.pendingSum = fundingneeds[i].pendingSum
        fundingItem.receivedSum = fundingneeds[i].receivedSum
        fundingItem.id = fundingneeds[i].projectId

        const project = await Project.findOne({ '_id': fundingItem.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });

        if(!project) continue;
        if(project.status != 'ongoing') continue

        fundingItem.title = project.title
        fundingItem.desc = project.desc
        fundingItem.owner = project.owner
        fundingItem.status = project.status
        fundingItem.country = project.country
        fundingItem.imgPath = project.imgPath                        
        fundingItem.desc = project.desc
        fundingItem.owner = project.host
        fundingItem.ownerType = project.hostType
        fundingItem.rating = project.rating
        fundingItem.code = project.code
        fundingItem.SDGs = project.SDGs
                
        await getOwnerInfo(fundingItem)

        theList.push(fundingItem)
    }
    */

    return res.status(200).json({
        status: 'success',
        msg: 'Funding need list successfully retrieved',
        data: { fundings: theList }
    });
}

exports.getMyConsolidatedProjectReq = async function (req, res) {    
    
    const projectReqs = await ProjectReq.find({ 'status': req.query.reqStatus, 'ownerId':req.body.id, 'ownerType':req.body.type }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    var theList = []

    for(var i = 0; i < projectReqs.length; i++) {
        var projectReqItem = {
            id:"",
            projectId: "",
            needId: "",
            resourceId: "",
            resType: "",
            status: "",
            cancelType: "",
            createdAt: "",
            updatedAt:"",
            ownerId: "",
            ownerType: "",
            desc: "",
            moneySum: 0,
            projectTitle: "",
            projectSDGs: "",
            needTitle: "",
            needDesc: "",
            resourceTitle: "",
            requesterName: "",
            requesterUsername: "",
            requesterImg: ""
        }

        projectReqItem.id = projectReqs[i].id
        projectReqItem.projectId = projectReqs[i].projectId
        projectReqItem.needId = projectReqs[i].needId
        projectReqItem.resourceId = projectReqs[i].resourceId
        projectReqItem.resType = projectReqs[i].resType
        projectReqItem.status = projectReqs[i].status
        projectReqItem.cancelType = projectReqs[i].cancelType
        projectReqItem.createdAt = projectReqs[i].createdAt
        projectReqItem.ownerId = projectReqs[i].ownerId
        projectReqItem.ownerType = projectReqs[i].ownerType
        projectReqItem.desc = projectReqs[i].desc
        projectReqItem.moneySum = projectReqs[i].moneySum
        projectReqItem.updatedAt = projectReqs[i].updatedAt
        
        await getProjectInfo(projectReqItem)
        if(projectReqItem.projectTitle === "") continue
        
        await getNeedInfo(projectReqItem)
        if(projectReqItem.needTitle === "") continue
        
        await getResourceInfo(projectReqItem)
        if(projectReqItem.resourceTitle === "") continue
        
        await getAccountInfo(projectReqItem)
        if(projectReqItem.requesterName === "") continue

        theList.push(projectReqItem)
        
    }

    theList.reverse()

    return res.status(200).json({
        status: 'success',
        msg: 'My Submitted Project Request list successfully retrieved',
        data: { projectReqs: theList }
    });
}

exports.getResourceDetailProjectReq = async function (req, res) {    
    
    const projectReqs = await ProjectReq.find({ 'status': req.query.reqStatus, 'resourceId':req.query.resourceId ,'ownerId':req.body.id, 'ownerType':req.body.type }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    var theList = []

    for(var i = 0; i < projectReqs.length; i++) {
        var projectReqItem = {
            id:"",
            projectId: "",
            needId: "",
            resourceId: "",
            resType: "",
            status: "",
            cancelType: "",
            createdAt: "",
            ownerId: "",
            ownerType: "",
            desc: "",
            moneySum: 0,
            projectTitle: "",
            projectSDGs: "",
            needTitle: "",
            needDesc: "",
            resourceTitle: "",
            requesterName: "",
            requesterUsername: "",
            requesterImg: "",
            updatedAt:""
        }

        projectReqItem.id = projectReqs[i].id
        projectReqItem.projectId = projectReqs[i].projectId
        projectReqItem.needId = projectReqs[i].needId
        projectReqItem.resourceId = projectReqs[i].resourceId
        projectReqItem.resType = projectReqs[i].resType
        projectReqItem.status = projectReqs[i].status
        projectReqItem.cancelType = projectReqs[i].cancelType
        projectReqItem.createdAt = projectReqs[i].createdAt
        projectReqItem.updatedAt = projectReqs[i].updatedAt
        projectReqItem.ownerId = projectReqs[i].ownerId
        projectReqItem.ownerType = projectReqs[i].ownerType
        projectReqItem.desc = projectReqs[i].desc
        projectReqItem.moneySum = projectReqs[i].moneySum
        
        await getProjectInfo(projectReqItem)
        if(projectReqItem.projectTitle === "") continue
        
        await getNeedInfo(projectReqItem)
        if(projectReqItem.needTitle === "") continue
        
        await getResourceInfo(projectReqItem)
        if(projectReqItem.resourceTitle === "") continue
        
        await getAccountInfo(projectReqItem)
        if(projectReqItem.requesterName === "") continue

        theList.push(projectReqItem)
        
    }

    theList.reverse()

    return res.status(200).json({
        status: 'success',
        msg: 'My Resource Project Request list successfully retrieved',
        data: { resourceProjectReqs: theList }
    });
}

exports.getResourceDetailResourceReq = async function (req, res) {    
    
    const resourceReqs = await ResourceReq.find({ 'status': req.query.reqStatus, 'resourceId':req.query.resourceId, 'resType':req.query.resType }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    var theList = []

    for(var i = 0; i < resourceReqs.length; i++) {
        var resourceReqItem = {
            id:"",
            projectId: "",
            needId: "",
            resourceId: "",
            resType: "",
            status: "",
            cancelType: "",
            createdAt: "",
            desc: "",
            projectTitle: "",
            projectSDGs: "",
            needTitle: "",
            needDesc: "",
            resourceTitle: "",
            updatedAt:""
        }

        resourceReqItem.id = resourceReqs[i].id
        resourceReqItem.projectId = resourceReqs[i].projectId
        resourceReqItem.needId = resourceReqs[i].needId
        resourceReqItem.resourceId = resourceReqs[i].resourceId
        resourceReqItem.resType = resourceReqs[i].resType
        resourceReqItem.status = resourceReqs[i].status
        resourceReqItem.cancelType = resourceReqs[i].cancelType
        resourceReqItem.createdAt = resourceReqs[i].createdAt
        resourceReqItem.updatedAt = resourceReqs[i].updatedAt
        resourceReqItem.desc = resourceReqs[i].desc
        
        await getProjectInfo(resourceReqItem)
        if(resourceReqItem.projectTitle === "") continue
        
        await getNeedInfo(resourceReqItem)
        if(resourceReqItem.needTitle === "") continue
        
        await getResourceInfo(resourceReqItem)
        if(resourceReqItem.resourceTitle === "") continue
        
        
        theList.push(resourceReqItem)
        
    }

    theList.reverse()

    return res.status(200).json({
        status: 'success',
        msg: 'My Resource\'s Resource Request list successfully retrieved',
        data: { resourceResourceReqs: theList }
    });
}

exports.getProjectPageProjectReq = async function (req, res) {    
    
    const projectReqs = await ProjectReq.find({ 'status': req.query.reqStatus, 'projectId':req.query.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    var theList = []

    for(var i = 0; i < projectReqs.length; i++) {
        var projectReqItem = {
            id:"",
            projectId: "",
            needId: "",
            resourceId: "",
            resType: "",
            status: "",
            cancelType: "",
            createdAt: "",
            ownerId: "",
            ownerType: "",
            desc: "",
            moneySum: 0,
            projectTitle: "",
            projectSDGs: "",
            needTitle: "",
            needDesc: "",
            resourceTitle: "",
            requesterName: "",
            requesterUsername: "",
            requesterImg: "",
            createdAt:"",
            updatedAt:""
        }

        projectReqItem.id = projectReqs[i].id
        projectReqItem.projectId = projectReqs[i].projectId
        projectReqItem.needId = projectReqs[i].needId
        projectReqItem.resourceId = projectReqs[i].resourceId
        projectReqItem.resType = projectReqs[i].resType
        projectReqItem.status = projectReqs[i].status
        projectReqItem.cancelType = projectReqs[i].cancelType
        projectReqItem.createdAt = projectReqs[i].createdAt
        projectReqItem.ownerId = projectReqs[i].ownerId
        projectReqItem.ownerType = projectReqs[i].ownerType
        projectReqItem.desc = projectReqs[i].desc
        projectReqItem.moneySum = projectReqs[i].moneySum
        projectReqItem.createdAt = projectReqs[i].createdAt
        projectReqItem.updatedAt = projectReqs[i].updatedAt

        await getProjectInfo(projectReqItem)
        if(projectReqItem.projectTitle === "") continue
        
        await getNeedInfo(projectReqItem)
        if(projectReqItem.needTitle === "") continue
        
        await getResourceInfo(projectReqItem)
        if(projectReqItem.resourceTitle === "") continue
        
        await getAccountInfo(projectReqItem)
        if(projectReqItem.requesterName === "") continue

        theList.push(projectReqItem)
        
    }

    theList.reverse()

    return res.status(200).json({
        status: 'success',
        msg: 'Project Page Project Request list successfully retrieved',
        data: { projectPageProjectReqs: theList }
    });
}

exports.getProjectPageResourceReq = async function (req, res) {    
    
    const resourceReqs = await ResourceReq.find({ 'status': req.query.reqStatus, 'projectId':req.query.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    var theList = []

    for(var i = 0; i < resourceReqs.length; i++) {
        var resourceReqItem = {
            id:"",
            projectId: "",
            needId: "",
            resourceId: "",
            resType: "",
            status: "",
            cancelType: "",
            createdAt: "",
            desc: "",
            projectTitle: "",
            projectSDGs: "",
            needTitle: "",
            needDesc: "",
            resourceTitle: "",
            updatedAt:"",
            resourceOwnerId:"",
            resourceOwnerName:"",
            resourceOwnerUsername:"",
            resourceOwnerType:"",
            resourceOwnerImg:""
        }

        resourceReqItem.id = resourceReqs[i].id
        resourceReqItem.projectId = resourceReqs[i].projectId
        resourceReqItem.needId = resourceReqs[i].needId
        resourceReqItem.resourceId = resourceReqs[i].resourceId
        resourceReqItem.resType = resourceReqs[i].resType
        resourceReqItem.status = resourceReqs[i].status
        resourceReqItem.cancelType = resourceReqs[i].cancelType
        resourceReqItem.createdAt = resourceReqs[i].createdAt
        resourceReqItem.desc = resourceReqs[i].desc
        resourceReqItem.updatedAt = resourceReqs[i].updatedAt
        
        await getProjectInfo(resourceReqItem)
        if(resourceReqItem.projectTitle === "") continue
        
        await getNeedInfo(resourceReqItem)
        if(resourceReqItem.needTitle === "") continue
        
        await getResourceInfo(resourceReqItem)
        if(resourceReqItem.resourceTitle === "") continue
        
        await getResourceOwnerIdType(resourceReqItem)
        if(resourceReqItem.resourceOwnerId === "") continue
        
        await getResourceReqResOwnerInfo(resourceReqItem)
        if(resourceReqItem.resourceOwnerName === "") continue
        
        theList.push(resourceReqItem)
        
    }

    theList.reverse()

    return res.status(200).json({
        status: 'success',
        msg: 'Project Page Resource Request list successfully retrieved',
        data: { projectPageResourceReqs: theList }
    });
}

exports.acceptProjectReq = async function (req, res) {    
    const projectReq = await ProjectReq.findOne({ '_id': req.body.projectReqId, 'status': 'pending' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!projectReq)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such pending Project Request ',
        data: {}
    });

    const project = await Project.findOne({ '_id': projectReq.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!project)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such project',
        data: {}
    });

    if(project.status != 'ongoing')
    return res.status(500).json({
        status: 'error',
        msg: 'The project is no longer ongoing!',
        data: {}
    });

    let valid = false;

    if(project.host != req.body.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.body.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.body.id) valid = true;

    if(!valid)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to accept this project request!',
        data: {}
    });


    const resourceneed = await ResourceNeed.findOne({ '_id': projectReq.needId }, function (err) {
        if (err) {
            console.log("error: "+err.message)
            return
        }
    });

    if(!resourceneed)
    return res.status(500).json({
        status: 'error',
        msg: 'The resource need is not found!',
        data: {}
    });

    if(resourceneed.status != 'progress')
    return res.status(500).json({
        status: 'error',
        msg: 'The resource need completion is no longer in progress!',
        data: {}
    });

    projectReq.status = "accepted"

    projectReq.save(projectReq)
    .then(data => {
        var action = "Account accept contribution request to project: "+project.title+" ("+project.id+", "+project.code+")"
        action += " for resourceneed: "+resourceneed.title+" ("+resourceneed.id+","+req.body.resType+") "
        action += " for project request: ("+data.id+","+data.resType+")"

        Helper.createAuditLog(action,req.type,req.id)

        action = "Project accepted a contribution request for resourceneed: "+ resourceneed.title +" ("+resourceneed.id+", "+req.body.resType+")"
        action += " for project request: ("+data.id+","+data.resType+")"
        Helper.createAuditLog(action,"project",project.id)

        Helper.createNotification("Project Request", "Your request to contribute "+resourceneed.title+" to "+ project.title+" has been accepted.", data.ownerId, data.ownerType)

        return res.status(200).json({
            status: 'success',
            msg: 'Project Request successfully accepted',
            data: { projectReq: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.declineProjectReq = async function (req, res) {    
    const projectReq = await ProjectReq.findOne({ '_id': req.body.projectReqId, 'status': 'pending' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!projectReq)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such pending Project Request ',
        data: {}
    });

    const project = await Project.findOne({ '_id': projectReq.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!project)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such project',
        data: {}
    });

    if(project.status != 'ongoing')
    return res.status(500).json({
        status: 'error',
        msg: 'The project is no longer ongoing!',
        data: {}
    });

    let valid = false;

    if(project.host != req.body.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.body.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.body.id) valid = true;

    if(!valid)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to decline this project request!',
        data: {}
    });


    projectReq.status = "declined"

    projectReq.save(projectReq)
    .then(data => {
        var action = "Account decline contribution request to project: "+project.title+" ("+project.id+", "+project.code+")"
        action += " for resourceneed: "+resourceneed.title+" ("+resourceneed.id+","+req.body.resType+") "
        action += " for project request: ("+data.id+","+data.resType+")"

        Helper.createAuditLog(action,req.type,req.id)

        action = "Project declined a contribution request for resourceneed: "+ resourceneed.title +" ("+resourceneed.id+", "+req.body.resType+")"
        action += " for project request: ("+data.id+","+data.resType+")"
        Helper.createAuditLog(action,"project",project.id)

        Helper.createNotification("Project Request", "Your request to contribute "+resourceneed.title+" to "+ project.title+" has been declined.", data.ownerId, data.ownerType)

        return res.status(200).json({
            status: 'success',
            msg: 'Project Request successfully declined',
            data: { projectReq: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.cancelProjectReq = async function (req, res) {    
    const projectReq = await ProjectReq.findOne({ '_id': req.body.projectReqId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!projectReq)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such Project Request ',
        data: {}
    });

    if(projectReq.status != 'pending' && projectReq.status != 'accepted')
    return res.status(500).json({
        status: 'error',
        msg: 'You can no longer cancel this project request ',
        data: {}
    });


    const project = await Project.findOne({ '_id': projectReq.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!project)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such project',
        data: {}
    });


    let valid = false;

    if(project.host != req.body.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.body.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.body.id) valid = true;

    if(!valid && projectReq.ownerId != req.body.id)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to cancel this project request!',
        data: {}
    });


    const resourceneed = await ResourceNeed.findOne({ '_id': projectReq.needId }, function (err) {
        if (err) {
            console.log("error: "+err.message)
            return
        }
    });

    if(!resourceneed)
    return res.status(500).json({
        status: 'error',
        msg: 'The resource need is not found!',
        data: {}
    });

    projectReq.status = "cancelled"

    if(valid === true) projectReq.cancelType = "project"
    else projectReq.cancelType = "contributor"

    projectReq.save(projectReq)
    .then(data => {
        var action = "Account cancel contribution request to project: "+project.title+" ("+project.id+", "+project.code+")"
        action += " for resourceneed: "+resourceneed.title+" ("+resourceneed.id+","+req.body.resType+") "
        action += " for project request: ("+data.id+","+data.resType+")"

        Helper.createAuditLog(action,req.type,req.id)

        action = "Project declined a contribution request for resourceneed: "+ resourceneed.title +" ("+resourceneed.id+", "+req.body.resType+")"
        action += " for project request: ("+data.id+","+data.resType+")"

        Helper.createAuditLog(action,"project",project.id)

        Helper.createNotification("Project Request", "Your request to contribute "+resourceneed.title+" to "+ project.title+" has been canceled.", data.ownerId, data.ownerType)
        return res.status(200).json({
            status: 'success',
            msg: 'Project Request successfully cancelled',
            data: { projectReq: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.completeProjectReq = async function (req, res) {    
    const projectReq = await ProjectReq.findOne({ '_id': req.body.projectReqId, 'status': 'accepted' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!projectReq)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such accepted Project Request ',
        data: {}
    });

    const project = await Project.findOne({ '_id': projectReq.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!project)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such project',
        data: {}
    });

    if(project.status != 'ongoing')
    return res.status(500).json({
        status: 'error',
        msg: 'The project is no longer ongoing!',
        data: {}
    });

    let valid = false;

    if(project.host != req.body.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.body.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.body.id) valid = true;

    if(!valid)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to update this project request!',
        data: {}
    });


    const resourceneed = await ResourceNeed.findOne({ '_id': projectReq.needId }, function (err) {
        if (err) {
            console.log("error: "+err.message)
            return
        }
    });

    if(!resourceneed)
    return res.status(500).json({
        status: 'error',
        msg: 'The resource need is not found!',
        data: {}
    });

    if(resourceneed.status != 'progress')
    return res.status(500).json({
        status: 'error',
        msg: 'The resource need completion is no longer in progress!',
        data: {}
    });

    if(projectReq.resType === "money") {
        resourceneed.pendingSum -= projectReq.moneySum
        resourceneed.receivedSum += projectReq.moneySum
        var tempCompletion = resourceneed.receivedSum*100/resourceneed.total
        resourceneed.completion = Math.round((tempCompletion+Number.EPSILON)*100)/100

        // const money = new Money({
        //     sum: projectReq.moneySum,
        //     desc: projectReq.desc,
        //     owner: projectReq.ownerId,
        //     status: "active",
        //     country: "",
        //     ownerType: projectReq.ownerType
        // });
        // await getAccountCountry(money)
        // var moneyResId;
        // await money.save().then(data => {
        //     moneyResId = data.id;
        // }).catch(err => {
        //     return res.status(500).json({
        //         status: 'error',
        //         msg: 'Something went wrong! Error: ' + err.message,
        //         data: {}
        //     });
        // });

        // projectReq.resourceId = moneyResId
        // projectReq.resType = "money"
        
        // await projectReq.save().catch(err => {
        //     return res.status(500).json({
        //         status: 'error',
        //         msg: 'Something went wrong! Error: ' + err.message,
        //         data: {}
        //     });
        // });
    }

    await resourceneed.save().catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var theRating = 1;
    if(req.body.theRating) {
        if(req.body.theRating >=1 && req.body.theRating <=5) {
            theRating = req.body.theRating
        } else {
            return res.status(500).json({
                status: 'error',
                msg: 'The rating is invalid!',
                data: {}
            });
        }
    }


    const contribution = new Contribution({
		projectId: projectReq.projectId,
		needId: projectReq.needId,
		requestId: projectReq.id,
		requestType: "project",
		resType: projectReq.resType,
        rating: theRating,
        contributor: projectReq.ownerId,
        contributorType: projectReq.ownerType,
        status: 'active'
    });

    await contribution.save().catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    projectReq.status = "completed"

    projectReq.save(projectReq)
    .then(data => {
        var action = "Account mark contribution request as complete to project: "+project.title+" ("+project.id+", "+project.code+")"
        action += " for resourceneed: "+resourceneed.title+" ("+resourceneed.id+","+req.body.resType+") "
        action += " for project request: ("+data.id+","+data.resType+")"

        Helper.createAuditLog(action,req.type,req.id)

        action = "Project marked a contribution request as completed for resourceneed: "+ resourceneed.title +" ("+resourceneed.id+", "+req.body.resType+")"
        action += " for project request: ("+data.id+","+data.resType+")"

        Helper.createAuditLog(action,"project",project.id)

        Helper.createNotification("Project Request", "Your request to contribute "+resourceneed.title+" to "+ project.title+" has been completed.", data.ownerId, data.ownerType)

        return res.status(200).json({
            status: 'success',
            msg: 'Project Request successfully completed',
            data: { projectReq: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    addProjectIds(project.id,projectReq.ownerId,projectReq.ownerType)
}

exports.acceptResourceReq = async function (req, res) {    
    
    const resourceReq = await ResourceReq.findOne({ '_id': req.body.resourceReqId, 'status': 'pending' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!resourceReq)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such pending Resource Request ',
        data: {}
    });

    const resourceneed = await ResourceNeed.findOne({ '_id': resourceReq.needId }, function (err) {
        if (err) {
            console.log("error: "+err.message)
            return
        }
    });

    if(!resourceneed)
    return res.status(500).json({
        status: 'error',
        msg: 'The resource need is not found!',
        data: {}
    });

    if(resourceneed.status != 'progress')
    return res.status(500).json({
        status: 'error',
        msg: 'The resource need completion is no longer in progress!',
        data: {}
    });

    theOwner = await getResourceOwner(resourceReq)
    var valid = false;
    
    if(resourceReq.resType === 'knowledge') {

        for(var i = 0 ; i < theOwner.length; i++) {
            if(req.body.id === theOwner[i].theId) {
                valid = true;
                break;
            }
        }
    } else {
        if(req.body.id === theOwner) valid = true
    }

    if(!valid)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to update this resource request!',
        data: {}
    });

    resourceReq.status = "accepted"

    resourceReq.save(resourceReq)
    .then(data => {
        var action = "Account accepted resource request : ("+resourceReq.id+", "+"resource request id"+")"
        action += " for resource: ("+resourceReq.resourceId+","+resourceReq.resType+") "
        action += " for resource need: ("+resourceReq.needId+","+data.resType+")"

        Helper.createAuditLog(action,req.type,req.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Resource Request successfully accepted',
            data: { resourceReq: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.declineResourceReq = async function (req, res) {    
    
    const resourceReq = await ResourceReq.findOne({ '_id': req.body.resourceReqId, 'status': 'pending' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!resourceReq)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such pending Resource Request ',
        data: {}
    });

    const resourceneed = await ResourceNeed.findOne({ '_id': resourceReq.needId }, function (err) {
        if (err) {
            console.log("error: "+err.message)
            return
        }
    });

    if(!resourceneed)
    return res.status(500).json({
        status: 'error',
        msg: 'The resource need is not found!',
        data: {}
    });

    if(resourceneed.status != 'progress')
    return res.status(500).json({
        status: 'error',
        msg: 'The resource need completion is no longer in progress!',
        data: {}
    });

    theOwner = await getResourceOwner(resourceReq)
    var valid = false;
    
    if(resourceReq.resType === 'knowledge') {

        for(var i = 0 ; i < theOwner.length; i++) {
            if(req.body.id === theOwner[i].theId) {
                valid = true;
                break;
            }
        }
    } else {
        if(req.body.id === theOwner) valid = true
    }

    if(!valid)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to update this resource request!',
        data: {}
    });

    resourceReq.status = "declined"

    resourceReq.save(resourceReq)
    .then(data => {
        var action = "Account declined resource request : ("+resourceReq.id+", "+"resource request id"+")"
        action += " for resource: ("+resourceReq.resourceId+","+resourceReq.resType+") "
        action += " for resource need: ("+resourceReq.needId+","+data.resType+")"

        Helper.createAuditLog(action,req.type,req.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Resource Request successfully declined',
            data: { resourceReq: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.cancelResourceReq = async function (req, res) {    
    
    const resourceReq = await ResourceReq.findOne({ '_id': req.body.resourceReqId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!resourceReq)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such Resource Request ',
        data: {}
    });

    if(resourceReq.status != 'pending' && resourceReq.status != 'accepted')
    return res.status(500).json({
        status: 'error',
        msg: 'You can no longer cancel this resource request ',
        data: {}
    });

    const project = await Project.findOne({ '_id': resourceReq.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!project)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such project',
        data: {}
    });

    let valid = false;

    if(project.host != req.body.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.body.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.body.id) valid = true;

    if(valid === true) resourceReq.cancelType = "project"
    
    theOwner = await getResourceOwner(resourceReq)

    if(resourceReq.resType === 'knowledge') {

        for(var i = 0 ; i < theOwner.length; i++) {
            if(req.body.id === theOwner[i].theId) {
                valid = true;
                resourceReq.cancelType = "contributor"
                break;
            }
        }
    } else {
        if(req.body.id === theOwner) { 
            valid = true
            resourceReq.cancelType = "contributor"
        }
    }

    if(!valid)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to update this resource request!',
        data: {}
    });



    const resourceneed = await ResourceNeed.findOne({ '_id': resourceReq.needId }, function (err) {
        if (err) {
            console.log("error: "+err.message)
            return
        }
    });

    if(!resourceneed)
    return res.status(500).json({
        status: 'error',
        msg: 'The resource need is not found!',
        data: {}
    });

    resourceReq.status = "cancelled"

    resourceReq.save(resourceReq)
    .then(data => {
        var action = "Account cancelled resource request : ("+resourceReq.id+", "+"resource request id"+")"
        action += " for resource: ("+resourceReq.resourceId+","+resourceReq.resType+") "
        action += " for resource need: ("+resourceReq.needId+","+data.resType+")"

        Helper.createAuditLog(action,req.type,req.id)

        if(data.cancelType === 'project') {
            action = "Project cancelled a resource request : ("+resourceReq.id+", "+"resource request id"+")"
            action += " for resource: ("+resourceReq.resourceId+","+resourceReq.resType+") "
            action += " for resource need: ("+resourceReq.needId+","+data.resType+")" 
            
            Helper.createAuditLog(action,"project",project.id)
        }

        return res.status(200).json({
            status: 'success',
            msg: 'Resource Request successfully cancelled',
            data: { resourceReq: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.completeResourceReq = async function (req, res) {    
    const resourceReq = await ResourceReq.findOne({ '_id': req.body.resourceReqId, 'status': 'accepted' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!resourceReq)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such accepted Resource Request ',
        data: {}
    });

    const project = await Project.findOne({ '_id': resourceReq.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!project)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such project',
        data: {}
    });

    if(project.status != 'ongoing')
    return res.status(500).json({
        status: 'error',
        msg: 'The project is no longer ongoing!',
        data: {}
    });

    let valid = false;

    if(project.host != req.body.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.body.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.body.id) valid = true;

    if(!valid)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to update this resource request!',
        data: {}
    });


    const resourceneed = await ResourceNeed.findOne({ '_id': resourceReq.needId }, function (err) {
        if (err) {
            console.log("error: "+err.message)
            return
        }
    });

    if(!resourceneed)
    return res.status(500).json({
        status: 'error',
        msg: 'The resource need is not found!',
        data: {}
    });

    if(resourceneed.status != 'progress')
    return res.status(500).json({
        status: 'error',
        msg: 'The resource need completion is no longer in progress!',
        data: {}
    });

    theOwner = await getResourceOwner(resourceReq)

    var theRating = 1;
    if(req.body.theRating) {
        if(req.body.theRating >=1 && req.body.theRating <=5) {
            theRating = req.body.theRating
        } else {
            return res.status(500).json({
                status: 'error',
                msg: 'The rating is invalid!',
                data: {}
            });
        }
    }

    if(resourceReq.resType === 'knowledge') {

        for(var i = 0 ; i < theOwner.length; i++) {
            const contribution = new Contribution({
                projectId: resourceReq.projectId,
                needId: resourceReq.needId,
                requestId: resourceReq.id,
                requestType: "resource",
                resType: resourceReq.resType,
                rating: theRating,
                contributor: theOwner[i].theId,
                contributorType: theOwner[i].ownerType,
                status: 'active'
            });
        
            contribution.save().catch(err => {
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong! Error: ' + err.message,
                    data: {}
                });
            });

            addProjectIds(resourceReq.projectId,theOwner[i].theId,theOwner[i].ownerType)
        }
    } else {

        const contribution = new Contribution({
            projectId: resourceReq.projectId,
            needId: resourceReq.needId,
            requestId: resourceReq.id,
            requestType: "resource",
            resType: resourceReq.resType,
            rating: theRating,
            contributor: theOwner,
            contributorType: resourceReq.ownerType,
            status: 'active'
        });
    
        contribution.save().catch(err => {
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! Error: ' + err.message,
                data: {}
            });
        });
        addProjectIds(resourceReq.projectId, theOwner, resourceReq.ownerType)
    }

    resourceReq.status = "completed"

    resourceReq.save(resourceReq)
    .then(data => {
        var action = "Account marked complete resource request : ("+resourceReq.id+", "+"resource request id"+")"
        action += " for resource: ("+resourceReq.resourceId+","+resourceReq.resType+") "
        action += " for resource need: ("+resourceReq.needId+","+data.resType+")"

        Helper.createAuditLog(action,req.type,req.id)

        action = "Project marked complete a resource request : ("+resourceReq.id+", "+"resource request id"+")"
        action += " for resource: ("+resourceReq.resourceId+","+resourceReq.resType+") "
        action += " for resource need: ("+resourceReq.needId+","+data.resType+")" 
            
        Helper.createAuditLog(action,"project",project.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Resource Request successfully completed',
            data: { resourceReq: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

async function getProjectInfo(theItem) {
    const project = await Project.findOne({ '_id': theItem.projectId }, function (err) {
        if (err) {
            console.log("error: "+err.message)
            return
        }
    });

    if(!project) return
    if(project.status != 'ongoing') return

    theItem.projectTitle = project.title
    theItem.projectSDGs = project.SDGs
    theItem.projectImg = project.imgPath
    theItem.country = project.country
}

async function getDiscoverProjectInfo(theItem) {
    const project = await Project.findOne({ '_id': theItem.id }, function (err) {
        if (err) {
            console.log("error: "+err.message)
            return
        }
    });

    if(!project) return
    if(project.status != 'ongoing') return

    theItem.title = project.title
    theItem.desc = project.desc
    theItem.host =  project.host
    theItem.hostType = project.hostType
    theItem.status = project.status
    theItem.rating = project.rating
    theItem.country = project.country
    theItem.code = project.code
    theItem.imgPath = project.imgPath
    theItem.admins = project.admins
    theItem.SDGs = project.SDGs
    theItem.createdAt = project.createdAt
    theItem.updatedAt = project.updatedAt
}

async function getNeedInfo(theItem) {
    const resourceneed = await ResourceNeed.findOne({ '_id': theItem.needId }, function (err) {
        if (err) {
            console.log("error: "+err.message)
            return
        }
    });

    if(!resourceneed) return
    if(resourceneed.status != 'progress') return

    theItem.needTitle = resourceneed.title
    theItem.needDesc = resourceneed.desc

}

async function getResourceInfo(theItem) {

    var resource;

    if(theItem.resType === "item") {
        resource = await Item.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if(theItem.resType === "knowledge") {
        resource = await Knowledge.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if(theItem.resType === "venue") {
        resource = await Venue.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if(theItem.resType === "manpower") {
        resource = await Manpower.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if(theItem.resType === "money") {
        resource = await Money.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!resource) return
    if(resource.status != 'active') return

    if(theItem.resType != "money")
        theItem.resourceTitle = resource.title
    else
        theItem.resourceTitle = "Money"

}

async function getResourceOwner(theItem) {

    var resource;

    if(theItem.resType === "item") {
        resource = await Item.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if(theItem.resType === "knowledge") {
        resource = await Knowledge.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if(theItem.resType === "venue") {
        resource = await Venue.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if(theItem.resType === "manpower") {
        resource = await Manpower.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if(theItem.resType === "money") {
        resource = await Money.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!resource) return
    theItem.ownerType = resource.ownerType
    return resource.owner

}

async function getResourceOwnerIdType(theItem) {

    var resource;

    if(theItem.resType === "item") {
        resource = await Item.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if(theItem.resType === "knowledge") {
        resource = await Knowledge.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if(theItem.resType === "venue") {
        resource = await Venue.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if(theItem.resType === "manpower") {
        resource = await Manpower.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if(theItem.resType === "money") {
        resource = await Money.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!resource) return
    if(theItem.resType != "knowledge") {
        theItem.resourceOwnerId = resource.owner
        theItem.resourceOwnerType = resource.ownerType
    }
    else {
        theItem.resourceOwnerId = resource.owner[0].theId
        theItem.resourceOwnerType = resource.owner[0].ownerType
    }
}

async function getAccountInfo(theItem) {
    var owner;

    if(theItem.ownerType === "user") {
        owner = await User.findOne({ '_id': theItem.ownerId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if (theItem.ownerType === 'institution') {
        owner = await Institution.findOne({ '_id': theItem.ownerId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!owner) {
        console.log("error: (getHostInfo) Such account not found!")
        return
    }

    theItem.requesterName = owner.name
    theItem.requesterUsername = owner.username
    theItem.requesterImg = owner.ionicImg
    
}

async function getResourceReqResOwnerInfo(theItem) {
    var owner;

    if(theItem.resourceOwnerType === "user") {
        owner = await User.findOne({ '_id': theItem.resourceOwnerId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if (theItem.resourceOwnerType === 'institution') {
        owner = await Institution.findOne({ '_id': theItem.resourceOwnerId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!owner) {
        console.log("error: (getResReqResOwnerInfo) Such account not found!")
        return
    }

    theItem.resourceOwnerName = owner.name
    theItem.resourceOwnerUsername = owner.username
    theItem.resourceOwnerImg = owner.ionicImg
    
}

async function getAccountCountry(theItem) {
    var owner;

    if(theItem.ownerType === "user") {
        owner = await User.findOne({ '_id': theItem.owner }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if (theItem.ownerType === 'institution') {
        owner = await Institution.findOne({ '_id': theItem.owner }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!owner) {
        console.log("error: (getHostInfo) Such account not found!")
        return
    }

    theItem.country = owner.country
}

async function getHostInfo(theItem) {
    var owner;

    if(theItem.hostType === "user") {
        owner = await User.findOne({ '_id': theItem.host }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if (theItem.hostType === 'institution') {
        owner = await Institution.findOne({ '_id': theItem.host }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!owner) {
        console.log("error: (getHostInfo) Such account not found!")
        return
    }

    theItem.hostImg = owner.ionicImg
    theItem.hostName = owner.name
    theItem.hostUsername = owner.username
    
}

async function addProjectIds(projectId, ownerId, ownerType) {
    var owner;

    if(ownerType === "user") {
        owner = await User.findOne({ '_id': ownerId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if (ownerType === 'institution') {
        owner = await Institution.findOne({ '_id': ownerId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!owner) {
        console.log("error: (addProjectIds) Such account not found!")
        return
    }

    if(!owner.projects.includes(projectId)) {
        owner.projects.push(projectId)
        owner.save().catch(err => {
            console.log("error: (addProjectIds) There is an error updating the projects! " + err.message)
        });
    }
}

new CronJob('59 23 * * 0', async function () {
    runDiscoverWeekly()
    console.log('Discover Weekly triggered')
}, null, true, 'Asia/Singapore');

async function runPendingProjectReqReminder () {
    const projectreqs = await ProjectReq.find({ 'status': 'pending' }, function (err) {
        if (err) console.log(err)
    });

    var projectHashMap = new Map()
    for(var i = 0; i < projectreqs.length; i++) {
        var createdDate = moment(projectreqs[i].createdAt).tz('Asia/Singapore')
        var dateNow = moment.tz('Asia/Singapore')

        if(dateNow.diff(createdDate, 'days') >= 7) 
            projectHashMap.set(projectreqs[i].projectId,1)
    }

    var projectIds = Array.from(projectHashMap.keys())
   
    for(var i = 0; i < projectIds.length; i++) {
        var project = await getProject(projectIds[i])
 
        if(!project) continue
        var projectHost = await getAccount(project.host, project.hostType)

        if(!projectHost) continue

        let subject = 'KoCoSD Pending Project Request'
        let theMessage = `
            <h1>There is a pending project request!</h1>
            <p>Somebody wanted to contribute to your project: ${project.title}. It has been pending for a while now :(.</p>
            <p>Check them out now in the platform :)</p>
            <br>
        `
        Helper.sendEmail(projectHost.email, subject, theMessage, function (info) {
            if (!info) {
                console.log('Something went wrong while trying to send email!')
            } 
        })
    }
}  

async function getProject(theId) {
    const project = await Project.findOne({ '_id': theId }, function (err) {
        if (err) {
            console.log("error: "+err.message)
            return
        }
    });

    if(!project) return
    if(project.status != 'ongoing') return

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

async function runPendingResourceReqReminder () {
    const resourcereqs = await ResourceReq.find({ 'status': 'pending' }, function (err) {
        if (err) console.log(err)
    });

    var resourceHashMap = new Map()
    for(var i = 0; i < resourcereqs.length; i++) {
        var createdDate = moment(resourcereqs[i].createdAt).tz('Asia/Singapore')
        var dateNow = moment.tz('Asia/Singapore')

        var resource = {
            resourceId:"",
            resourceType:""
        }
        
        resource.resourceId = resourcereqs[i].resourceId
        resource.resourceType = resourcereqs[i].resType

        if(dateNow.diff(createdDate, 'days') >= 7) 
            resourceHashMap.set(resource,1)
    }

    var resources = Array.from(resourceHashMap.keys())
   
    for(var i = 0; i < resources.length; i++) {
        var resource = await getResourceEntity(resources[i])
 
        if(!resource) continue
        var resourceOwner = await getAccount(resource.owner, resource.ownerType)

        if(!resourceOwner) continue
        if(resource.status != "active") continue

        let subject = 'KoCoSD Pending Pesource Request'
        let theMessage = `
            <h1>There is a pending request to your resource!</h1>
            <p>Somebody wanted to request for your resource: ${resource.title}. It has been pending for a while now :(</p>
            <p>Check them out now in the platform :)</p>
            <br>
        `
        Helper.sendEmail(resourceOwner.email, subject, theMessage, function (info) {
            if (!info) {
                console.log('Something went wrong while trying to send email!')
            } 
        })
    }
}

async function getResourceEntity(theItem) {

    var resource;

    if(theItem.resourceType === "item") {
        resource = await Item.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if(theItem.resourceType === "venue") {
        resource = await Venue.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if(theItem.resourceType === "manpower") {
        resource = await Manpower.findOne({ '_id': theItem.resourceId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } 

    if(!resource) return
    return resource
}

new CronJob('59 23 * * 6', async function () {
    runPendingProjectReqReminder()
    console.log('Email reminder to pending project request triggered')
}, null, true, 'Asia/Singapore');

exports.triggerProjectReqsReminder = async function (req, res) {    
    runPendingProjectReqReminder()

    return res.status(200).json({
        status: 'success',
        msg: 'Pending Project Requests reminder successfully manually triggered',
        data: { }
    });
}

exports.triggerResourceReqsReminder = async function (req, res) {    
    runPendingResourceReqReminder()

    return res.status(200).json({
        status: 'success',
        msg: 'Pending Resource Requests reminder successfully manually triggered',
        data: { }
    });
}