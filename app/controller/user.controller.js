const moment = require('moment-timezone')
const db = require('../models')
const Users = db.users;
const Projects = db.project;
const Badges = db.badge;
const nodeCountries = require('node-countries');
const fs = require('fs');
const multer = require('multer');
const nodeHtmlToImage = require('node-html-to-image');
const Helper = require('../service/helper.service');
const path = require('path')

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
        let thePath = 'ProfPic-User-'+req.id+'.'+extentsion[extentsion.length - 1]; 
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

exports.multerUpload = upload.single('profilePic');

exports.profilePicture = async function (req, res){
    const user = await Users.findOne({ '_id': req.id }, function (err, person) {
        if (err) return handleError(err);
    });
    
    if(!req.file) {
        return res.status(500).json({
            status: 'error',
            msg: 'No picture uploaded! ',
            data: {}
        });
    }

    if(!user) {
        return res.status(500).json({
            status: 'error',
            msg: 'User not found! ',
            data: {}
        });
    }

    user.profilePic = 'https://localhost:8080/public/uploads/profilePicture/'+req.thePath;
    user.ionicImg = "/public/uploads/profilePicture/"+req.thePath;

    user.save(user)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'User profile picture successfully updated',
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

exports.updateUserProfile = async function (req, res, next) {
    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;
    console.log("reach here")
    const user = await Users.findOne({ '_id': req.body.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!user) 
    return res.status(500).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });

    var tempSDGs = req.body.SDGs;
    
    var theSDGs = [];

    tempSDGs.forEach(sdg => {
        if(!theSDGs.includes(sdg))
            theSDGs.push(sdg);
    })

    theSDGs.sort(function(a, b){return a - b});

    var tempSkills = req.body.skills;
    var theSkills = [];

    tempSkills.forEach(skill => {
        if(!theSkills.includes(skill))
            theSkills.push(skill);
    })

    theSkills.sort();

    user.name = req.body.name;
    user.bio = req.body.bio;
    user.occupation = req.body.occupation;
    user.country = req.body.country;
    user.website = req.body.website;
    user.gender = req.body.gender;
    user.SDGs = theSDGs;
    user.skills = theSkills;

    user.save(user)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'User profile successfully updated',
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

exports.updateUsername = async function (req, res, next) {
    const user = await Users.findOne({ '_id': req.body.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!user) 
    return res.status(500).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });
    
    user.username = req.body.username;

    user.save(user)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'User username successfully updated',
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

exports.updateEmail = async function (req, res, next) {
    const user = await Users.findOne({ '_id': req.body.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!user) 
    return res.status(500).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });
    
    user.email = req.body.email;

    user.save(user)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'User email successfully updated',
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

exports.currProjects = async function (req, res, next) {
    const user = await Users.findOne({ '_id': req.query.userId }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!user) 
    return res.status(500).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });
    
    let projects = user.projects;
    let currProjects = []

    for (var i = 0; i < projects.length; i++) {
        var project = await Projects.findOne({ '_id': projects[i] }, function (err, person) {
            if (err) return handleError(err);
        });
        
        if(!project) {
            user.projects.pull(projects[i]);
        } else if(project.status === 'ongoing') {
            currProjects.push(project)
        }
    }

    user.save(user)
    .then().catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });   

    return res.status(200).json({
        status: 'success',
        msg: 'Current Projects successfully retrieved',
        data: { currProjects: currProjects }
    });

}

exports.pastProjects = async function (req, res, next) {
    const user = await Users.findOne({ '_id': req.query.userId }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!user) 
    return res.status(500).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });
    
    let projects = user.projects;
    let pastProjects = []

    for (var i = 0; i < projects.length; i++) {
        var project = await Projects.findOne({ '_id': projects[i] }, function (err, person) {
            if (err) return handleError(err);
        });
        
        if(!project) {
            user.projects.pull(projects[i]);
        } else if(project.status === 'completed') {
            pastProjects.push(project)
        }
    }

    user.save(user)
    .then().catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });   

    return res.status(200).json({
        status: 'success',
        msg: 'Current Projects successfully retrieved',
        data: { pastProjects: pastProjects }
    });

}

exports.viewUser = async function (req, res) {
    const user = await Users.findOne({ 'username': req.query.username }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!user) 
    return res.status(500).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });
    
    var theUser = {
        "id":user.id,
        "name": user.name,
        "username": user.username,
        "email": user.email,
        "bio": user.bio || '',
        "role": user.role,
        "status": user.status,
        "occupation": user.occupation || '',
        "isVerified": user.isVerified,
        "profilePic": user.profilePic,
        "country": user.country,
        "website": user.website || '',
        "points": user.points,
        "gender": user.gender,
        "skills": user.skills,
        "institutionIds": user.institutionIds,
        "projects": user.projects,
        "badges": user.badges,
        "SDGs": user.SDGs,
        "wallet": user.wallet,
        "ionicImg": user.ionicImg || ''
    }

    return res.status(200).json({
        status: 'success',
        msg: 'User profile successfully retrieved',
        data: { targetUser: theUser }
    });

}

exports.getBadges = async function (req, res) {
    const user = await Users.findOne({ '_id': req.query.userId }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!user) 
    return res.status(500).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });

    let badges = await Badges.find({ 'accountId': req.body.id, 'accountType':'user' }, function (err, person) {
        if (err) return handleError(err);
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Account\'s badges successfully retrieved',
        data: { badges: badges }
    });

}

exports.shareProfile = async function (req, res) {
    const user = await Users.findOne({ '_id': req.body.id }, function (err) {
        if (err) return handleError(err);
    });

    if(!user) 
    return res.status(500).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });

    let dir = 'public/shareProfile'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

    nodeHtmlToImage({
        output: 'public/shareProfile/'+user.id+'.png',
        html: `<html>
        <body>
        <p> KoCoSD Profile </p>
        <p>
        Name: {{name}} <br>
        Username: {{username}} <br>
        Email: {{email}} <br>
        Bio: {{bio}} <br>
        Occupation: {{occupation}} <br>
        Country: {{country}} <br>
        Website:  {{website}} <br>
        SDGs: {{sdgs}} <br>
        </p>
        </body>
        </html>`,
        content: { 
            name: user.name, 
            username: user.username,
            email: user.email,
            bio: user.bio,
            occupation: user.occupation,
            country: user.country,
            website: user.website,
            sdgs: user.SDGs.toString() 
        }
      })
        .then(() => console.log('The image was created successfully!'))

    var ourlocalip = Helper.getLocalIP();
    return res.status(200).json({
        status: 'success',
        msg: 'Account\'s picture for sharing generated successfully',
        data: { theLink: 'http://'+ourlocalip+':8081/public/shareProfile/'+user.id+'.png' }
    });

}

handleError = (err) => {
    console.log("handleError :"+ err)
 }