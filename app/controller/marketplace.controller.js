const db = require('../models')
const Manpower = db.manpower
const User = db.users
const Knowledge = db.knowledge
const Item = db.item
const Venue = db.venue
const ResourceNeed = db.resourceneed
const Institution = db.institution
const ResourceReq = db.resourcereq
const ProjectReq = db.projectreq
const Project = db.project
const Contribution = db.contribution
const nodeCountries =  require("node-countries")
const Helper = require('../service/helper.service')
const { default: ShortUniqueId } = require('short-unique-id');
const uid = new ShortUniqueId();

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
        console.log(data)
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
        msg: 'Such item resource need not found!',
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

    var temp = await ResourceReq.findOne({ 'needId': resourceneed.id, "resourceId": resource.id, "resType": "knowledge", "status":"completed" }, function (err) {
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
        msg: 'Such knowledge resource use have been created! ',
        data: {}
    }); 

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
        }

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
        }

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
            updatedAt:""
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

    if(!theFilter.length)
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
            matchPoint:0
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
        msg: 'Such item resource need not found!',
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

    const projectreq = new ProjectReq({
        projectId: project.id,
        needId: req.body.needId,
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
        console.log("error: (getHostInfo) Such account not found!")
        return
    }

    resourceItem.ownerImg = owner.ionicImg
    resourceItem.ownerName = owner.name
    resourceItem.ownerUsername = owner.username
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
            resourceTitle: ""
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
            resourceTitle: ""
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

    projectReq.status = "declined"

    projectReq.save(projectReq)
    .then(data => {
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