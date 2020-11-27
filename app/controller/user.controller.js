const moment = require('moment-timezone')
const db = require('../models')
const Users = db.users;
const Projects = db.project;
const Badges = db.badge;
const Institutions = db.institution;
const Feed = db.profilefeed
const Target = db.target
const nodeCountries = require('node-countries');
const fs = require('fs');
const multer = require('multer');
const nodeHtmlToImage = require('node-html-to-image');
const Helper = require('../service/helper.service');
const path = require('path')
const sharp = require('sharp')

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
        let thePath = 'ProfPic-User-'+req.id+Date.now()+'.'+extentsion[extentsion.length - 1]; 
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
        return res.status(400).json({
            status: 'error',
            msg: 'No picture uploaded! ',
            data: {}
        });
    }

    if(!user) {
        return res.status(400).json({
            status: 'error',
            msg: 'User not found! ',
            data: {}
        });
    }
    sharp('./'+req.file.path).toBuffer().then(
        (data) => {
            sharp(data).resize(800).toFile('./'+req.file.path, (err,info) => {
                if(err)
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong during image upload! ',
                    data: {}
                });
            });
        }
    ).catch(
        (err) => {
            console.log(err);
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong during upload! ',
                data: {}
            });
        }
    )
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
    var action = "Account updated profile picture"
    
    Helper.createAuditLog(action,req.type,req.id)
}

exports.updateUserProfile = async function (req, res, next) {
    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;
    console.log("reach here")
    const user = await Users.findOne({ '_id': req.body.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!user) 
    return res.status(400).json({
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
    user.salutation = req.body.salutation;
    user.SDGs = theSDGs;
    user.skills = theSkills;

    var targetIds = user.targets
    var theList = [];
    if(targetIds){
        for(var i = 0; i < targetIds.length; i++){
            var target = await Target.findOne({ '_id': targetIds[i] }, function (err) {
                if (err)
                return res.status(500).json({
                    status: 'error',
                    msg: 'There was an issue retrieving the target!',
                    data: {}
                });
            }); 

            if(theSDGs.includes(target.SDG)) theList.push(target.id)
        }
    }
    user.targets = theList
    
    user.save(user)
    .then(data => {
        var action = "Account updated profile"
    
        Helper.createAuditLog(action,req.type,req.id)
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
    return res.status(400).json({
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
    return res.status(400).json({
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
    return res.status(400).json({
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

    var action = "Account updated email"
    
    Helper.createAuditLog(action,req.type,req.id)

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
    return res.status(400).json({
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
    return res.status(400).json({
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
        "salutation": user.salutation || '',
        "skills": user.skills,
        "institutionIds": user.institutionIds,
        "projects": user.projects,
        "badges": user.badges,
        "SDGs": user.SDGs,
        "wallet": user.wallet,
        "ionicImg": user.ionicImg || '',
        "tier": user.tier
    }

    return res.status(200).json({
        status: 'success',
        msg: 'User profile successfully retrieved',
        data: { targetUser: theUser }
    });

}

exports.viewUserById = async function (req, res) {
    const user = await Users.findOne({ '_id': req.query.userId }, function (err) {
        if (err) return handleError(err);
    });

    if(!user) 
    return res.status(400).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });
    
    return res.status(200).json({
        status: 'success',
        msg: 'User profile successfully retrieved',
        data: { targetUser: user }
    });

}

exports.getFeeds = async function (req, res) {
    const feeds = await Feed.find({ 'accountId': req.query.userId, "accountType":"user" }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong!',
            data: {}
        });
    });

    if(!feeds) 
    return res.status(400).json({
        status: 'error',
        msg: 'Feeds not found!',
        data: {}
    });
    
    return res.status(200).json({
        status: 'success',
        msg: 'User profile feed successfully retrieved',
        data: { feeds: feeds }
    });

}

exports.getBadges = async function (req, res) {
    const user = await Users.findOne({ '_id': req.query.userId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong, please try again in a while!',
            data: {}
        });
    });

    if(!user) 
    return res.status(400).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });

    await checkBadges(user)

    let badges = await Badges.find({ 'accountId': req.query.userId, 'accountType':'user' }, function (err) {
        if (err) return handleError(err);
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Account\'s badges successfully retrieved',
        data: { badges: badges }
    });

}

async function checkBadges() {
    if(owner.points>=100) {
        const badge = await Badge.findOne({ 'accountId': contribution.contributor, 'accountType': contribution.contributorType, 'tier':'bronze' }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });

        if(badge) return

        const newBadge = new Badge({
            title : 'Bronze',
            description : 'Achieved this on ' + moment().tz('Asia/Singapore').format('YYYY-MM-DD'),
            imgPath : "/public/badges/bronze.png",
            accountId: contribution.contributor,
            accountType: contribution.contributorType,
            tier: 'bronze'
        })

        await newBadge.save(newBadge).catch(err => {
            console.log("Something went wrong when creating badge!")
        });

        owner.tier = 'bronze'
    }

    if(owner.points>=400) {
        const badge = await Badge.findOne({ 'accountId': contribution.contributor, 'accountType': contribution.contributorType, 'tier':'silver' }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });

        if(badge) return

        const newBadge = new Badge({
            title : 'Silver',
            description : 'Achieved this on ' + moment().tz('Asia/Singapore').format('YYYY-MM-DD'),
            imgPath : "/public/badges/silver.png",
            accountId: contribution.contributor,
            accountType: contribution.contributorType,
            tier: 'silver'
        })

        await newBadge.save(newBadge).catch(err => {
            console.log("Something went wrong when creating badge!")
        });

        owner.tier = 'silver'
    }

    if(owner.points>=800) {
        const badge = await Badge.findOne({ 'accountId': contribution.contributor, 'accountType': contribution.contributorType, 'tier':'gold' }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });

        if(badge) return

        const newBadge = new Badge({
            title : 'Gold',
            description : 'Achieved this on ' + moment().tz('Asia/Singapore').format('YYYY-MM-DD'),
            imgPath : "/public/badges/gold.png",
            accountId: contribution.contributor,
            accountType: contribution.contributorType,
            tier: 'gold'
        })

        await newBadge.save(newBadge).catch(err => {
            console.log("Something went wrong when creating badge!")
        });

        owner.tier = 'gold'
    }

    await owner.save().catch(err => {
        console.log("Something went wrong when saving account's tier!")
        return
    });
}

exports.getAffiliations = async function (req, res) {
    const user = await Users.findOne({ '_id': req.query.userId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong, please try again in a while!',
            data: {}
        });
    });

    if(!user) 
    return res.status(400).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });

    let institutionIds = user.institutionIds;

    let institutions = await Institutions.find({ '_id': { $in: institutionIds }}, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong, please try again in a while!',
            data: {}
        });
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Account\'s affiliated institutions successfully retrieved',
        data: { affiliations: institutions }
    });

}

exports.shareProfile = async function (req, res) {
    const user = await Users.findOne({ '_id': req.body.id }, function (err) {
        if (err) return handleError(err);
    });

    if(!user) 
    return res.status(400).json({
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