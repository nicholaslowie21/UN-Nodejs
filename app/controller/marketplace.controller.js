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
            ownerUsername: ""
        }

        manpowerResource.id = manpowers[i].id
        manpowerResource.title = manpowers[i].title
        manpowerResource.desc = manpowers[i].desc
        manpowerResource.owner = manpowers[i].owner
        manpowerResource.status = manpowers[i].status
        manpowerResource.country = manpowers[i].country
        manpowerResource.ownerType = manpowers[i].ownerType
        await getOwnerInfo(manpowerResource)

        theList.push(manpowerResource)
    }

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
            ownerUsername: ""
        }

        resourceItem.id = items[i].id
        resourceItem.title = items[i].title
        resourceItem.desc = items[i].desc
        resourceItem.owner = items[i].owner
        resourceItem.status = items[i].status
        resourceItem.country = items[i].country
        resourceItem.ownerType = items[i].ownerType
        resourceItem.imgPath = items[i].imgPath
        await getOwnerInfo(resourceItem)

        theList.push(resourceItem)
    }

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
            ownerUsername: ""
        }

        resourceItem.id = venues[i].id
        resourceItem.title = venues[i].title
        resourceItem.desc = venues[i].desc
        resourceItem.owner = venues[i].owner
        resourceItem.status = venues[i].status
        resourceItem.country = venues[i].country
        resourceItem.ownerType = venues[i].ownerType
        resourceItem.imgPath = venues[i].imgPath
        await getOwnerInfo(resourceItem)

        theList.push(resourceItem)
    }

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
            ownerUsername: ""
        }

        resourceItem.id = knowledges[i].id
        resourceItem.title = knowledges[i].title
        resourceItem.desc = knowledges[i].desc
        resourceItem.owner = knowledges[i].owner[0].theId
        resourceItem.status = knowledges[i].status
        resourceItem.country = knowledges[i].country
        resourceItem.ownerType = knowledges[i].owner[0].ownerType
        resourceItem.imgPath = knowledges[i].imgPath
        await getOwnerInfo(resourceItem)

        theList.push(resourceItem)
    }

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
            SDGs:""
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

        await getOwnerInfo(projectItem)

        theList.push(projectItem)
    }

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
            matchPoint:0
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

        await getOwnerInfo(projectItem)

        for(var j = 0; j < theFilter.length; j++) {
            if(projectItem.SDGs.includes(theFilter[j]))
                projectItem.matchPoint += 10
        }

        theList.push(projectItem)
    }

    theList.sort(function(a, b){return b.matchPoint - a.matchPoint})

    return res.status(200).json({
        status: 'success',
        msg: 'Project filtered list successfully retrieved',
        data: { projects: theList }
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

    var temp = await ProjectReq.findOne({ 'needId': resourceneed.id, "resourceId": resource.id, "resType": req.body.resType, "status":"pending" }, function (err) {
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