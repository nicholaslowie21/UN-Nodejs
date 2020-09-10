const moment = require('moment-timezone')
const db = require('../models')
const Institution = db.institution
const User = db.users;
const Projects = db.project;
const nodeCountries = require('node-countries');
const fs = require('fs');
const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = 'public/uploads/profilePicture'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: async function (req, file, cb) {
        let extentsion = file.originalname.split('.')
        let thePath = 'ProfPic-Institution-'+req.id+'.'+extentsion[extentsion.length - 1]; 
        req.thePath = thePath;
        cb(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})
var upload = multer({ storage: storage })

exports.multerUpload = upload.single('profilePic');

exports.profilePicture = async function (req, res){
    const institution = await Institution.findOne({ '_id': req.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!institution)
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    institution.profilePic = 'https://localhost:8080/public/uploads/profilePicture/'+req.thePath;

    institution.save(institution)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Account profile picture successfully updated',
            data: { institution: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.updateProfile = async function (req, res, next) {
    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;
    
    const institution = await Institution.findOne({ '_id': req.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!institution) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    var tempSDGs = req.body.SDGs;
    
    var theSDGs = [];

    tempSDGs.forEach(sdg => {
        if(!theSDGs.includes(sdg))
            theSDGs.push(sdg);
    })

    theSDGs.sort();
    
    institution.name = req.body.name;
    institution.bio = req.body.bio;
    institution.phone = req.body.phone;
    institution.country = req.body.country;
    institution.address = req.body.address;
    institution.website = req.body.website;
    institution.SDGs = theSDGs;

    institution.save(institution)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Account profile successfully updated',
            data: { institution: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });   
}

exports.updateUsername = async function (req, res, next) {
    const institution = await Institution.findOne({ '_id': req.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!institution) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });
    
    institution.username = req.body.username;
    
    institution.save(institution)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Account username successfully updated',
            data: { institution: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });   
}

exports.updateEmail = async function (req, res, next) {
    const institution = await Institution.findOne({ '_id': req.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!institution) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });
    
    institution.email = req.body.email;

    institution.save(institution)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Account email successfully updated',
            data: { institution: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });   
}

exports.getMembers = async function(req,res) {
    const institution = await Institution.findOne({ '_id': req.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!institution)
    return res.status(500).json({
        status: 'error',
        msg: 'Such account not found!',
        data: {}
    });

    let membersId = institution.members;
    var members = [];

    for (var i = 0; i < membersId.length; i++) {
        var member = await User.findOne({ '_id': membersId[i] }, function (err, person) {
            if (err) return handleError(err);
        });
        
        if(!member) {
            institution.members.pull(membersId[i]);
        } else {
            members.push(member)
        }
    }

    await institution.save();
   
    return res.status(200).json({
        status: 'success',
        msg: 'Affiliated users successfully retrieved and updated',
        data: { members: members }
    });

}

exports.addMembers = async function(req,res) {
    const institution = await Institution.findOne({ '_id': req.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!institution)
    return res.status(500).json({
        status: 'error',
        msg: 'Such account not found!',
        data: {}
    });

    var member = await User.findOne({ '_id': req.body.userId }, function (err, person) {
        if (err) 
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    if(!member)
    return res.status(500).json({
        status: 'error',
        msg: 'Such account not found!',
        data: {}
    });

    if(institution.members.includes(member.id)) 
    return res.status(500).json({
        status: 'error',
        msg: 'Member already added!',
        data: {}
    });

    institution.members.push(member.id);
    member.institutionIds.push(institution.id);
    member.isVerified = "true";

    member.save(member)
    .then(data => {
        console.log("User is updated!")
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    }); 

    institution.save(institution)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Institution members successfully updated',
            data: { institution: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    }); 

}

exports.delMembers = async function(req,res) {
    const institution = await Institution.findOne({ '_id': req.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!institution)
    return res.status(500).json({
        status: 'error',
        msg: 'Such account not found!',
        data: {}
    });

    var member = await User.findOne({ '_id': req.body.userId }, function (err, person) {
        if (err) 
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    if(!member)
    return res.status(500).json({
        status: 'error',
        msg: 'Such account not found!',
        data: {}
    });

    if(institution.members.includes(member.id)) {
        institution.members.pull(member.id);
        member.institutionIds.pull(institution.id);

        await member.save(member)
        .then(data => {
            console.log("User is updated!")
        }).catch(err => {
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! Error: ' + err.message,
                data: {}
            });
        }); 

        await institution.save(institution)
        .then(data => {
            return res.status(200).json({
                status: 'success',
                msg: 'Institution members successfully updated',
                data: { institution: data }
            });
        }).catch(err => {
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! Error: ' + err.message,
                data: {}
            });
        });

    } else {
        return res.status(500).json({
            status: 'error',
            msg: 'Such member is not affiliated',
            data: {}
        });
    } 

}

exports.currProjects = async function (req, res, next) {
    let institution  = await Institution.findOne({ '_id': req.body.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!institution) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });
    
    let projects = institution.projects;
    let currProjects = []

    for (var i = 0; i < projects.length; i++) {
        var project = await Projects.findOne({ '_id': projects[i] }, function (err, person) {
            if (err) return handleError(err);
        });
        
        if(!project) {
            institution.projects.pull(projects[i]);
        } else if(project.status === 'ongoing') {
            currProjects.push(project)
        }
    }

    institution.save(institution)
    .then().catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });   

    return res.status(200).json({
        status: 'success',
        msg: 'Current projects successfully retrieved',
        data: { currProjects: currProjects }
    });

}

exports.pastProjects = async function (req, res, next) {
    let institution  = await Institution.findOne({ '_id': req.body.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!institution) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });
    
    let projects = institution.projects;
    let pastProjects = []

    for (var i = 0; i < projects.length; i++) {
        var project = await Projects.findOne({ '_id': projects[i] }, function (err, person) {
            if (err) return handleError(err);
        });
        
        if(!project) {
            institution.projects.pull(projects[i]);
        } else if(project.status === 'completed') {
            pastProjects.push(project)
        }
    }

    institution.save(institution)
    .then().catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });   

    return res.status(200).json({
        status: 'success',
        msg: 'Past involvement successfully retrieved',
        data: { pastProjects: pastProjects }
    });

}

handleError = (err) => {
   console.log("handleError :"+ err)
}