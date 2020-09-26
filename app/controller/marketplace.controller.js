const db = require('../models')
const Manpower = db.manpower
const User = db.users
const Knowledge = db.knowledge
const Item = db.item
const Venue = db.venue
const ResourceNeed = db.resourceneed
const Institution = db.institution
const ResourceReq = db.resourcereq
const Project = db.project
const nodeCountries =  require("node-countries")

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