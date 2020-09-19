const moment = require('moment-timezone')
const db = require('../models')
const Institution = db.institution
const User = db.users;
const Projects = db.project;
const Badges = db.badge;
const nodeCountries = require('node-countries');
const fs = require('fs');
const multer = require('multer');
const csvtojson = require("csvtojson");
const nodeHtmlToImage = require('node-html-to-image');
const Helper = require('../service/helper.service');
const path = require('path');

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

var csvStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = 'public/uploads/membersCSV'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: async function (req, file, cb) {
        let extentsion = file.originalname.split('.')
        let thePath = 'MembersCSV-Institution-'+req.id+'.'+extentsion[extentsion.length - 1]; 
        req.theCSVPath = thePath;
        cb(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})
var uploadCSV = multer({ 
    storage: csvStorage,
    fileFilter: function(_req, file, cb){
        checkCSVFileType(file, cb);
    } 
})

function checkCSVFileType(file, cb){
    // Allowed ext
    const filetypes = /csv/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    // /const mimetype = filetypes.test(file.mimetype);
  
    if(extname){
      return cb(null,true);
    } else {
      cb('Error: CSV Only!');
    }
}

exports.csvMulter = uploadCSV.single('CSV');

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
    institution.ionicImg = "/public/uploads/profilePicture/"+req.thePath;

    institution.save(institution)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Account profile picture successfully updated',
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

exports.getMembers = async function(req,res) {
    const institution = await Institution.findOne({ '_id': req.query.institutionId }, function (err) {
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
                data: { user: data }
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
    let institution  = await Institution.findOne({ '_id': req.query.institutionId }, function (err, person) {
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
    let institution  = await Institution.findOne({ '_id': req.query.institutionId }, function (err, person) {
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

exports.membersCSVProcessing = async function (req, res, next) {
    const csvFilePath = req.file.path;

    console.log("here "+req.id)
    const institution = await Institution.findOne({ '_id': req.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!institution)
    return res.status(500).json({
        status: 'error',
        msg: 'Such account not found!',
        data: {}
    });

    var failedMember = [];

    institution.members = [];


    await csvtojson().fromFile(csvFilePath).then( async function (csvData) {
        if (fs.existsSync(csvFilePath)) {
            for (const obj of csvData) {
                
                if(!obj.memberUsername) {
                    return res.status(500).json({
                        status: 'error',
                        msg: 'File format is incorrect. Please check your file!',
                        data: {}
                    });
                }

                var member = await User.findOne({ 'username': obj.memberUsername }, function (err, person) {
                    if (err) 
                    return res.status(500).json({
                        status: 'error',
                        msg: 'Something went wrong! Error: ' + err.message,
                        data: {}
                    });
                });
            
                if(!member){
                    failedMember.push(obj.memberUsername)
                    continue;
                } else {
                    member.institutionIds.push(institution.id);
                    member.isVerified = "true";
                    institution.members.push(member.id);
    
                    member.save(member)
                    .then().catch(err => {
                        failedMember.push(obj.username);
                    });   

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
            
            fs.unlinkSync(csvFilePath)

            return res.status(200).json({
                status: 'success',
                msg: 'Members Affiliated updated successfully',
                data: { user: institution, failedMember: failedMember }
            });
        }
        else {
            res.json({
                status: 'error',
                masg: 'There was an issue in the upload please try again'
            });
        }
    }).catch(error => res.status(400).json({
        status: 'error',
        msg: error,
        data: {}
    }));
}

exports.viewInstitution = async function (req, res) {
    const institution = await Institution.findOne({ 'username': req.query.username }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!institution) 
    return res.status(500).json({
        status: 'error',
        msg: 'Institution not found!',
        data: {}
    });
    
    var theInstitution = {
        "id": institution.id,
        "name": institution.name,
        "username": institution.username,
        "email": institution.email,
        "phone": institution.phone,
        "status": institution.status,
        "bio": institution.bio || '',
        "address": institution.address || '',
        "isVerified": institution.isVerified,
        "profilePic": institution.profilePic,
        "country": institution.country,
        "website": institution.website || '',
        "members": institution.members,
        "projects": institution.projects,
        "SDGs": institution.SDGs,
        "ionicImg": institution.ionicImg || ''
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Institution profile successfully retrieved',
        data: { targetInstitution: theInstitution }
    });

}

exports.getBadges = async function (req, res) {
    const institution = await Institution.findOne({ '_id': req.query.institutionId }, function (err) {
        if (err) return handleError(err);
    });

    if(!institution) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    let badges = await Badges.find({ 'accountId': req.query.institutionId, 'accountType':'institution' }, function (err) {
        if (err) return handleError(err);
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Account\'s badges successfully retrieved',
        data: { badges: badges }
    });

}

exports.searchUsers = async function (req, res){

    var rgx = new RegExp(req.query.username, "i");
    
    const users = await User.find({ 'username': { $regex: rgx } }, function (err, person) {
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

exports.shareProfile = async function (req, res) {
    const institution = await Institution.findOne({ '_id': req.body.id }, function (err) {
        if (err) return handleError(err);
    });

    if(!institution) 
    return res.status(500).json({
        status: 'error',
        msg: 'Such account not found!',
        data: {}
    });

    let dir = 'public/shareProfile'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

    nodeHtmlToImage({
        output: 'public/shareProfile/Institution-'+institution.id+'.png',
        html: `<html>
        <body>
        <p> KoCoSD Profile </p>
        <p>
        Name: {{name}} <br>
        Username: {{username}} <br>
        Address: {{address}} <br>
        Phone: {{phone}} <br>
        Email: {{email}} <br>
        Bio: {{bio}} <br>
        Country: {{country}} <br>
        Website: {{website}} <br>
        SDGs: {{sdgs}} <br>
        </p>
        </body>
        </html>`,
        content: { 
            name: institution.name, 
            username: institution.username,
            address: institution.address,
            phone: institution.phone,
            email: institution.email,
            bio: institution.bio,
            country: institution.country,
            website: institution.website,
            sdgs: institution.SDGs.toString() 
        }
      })
        .then(() => console.log('The image was created successfully!'))

    var ourlocalip = Helper.getLocalIP();
    return res.status(200).json({
        status: 'success',
        msg: 'Account\'s picture for sharing generated successfully',
        data: { theLink: 'http://'+ourlocalip+':8081/public/shareProfile/Institution-'+institution.id+'.png' }
    });

}

handleError = (err) => {
   console.log("handleError :"+ err)
}