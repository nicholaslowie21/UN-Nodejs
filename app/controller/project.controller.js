const moment = require('moment-timezone')
const db = require('../models')
const Projects = db.project
const Institutions = db.institution
const Users = db.users
const { default: ShortUniqueId } = require('short-unique-id');
const uid = new ShortUniqueId();

exports.viewProject = async function (req, res) {
    const project = await Projects.findOne({ 'code': req.query.code }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(500).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Project successfully retrieved',
        data: { targetProject: project }
    });
}

exports.searchProjects = async function (req, res){

    var rgx = new RegExp(req.query.code, "i");
    
    const projects = await Projects.find({ 'code': { $regex: rgx } }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong when retrieving projects! ',
            data: {}
        });
    });

    if(!projects) {
        return res.status(500).json({
            status: 'error',
            msg: 'No project found! ',
            data: {}
        });
    }

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for the users',
        data: { projects: projects }
    });
}

exports.createProject = async function (req, res){
    let host = ""
    let hostType = ""
    let country = ""
    let theUsername = ""
    var target;

    if(req.type === "institution") {
        const institution = await Institutions.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(500).json({
            status: 'error',
            msg: 'Account is not authorized to perform project creation right now!',
            data: {}
        });

        host = institution.id
        hostType = "institution"
        country = institution.country
        theUsername = institution.username
        target = institution
    } else if (req.type === "user") {
        const user = await Users.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(user.isVerified != "true")
        return res.status(500).json({
            status: 'error',
            msg: 'Account not authorized to create project! Not verified yet.',
            data: {}
        });

        host = user.id
        hostType = "user"
        country = user.country
        theUsername = user.username
        target = user
    }

    var tempSDGs = req.body.SDGs;
    
    var theSDGs = [];

    tempSDGs.forEach(sdg => {
        if(!theSDGs.includes(sdg))
            theSDGs.push(sdg);
    })

    theSDGs.sort(function(a, b){return a - b});

    const project = new Projects({
        title: req.body.title,
        desc: req.body.desc,
        rating: req.body.rating,
        country: country,
        code: theUsername+"-"+uid(),
        SDGs: theSDGs,
        host: host,
        hostType: hostType,
        status: "ongoing"

    });

    project.save(project)
    .then(data => {

        let tempProjects = target.projects
        tempProjects.push(data.id); 
        target.projects = tempProjects
        
        target.save(target).catch(err => {
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! Error: ' + err.message,
                data: {}
            });
        });

        return res.status(200).json({
            status: 'success',
            msg: 'Project successfully created!',
            data: { project: data, account: target }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

}

exports.postUpdateProject = async function (req, res) {
    const project = await Projects.findOne({ '_id': req.body.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(500).json({
        status: 'error',
        msg: 'Such project not found!',
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
    } else valid = true;

    if(!valid)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to edit this project!',
        data: {}
    });

    var tempSDGs = req.body.SDGs;
    
    var theSDGs = [];

    tempSDGs.forEach(sdg => {
        if(!theSDGs.includes(sdg))
            theSDGs.push(sdg);
    })

    theSDGs.sort(function(a, b){return a - b});

    project.title = req.body.title;
    project.desc = req.body.desc;
    project.country = req.body.country;
    project.rating = req.body.rating;
    project.SDGs = theSDGs;

    project.save(project)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Project successfully updated',
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

exports.deleteProject = async function (req, res) {
    const project = await Projects.findOne({ '_id': req.body.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(500).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    if(project.host != req.body.id)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to closed this project!',
        data: {}
    });

    if(req.type === "institution") {
        const institution = await Institutions.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(500).json({
            status: 'error',
            msg: 'Account is not authorized to perform project creation right now!',
            data: {}
        });

        target = institution
    } else if (req.type === "user") {
        const user = await Users.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(user.isVerified != "true" || user.status != 'active')
        return res.status(500).json({
            status: 'error',
            msg: 'Account not authorized to create project!',
            data: {}
        });

        target = user
    }

    project.status = "closed"

    project.save(project)
    .then(data => {

        let tempProjects = target.projects
        tempProjects.pull(data.id); 
        target.projects = tempProjects
        
        target.save(target).catch(err => {
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! Error: ' + err.message,
                data: {}
            });
        });

        return res.status(200).json({
            status: 'success',
            msg: 'Project successfully deleted',
            data: { project: data, account: target }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.editAdmin = async function (req, res) {
    const project = await Projects.findOne({ '_id': req.body.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(500).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    if(project.host != req.body.id)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to closed this project!',
        data: {}
    });

    project.status = "closed"

    project.save(project)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Project successfully deleted',
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