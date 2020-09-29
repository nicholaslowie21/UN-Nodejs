const moment = require('moment-timezone')
const db = require('../models')
const Projects = db.project
const Institutions = db.institution
const Users = db.users
const KPI = db.kpi
const ResourceNeed = db.resourceneed
const Contribution = db.contribution
const ProjectReq = db.projectreq
const ResourceReq = db.resourcereq
const Manpower = db.manpower
const Knowledge = db.knowledge
const Item = db.item
const Venue = db.venue
const Money = db.money
const { default: ShortUniqueId } = require('short-unique-id');
const uid = new ShortUniqueId();
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const nodeCountries =  require("node-countries");
const Helper = require('../service/helper.service')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = 'public/uploads/projectPicture'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: async function (req, file, cb) {
        let extentsion = file.originalname.split('.')
        let thePath = 'ProjectPic-'+req.body.projectId+'.'+extentsion[extentsion.length - 1]; 
        req.thePath = thePath;
        cb(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})
var upload = multer({ 
    storage: storage,
    fileFilter: function(_req, file, cb){
        checkFileType(file, cb);
    }     
})

function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
}

exports.multerUpload = upload.single('projectPic');

exports.projectPicture = async function (req, res){
    if(!req.body.projectId) {
        return res.status(500).json({
            status: 'error',
            msg: 'Project id is empty! ',
            data: {}
        });
    }

    
    if(!req.file) {
        return res.status(500).json({
            status: 'error',
            msg: 'No picture uploaded! ',
            data: {}
        });
    }

    const project = await Projects.findOne({ '_id': req.body.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such project!',
            data: {}
        });
    });

    if(!project || project.status!='ongoing')
    return res.status(500).json({
        status: 'error',
        msg: 'Project is suspended or currently not ongoing!',
        data: {}
    });

    var host,hostType,theUsername,country,target;

    if(req.type === "institution") {
        const institution = await Institutions.findOne({ '_id': req.id }, function (err) {
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
        const user = await Users.findOne({ '_id': req.id }, function (err) {
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

    if(host!=project.host)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to perform this action!',
        data: {}
    });

    project.imgPath = "/public/uploads/projectPicture/"+req.thePath;

    project.save(project)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Project picture successfully updated',
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

exports.viewProject = async function (req, res) {
    const project = await Projects.findOne({ '_id': req.query.projectId }, function (err) {
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

    title = "Project Created"
    desc = "Created a project with title " + project.title
    accountId = host
    accountType = hostType 
    
    Helper.createProfileFeed(title,desc,accountId,accountType)

}

exports.postUpdateProject = async function (req, res) {
    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;
    
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
    } else if (project.host=== req.body.id) valid = true;

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

exports.completeProject = async function (req, res) {
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
        msg: 'You are not authorized to mark this project as completed!',
        data: {}
    });

    var targetHost;

    if (project.hostType === "institution") {
        targetHost = await Institutions.findOne({ '_id': project.host }, function (err) {
            if (err) return handleError(err);
        });

    } else if (project.hostType === "user") {
        targetHost = await Users.findOne({ '_id': project.host }, function (err) {
            if (err) return handleError(err);
        });
    }

    project.status = "completed";

    project.save(project)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Project successfully mark as completed!',
            data: { project: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    let subject = 'KoCoSD Project Completion'
    let theMessage = `
        <h1>Congratulations on completing your project!</h1>
        <p>The project code ${project.code}<p>
        <p>If there is any discrepancy, please contact our admin to resolve it.</p><br>
    `

    Helper.sendEmail(targetHost.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })

    title = "Project Completion"
    desc = "Completed a project with the title " + project.title + " which was started by this account :)"
    accountId = targetHost.id
    accountType = project.hostType
        
    Helper.createProfileFeed(title,desc,accountId,accountType)
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

        target = institution
        target.projects.pull(project.id)
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
        target.projects.pull(project.id)
    }

    project.status = "closed"

    var admins = project.admins;
    var adminsArr = [];

    for(var i = 0; i < admins.length; i++) {
        const user = await Users.findOne({ '_id': admins[i] }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue retrieving the user!',
                data: {}
            });    
        })

        if (!user) {
            return res.status(500).json({
                status: 'error',
                msg: 'Such user is not found!',
                data: {}
            });  
        }
        user.projects.pull(project.id);
        adminsArr.push(user)

    }

    for(var i = 0; i < adminsArr.length; i++) {
        adminsArr[i].save().catch(err => {
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! Error: ' + err.message,
                data: {}
            });
        })
    }


    project.save(project)
    .then(data => {
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

    if(project.status != "ongoing") 
    return res.status(500).json({
        status: 'error',
        msg: 'This project is not active!',
        data: {}
    });

    if(project.host != req.body.id)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to edit admin for this project!',
        data: {}
    });

    var oldAdmins = project.admins;
    var tempAdmins = []
    var receivedAdmins = req.body.admins

    for(var i = 0; i < receivedAdmins.length; i++) {
        const user = await Users.findOne({ '_id': receivedAdmins[i] }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue retrieving the user!',
                data: {}
            });    
        })

        if (!user) {
            return res.status(500).json({
                status: 'error',
                msg: 'Such user is not found!',
                data: {}
            });  
        }

        if(user.id === req.body.id) {
            return res.status(500).json({
                status: 'error',
                msg: 'You cannot add yourself as admin!',
                data: {}
            });  
        }

        if(!tempAdmins.includes(user.id)){
            tempAdmins.push(user.id)
            user.projects.push(project.id)
        }
    }

    var updateOldAminsProjs = [];
    for(var i = 0; i < oldAdmins.length; i++) {
        console.log("here")
        const user = await Users.findOne({ '_id': oldAdmins[i] }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue retrieving the user!',
                data: {}
            });    
        })

        if (!user) continue;
        

        if(!tempAdmins.includes(user.id)){
            user.projects.pull(project.id)
            updateOldAminsProjs.push(user)
        }

    }


    project.admins = tempAdmins

    
    for(var i = 0; i < tempAdmins.length; i++) {
        tempAdmins[i].save().catch(err => {
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! Error: ' + err.message,
                data: {}
            });
        })
    }

    for(var i = 0; i < updateOldAminsProjs.length; i++) {
        updateOldAminsProjs[i].save().catch(err => {
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! Error: ' + err.message,
                data: {}
            });
        })
    }


    project.save(project)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Project admins successfully edited',
            data: { project: data, admins: tempAdmins }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.addAdmin = async function (req, res) {
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

    if(project.status != "ongoing") 
    return res.status(500).json({
        status: 'error',
        msg: 'This project is not active!',
        data: {}
    });

    if(project.host != req.body.id)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to edit admin for this project!',
        data: {}
    });

    const user = await Users.findOne({ '_id': req.body.userId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the user!',
            data: {}
        });    
    })

    if (!user) {
        return res.status(500).json({
            status: 'error',
            msg: 'Such user is not found!',
            data: {}
        });  
    }

    if(user.id === req.body.id) {
        return res.status(500).json({
            status: 'error',
            msg: 'You cannot add yourself as admin!',
            data: {}
        });  
    }
    
    var tempAdmins = project.admins

    if(!tempAdmins.includes(user.id)){
        tempAdmins.push(user.id)
        user.projects.push(project.id)
    } else {
        return res.status(500).json({
            status: 'error',
            msg: 'This user is already added as admin',
            data: {}
        });
    }

    project.admins = tempAdmins

    user.save().catch(err =>{
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    })

    project.save(project)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Project admin successfully added',
            data: { project: data}
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    let subject = 'KoCoSD Project Admin Assignment'
    let theMessage = `
        <h1>Congratulations you have been assigned as admin for a project!</h1>
        <p>The project code ${project.code}<p>
        <p>If there is any discrepancy, please contact our admin to resolve it.</p><br>
    `

    Helper.sendEmail(user.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })

    title = "Project Admin"
    desc = "Assigned as a project admin for the project " + project.title
    accountId = user.id
    accountType = "user"
        
    Helper.createProfileFeed(title,desc,accountId,accountType)
}

exports.deleteAdmin = async function (req, res) {
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

    if(project.status != "ongoing") 
    return res.status(500).json({
        status: 'error',
        msg: 'This project is not active!',
        data: {}
    });

    if(project.host != req.body.id)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to edit admin for this project!',
        data: {}
    });

    const user = await Users.findOne({ '_id': req.body.userId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the user!',
            data: {}
        });    
    })

    if (!user) {
        return res.status(500).json({
            status: 'error',
            msg: 'Such user is not found!',
            data: {}
        });  
    }

    if(user.id === req.body.id) {
        return res.status(500).json({
            status: 'error',
            msg: 'You cannot add yourself as admin!',
            data: {}
        });  
    }
    
    var tempAdmins = project.admins

    if(!tempAdmins.includes(user.id)){
        return res.status(500).json({
            status: 'error',
            msg: 'This user is not an admin',
            data: {}
        });
    } else {
        tempAdmins.pull(user.id)
        user.projects.pull(project.id)
    }

    project.admins = tempAdmins

    user.save().catch(err =>{
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    })

    project.save(project)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Project admin successfully deleted',
            data: { project: data}
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    let subject = 'KoCoSD Project Admin Removed'
    let theMessage = `
        <h1>You have been removed from being an admin for a project!</h1>
        <p>The project code ${project.code}<p>
        <p>If there is any discrepancy, please contact our admin to resolve it.</p><br>
    `

    Helper.sendEmail(user.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })
}

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

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for the users',
        data: { users: users }
    });
}

exports.getAdmins = async function (req, res){

    const project = await Projects.findOne({ '_id': req.query.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong when retrieving the project! ',
            data: {}
        });
    });

    if(!project) {
        return res.status(500).json({
            status: 'error',
            msg: 'No project found! ',
            data: {}
        });
    }

    var adminsId = project.admins;
    var arr = [];
    
    for (var i = 0; i < adminsId.length; i++) {
        var admin = await Users.findOne({ '_id': adminsId[i] }, function (err) {
            if (err) return handleError(err);
        });
        
        if(!admin) {
            project.admins.pull(adminsId[i]);
        } else {
            arr.push(admin)
        }
    }

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for the project admins',
        data:  { admins: arr} 
    });
}

exports.getProjectHost = async function (req, res){
    const project = await Projects.findOne({ '_id': req.query.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong when retrieving the project! ',
            data: {}
        });
    });

    if(!project) {
        return res.status(500).json({
            status: 'error',
            msg: 'No project found! ',
            data: {}
        });
    }

    var host;

    if (project.hostType === "institution") {
        var targetHost = await Institutions.findOne({ '_id': project.host }, function (err) {
            if (err) return handleError(err);
        });

        host = targetHost;
    } else if (project.hostType === "user") {
        var targetHost = await Users.findOne({ '_id': project.host }, function (err) {
            if (err) return handleError(err);
        });

        host = targetHost;
    }

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for the project host!',
        data:  { host: host, type: project.hostType} 
    });
}

exports.createKPI = async function (req, res) {
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

    if(project.status != "ongoing") 
    return res.status(500).json({
        status: 'error',
        msg: 'This project is not active!',
        data: {}
    });

    if(project.host != req.body.id && !project.admins.includes(req.body.id))
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to edit KPI for this project!',
        data: {}
    });

    const kpi = new KPI({
		title: req.body.title,
		desc: req.body.desc,
        completion: 0,
        projectId: project.id
    });

    kpi.save(kpi)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'KPI successfully created',
            data: { kpi: kpi }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.updateKPI = async function (req, res) {
    const kpi = await KPI.findOne({ '_id': req.body.kpiId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the kpi!',
            data: {}
        });
    });

    if(!kpi) 
    return res.status(500).json({
        status: 'error',
        msg: 'Such kpi not found!',
        data: {}
    });

    const project = await Projects.findOne({ '_id': kpi.projectId }, function (err) {
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

    if(project.host != req.body.id && !project.admins.includes(req.body.id))
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to edit KPI for this project!',
        data: {}
    });

    kpi.title = req.body.title
    kpi.desc = req.body.desc
    kpi.completion = req.body.completion

    kpi.save(kpi)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'KPI successfully updated',
            data: { kpi: kpi }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.deleteKPI = async function (req, res) {
    const kpi = await KPI.findOne({ '_id': req.body.kpiId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the kpi!',
            data: {}
        });
    });

    if(!kpi) 
    return res.status(500).json({
        status: 'error',
        msg: 'Such kpi not found!',
        data: {}
    });

    const project = await Projects.findOne({ '_id': kpi.projectId }, function (err) {
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

    if(project.host != req.body.id && !project.admins.includes(req.body.id))
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to edit KPI for this project!',
        data: {}
    });

    kpi.deleteOne({ "_id": kpi.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue deleting the kpi!' + err.message,
            data: {}
        });
      });


    return res.status(200).json({
        status: 'success',
        msg: 'KPI successfully deleted',
        data: { }
    });

}

exports.getKPIs = async function (req, res) {
    const kpis = await KPI.find({ 'projectId': req.query.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the kpis!',
            data: {}
        });
    });

    if(!kpis) 
    return res.status(500).json({
        status: 'error',
        msg: 'KPIs not found!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'KPIs successfully retrieved!',
        data: { kpis: kpis}
    });

}

exports.createResourceNeed = async function (req, res){
    let actor

    if(req.body.resourceType === "money" && !req.body.total)
    return res.status(500).json({
        status: 'error',
        msg: 'Invalid input! The total sum is not declared.',
        data: {}
    });

    if(req.body.resourceType === "money" && req.body.total <= 0)
    return res.status(500).json({
        status: 'error',
        msg: 'Invalid input! The total sum is invalid.',
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

        actor = institution
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

        actor = user
    }

    if(!actor)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

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
    } else if (project.host=== req.body.id) valid = true;

    if(!valid)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to create resource need for this project!',
        data: {}
    });


    const resourceneed = new ResourceNeed({
        title: req.body.title,
        desc: req.body.desc,
        type: req.body.resourceType,
        total: req.body.total || 0,
        completion: 0,
        projectId: project.id,
        code: actor.username+"-"+uid(),
        status: "progress",
        pendingSum: 0,
        receivedSum: 0
    });

    resourceneed.save(resourceneed)
    .then(data => {

        return res.status(200).json({
            status: 'success',
            msg: 'Resource need successfully created!',
            data: { resourceneed: resourceneed, project: project }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

}

exports.editResourceNeed = async function (req, res){
    let actor

    const resourceneed = await ResourceNeed.findOne({ '_id': req.body.needId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!resourceneed)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such resource need!',
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

        actor = institution
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

        actor = user
    }

    if(!actor)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    const project = await Projects.findOne({ '_id': resourceneed.projectId }, function (err) {
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
    } else if (project.host=== req.body.id) valid = true;

    if(!valid)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to create resource need for this project!',
        data: {}
    });

    if(resourceneed.status === "closed")
    return res.status(500).json({
        status: 'error',
        msg: 'You are not allowed to change the details of a deleted resourceneed!',
        data: {}
    });

    if(resourceneed.type === "money" && req.body.total <= 0)
    return res.status(500).json({
        status: 'error',
        msg: 'Invalid input! The total sum is invalid.',
        data: {}
    });

    resourceneed.title = req.body.title
    resourceneed.desc = req.body.desc
    resourceneed.total = req.body.total
    resourceneed.completion = req.body.completion

    if(resourceneed.completion === 100)
        resourceneed.status = "completed"
    else 
        resourceneed.status = "progress"

    resourceneed.save(resourceneed)
    .then(data => {

        return res.status(200).json({
            status: 'success',
            msg: 'Resource need successfully updated!',
            data: { resourceneed: resourceneed, project: project }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

}

exports.deleteResourceNeed = async function (req, res){
    let actor

    const resourceneed = await ResourceNeed.findOne({ '_id': req.body.needId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!resourceneed)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such resource need!',
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

        actor = institution
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

        actor = user
    }

    if(!actor)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    const project = await Projects.findOne({ '_id': resourceneed.projectId }, function (err) {
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
    } else if (project.host=== req.body.id) valid = true;

    if(!valid)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to delete resource need for this project!',
        data: {}
    });

    if(resourceneed.status === "closed")
    return res.status(500).json({
        status: 'error',
        msg: 'You have deleted this resource need!',
        data: {}
    });

    resourceneed.status = "closed"

    resourceneed.save(resourceneed)
    .then(data => {

        return res.status(200).json({
            status: 'success',
            msg: 'Resource need successfully deleted!',
            data: { resourceneed: resourceneed, project: project }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    const contributions = await Contribution.find({ 'needId': resourceneed.id }, function (err) {
        if (err) console.log("Something went wrong while trying to remove contributions in deleting resource need"+ err.message);
    });

    for(var i = 0; i < contributions.length; i++) {
        contributions[i].status = "closed"
        contributions[i].save()
    }

}

exports.removeContribution = async function (req, res){
    let actor

    const contribution = await Contribution.findOne({ '_id': req.body.contributionId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong!' + err.message,
            data: {}
        });
    });

    if(!contribution)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such contribution!',
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

        actor = institution
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

        actor = user
    }

    if(!actor)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    const project = await Projects.findOne({ '_id': contribution.projectId }, function (err) {
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
    } else if (project.host === req.body.id) valid = true;

    if(!valid)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to delete this contribution!',
        data: {}
    });

    if(contribution.status === "closed")
    return res.status(500).json({
        status: 'error',
        msg: 'You have deleted this contribution!',
        data: {}
    });

    contribution.status = "closed"

    contribution.save(contribution)
    .then(data => {

        return res.status(200).json({
            status: 'success',
            msg: 'Contribution successfully removed!',
            data: { project: project, contribution: contribution }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

}

exports.getResourceNeeds = async function (req, res){
    const resourceneeds = await ResourceNeed.find({ 'projectId': req.query.projectId, 'status': { $ne: 'closed'} }, function (err) {
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
        msg: 'There was no resource needs for this project or something went wrong!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Resource need successfully retrieved!',
        data: { resourceneeds: resourceneeds }
    });
}

exports.getContributions = async function (req, res){
    const contributions = await Contribution.find({ 'projectId': req.query.projectId, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an error retrieving contributions!' + err.message,
            data: {}
        });
    });

    if(!contributions)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no contributions or something went wrong!',
        data: {}
    });

    var theList = []

    for(var i = 0; i < contributions.length; i++) {
        var contributionItem = {
            "contributionId":"",
            "projectId": "",
            "needId": "",
            "requestId": "",
            "requestType": "",
            "resType": "",
            "rating": "",
            "contributor": "",
            "contributorType": "",
            "needTitle":"",
            "resourceTitle":"",
            "resourceId":"",
            "desc":"",
            "contributorUsername":"",
            "contributorName":""
        }

        contributionItem.contributionId = contributions[i].id
        contributionItem.projectId = contributions[i].projectId
        contributionItem.needId = contributions[i].needId
        contributionItem.requestId = contributions[i].requestId
        contributionItem.requestType = contributions[i].requestType
        contributionItem.resType = contributions[i].resType
        contributionItem.rating = contributions[i].rating
        contributionItem.contributor = contributions[i].contributor
        contributionItem.contributorType = contributions[i].contributorType

        await getNeedInfo(contributionItem)
        await getRequestInfo(contributionItem)
        await getResourceInfo(contributionItem)
        await getContributorInfo(contributionItem)
        
        theList.push(contributionItem)
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Contributions successfully retrieved!',
        data: { contributions: theList }
    });

}

exports.getContributors = async function (req, res){
    const contributions = await Contribution.find({ 'projectId': req.query.projectId, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an error retrieving contributions!' + err.message,
            data: {}
        });
    });

    if(!contributions)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no contributions or something went wrong!',
        data: {}
    });

    var theList = []
    var checkerList = [];

    const project = await Projects.findOne({ '_id': req.query.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an error retrieving project!' + err.message,
            data: {}
        });
    });

    if(!project)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such project or something went wrong!',
        data: {}
    });

    var host;

    var contributionItem = {
        "contributor": "",
        "contributorType": "",
        "contributorUsername":"",
        "contributorName":"",
        "contributionType":"",
        "contributorImgPath":"",
        "ionicImgPath":""
    }

    if(project.hostType === "institution") {
        const institution = await Institutions.findOne({ '_id': project.host }, function (err) {
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

        host = institution;
        contributionItem.contributorType = "institution"
    } else if (project.hostType === "user") {
        const user = await Users.findOne({ '_id': project.host }, function (err) {
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

        host = user
        contributionItem.contributorType = "user"
    }

    contributionItem.contributor = host.id
    contributionItem.contributorUsername = host.username
    contributionItem.contributorName = host.name
    contributionItem.contributionType = "host"
    contributionItem.contributorImgPath = host.profilePic
    contributionItem.ionicImgPath = host.ionicImg

    theList.push(contributionItem)
    checkerList.push(contributionItem.contributor)

    var admins = project.admins

    for(var i = 0; i < admins.length; i++) {
        var contributionItem = {
            "contributor": "",
            "contributorType": "",
            "contributorUsername":"",
            "contributorName":"",
            "contributionType":"",
            "contributorImgPath":"",
            "ionicImgPath":""
        }

        contributionItem.contributor = admins[i]
        contributionItem.contributorType = "user"
        contributionItem.contributionType = "admin"
        await getContributorInfo(contributionItem)
        
        theList.push(contributionItem)
        checkerList.push(contributionItem.contributor)
    }

    for(var i = 0; i < contributions.length; i++) {
        var contributionItem = {
            "contributor": "",
            "contributorType": "",
            "contributorUsername":"",
            "contributorName":"",
            "contributionType":"",
            "contributorImgPath":"",
            "ionicImgPath":""
        }

        contributionItem.contributor = contributions[i].contributor
        contributionItem.contributorType = contributions[i].contributorType
        contributionItem.contributionType = "contributor"
        await getContributorInfo(contributionItem)
        
        if(!checkerList.includes(contributionItem.contributor)) {
            theList.push(contributionItem)
            checkerList.push(contributionItem.contributor)
        }
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Contributors successfully retrieved!',
        data: { contributors: theList }
    });

}

async function getNeedInfo(contributionItem) {
    const need = await ResourceNeed.findOne({ '_id': contributionItem.needId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an error retrieving a resource need!' + err.message,
            data: {}
        });
    });

    if(!need)
    return res.status(500).json({
        status: 'error',
        msg: 'There was an error retrieving a resource need!' + err.message,
        data: {}
    });

    contributionItem.needTitle = need.title;
}

async function getRequestInfo(contributionItem) {
    var request;

    if(contributionItem.requestType === "project") {
        request = await ProjectReq.findOne({ '_id': contributionItem.requestId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving a resource need!' + err.message,
                data: {}
            });
        });
    } else if (contributionItem.requestType === 'resource') {
        request = await ResourceReq.findOne({ '_id': contributionItem.requestId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving a resource need!' + err.message,
                data: {}
            });
        });
    }

    if(!request)
    return res.status(500).json({
        status: 'error',
        msg: 'There was an issue retrieving request info!',
        data: {}
    });

    contributionItem.resourceId = request.resourceId
    contributionItem.desc = request.desc
}

async function getContributorInfo(contributionItem) {
    var owner;

    if(contributionItem.contributorType === "user") {
        owner = await Users.findOne({ '_id': contributionItem.contributor }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving a resource contributor!' + err.message,
                data: {}
            });
        });
    } else if (contributionItem.contributorType === 'institution') {
        owner = await Institutions.findOne({ '_id': contributionItem.contributor }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving a resource contributor!' + err.message,
                data: {}
            });
        });
    }

    if(!owner)
    return res.status(500).json({
        status: 'error',
        msg: 'There was an issue retrieving a contributor info!',
        data: {}
    });

    contributionItem.contributorUsername = owner.username
    contributionItem.contributorName = owner.name
    contributionItem.contributorImgPath = owner.profilePic
    contributionItem.ionicImgPath = owner.ionicImg

}

async function getResourceInfo(contributionItem) {
    var resource;

    if(contributionItem.resType === 'manpower') {
        resource = await Manpower.findOne({ '_id': contributionItem.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving a manpower resource!' + err.message,
                data: {}
            });
        });    
    } else if(contributionItem.resType === 'venue') {
        resource = await Venue.findOne({ '_id': contributionItem.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving a venue resource!' + err.message,
                data: {}
            });
        });    
    } else if(contributionItem.resType === 'money') {
        resource = await Money.findOne({ '_id': contributionItem.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving a money resource!' + err.message,
                data: {}
            });
        });    
    } else if(contributionItem.resType === 'knowledge') {
        resource = await Knowledge.findOne({ '_id': contributionItem.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving a knowledge resource!' + err.message,
                data: {}
            });
        });    
    } else if(contributionItem.resType === 'item') {
        resource = await Item.findOne({ '_id': contributionItem.resourceId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving an item resource!' + err.message,
                data: {}
            });
        });    
    }
    
    if(!resource)
    return res.status(500).json({
        status: 'error',
        msg: 'There was an error retrieving a resource!' + err.message,
        data: {}
    });

    if(contributionItem.resType!= 'money')
        contributionItem.resourceTitle = resource.title;
    else
        contributionItem.resourceTitle = '$'+resource.sum+' contributed';
}

exports.getAccNewsFeed = async function (req, res){
    var account;
    if (req.body.type === "user") {
        account = await Users.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving the account!' + err.message,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        account = await Institutions.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving the account!' + err.message,
                data: {}
            });
        });
    }

    if(!account)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no contributions or something went wrong!',
        data: {}
    });

    var accSDGs = account.SDGs;
    var theList = []
    
    var projects = await Projects.find({ 'status': "ongoing" }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an error retrieving the account!' + err.message,
            data: {}
        });
    });

    for(var i = 0; i < projects.length; i++) {
        var projectItem = {
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
            "matchPoint":0
        }

        if(account.projects.includes(projects[i].id)) continue

        projectItem.id = projects[i].id
        projectItem.title = projects[i].title
        projectItem.desc = projects[i].desc
        projectItem.host = projects[i].host
        projectItem.hostType = projects[i].hostType
        projectItem.status = projects[i].status
        projectItem.rating = projects[i].rating
        projectItem.country = projects[i].country
        projectItem.code = projects[i].code
        projectItem.imgPath = projects[i].imgPath
        projectItem.admins = projects[i].admins
        projectItem.SDGs = projects[i].SDGs

        var tempSDGs = projectItem.SDGs
        for(var j = 0; j < projectItem.SDGs.length; j++) {
            if(accSDGs.includes(tempSDGs[j]))
                projectItem.matchPoint += 10;
        }

        theList.push(projectItem)
    }

    theList.sort(function(a, b){return b.matchPoint - a.matchPoint})

    return res.status(200).json({
        status: 'success',
        msg: 'Projects for News Feed successfully retrieved!',
        data: { newsfeeds: theList }
    });

}

handleError = (err) => {
    console.log("handleError :"+ err)
}