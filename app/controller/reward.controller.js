const moment = require('moment-timezone')
const db = require('../models')
const Institution = db.institution
const User = db.users
const Reward = db.reward
const { default: ShortUniqueId } = require('short-unique-id');
const uid = new ShortUniqueId();
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const nodeCountries =  require("node-countries");
const Helper = require('../service/helper.service')
const sharp = require('sharp')
const CronJob = require('cron').CronJob;

var rewardStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = ""
        if(file.fieldname === "rewardImg")
            dir = 'public/uploads/rewards'
        else
            dir = 'public/uploads/rewards/verification'
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: async function (req, file, cb) {
        let extentsion = file.originalname.split('.')
        let thePath = ""
        if(file.fieldname === "rewardImg")
            thePath = "RewardPicture-"+req.id+"-"+Date.now()+'.'+extentsion[extentsion.length - 1]; 
        else 
            thePath = "RewardFile-"+req.id+"-"+Date.now()+'.'+extentsion[extentsion.length - 1];
        req.thePath = thePath;
        cb(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})
var uploadReward = multer({ 
    storage: rewardStorage,
    fileFilter: function(_req, file, cb){
        if(file.fieldname === "rewardImg")
            checkFileType(file, cb);
        else
            cb(null,true)
    }   
})

var createRewardStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = 'public/uploads/rewards'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: async function (req, file, cb) {
        let extentsion = file.originalname.split('.')
        let thePath = "RewardPicture-"+req.id+"-"+Date.now()+'.'+extentsion[extentsion.length - 1]; 
        req.thePath = thePath;
        cb(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})
var uploadCreateReward = multer({ 
    storage: createRewardStorage,
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

exports.multerRequestReward = uploadReward.fields([{
    name: 'rewardImg', maxCount: 1
  }, {
    name: 'rewardFile', maxCount: 1
  }]);

exports.multerCreateRequestReward = uploadCreateReward.single('rewardImg');

exports.requestReward = async function (req, res){
    let account; 

    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;

    if(!req.files.rewardFile)
    return res.status(500).json({
        status: 'error',
        msg: 'A file is needed for verification!',
        data: {}
    });

    if(req.type === "institution") {
        account = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!account)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(account.status != "active")
        return res.status(500).json({
            status: 'error',
            msg: 'Account is not authorized to perform project creation right now!',
            data: {}
        });
    } else if (req.type === "user") {
        account = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!account)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(account.isVerified != "true")
        return res.status(500).json({
            status: 'error',
            msg: 'Account not authorized to request reward! Not verified yet.',
            data: {}
        });
    }
    
    var pathString = ""
    if(req.files.rewardImg && req.files.rewardImg[0]) {
        sharp('./'+req.files.rewardImg[0].path).toBuffer().then(
            (data) => {
                sharp(data).resize(800).toFile('./'+req.files.rewardImg[0].path, (err,info) => {
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

        pathString = "/public/uploads/rewards/"+req.files.rewardImg[0].filename ;
    }

    var theDate = moment(req.body.endDate).tz('Asia/Singapore')
    
    if(theDate.isSameOrBefore(moment.tz('Asia/Singapore')))
    return res.status(500).json({
        status: 'error',
        msg: 'The end date is invalid! ',
        data: {}
    });

    const reward = new Reward({
		title: req.body.title,
        desc: req.body.desc,
        imgPath: pathString,
        point: req.body.point,
        quota: req.body.quota,
        status: "pending",
		sponsorId: req.id,
		sponsorType: req.type,
		country: req.body.country,
        minTier: req.body.minTier,
        endDate: theDate,
        verifyFile: "/public/uploads/rewards/verification/"+ req.files.rewardFile[0].filename
    });
    
    reward.save(reward)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Reward offer request successfully created',
            data: { reward: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.cancelReward = async function (req, res){
    let account; 

    if(req.type === "institution") {
        account = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!account)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(account.status != "active")
        return res.status(500).json({
            status: 'error',
            msg: 'Account is not authorized to perform project creation right now!',
            data: {}
        });
    } else if (req.type === "user") {
        account = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!account)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(account.isVerified != "true")
        return res.status(500).json({
            status: 'error',
            msg: 'Account not authorized to request reward! Not verified yet.',
            data: {}
        });
    }
    

    const reward = await Reward.findOne({ '_id': req.body.rewardId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
    });

    if(!reward)
    return res.status(500).json({
        status: 'error',
        msg: 'Such reward not found!',
        data: {}
    });
    
    if(reward.status != "pending")
    return res.status(500).json({
        status: 'error',
        msg: 'The reward is no longer pending!',
        data: {}
    });

    reward.status = "canceled"

    reward.save(reward)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Reward offer request successfully canceled',
            data: { reward: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.getRewardList = async function (req, res){
    const rewards = await Reward.find({ 'sponsorId': req.id, 'sponsorType':req.type }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
    });

    if(!rewards)
    return res.status(500).json({
        status: 'error',
        msg: 'Rewards not found!',
        data: {}
    });

    rewards.reverse()

    return res.status(200).json({
        status: 'success',
        msg: 'Reward Offer list successfully retrieved',
        data: { rewards: rewards }
    });
}

exports.getRewardDetail = async function (req, res){
    const reward = await Reward.findOne({ '_id':req.query.rewardId, 'sponsorId': req.id, 'sponsorType':req.type }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
    });

    if(!reward)
    return res.status(500).json({
        status: 'error',
        msg: 'Reward not found!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Reward Offer detail successfully retrieved',
        data: { reward: reward }
    });
}

exports.createReward = async function (req, res){
    let account; 

    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;

    account = await User.findOne({ '_id': req.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!account)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(500).json({
        status: 'error',
        msg: 'Only admin is authorized to perform this!',
        data: {}
    });
    
    var pathString = ""
    if(req.file) {
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

        pathString = "/public/uploads/rewards/"+req.thePath ;
    }

    var theDate = moment(req.body.endDate).tz('Asia/Singapore')
    
    if(theDate.isSameOrBefore(moment.tz('Asia/Singapore')))
    return res.status(500).json({
        status: 'error',
        msg: 'The end date is invalid! ',
        data: {}
    });

    const reward = new Reward({
		title: req.body.title,
        desc: req.body.desc,
        imgPath: pathString,
        point: req.body.point,
        quota: req.body.quota,
        status: "open",
		sponsorId: "",
		sponsorType: "external",
		country: req.body.country,
        minTier: req.body.minTier,
        endDate: theDate,
        verifyFile: ""
    });
    
    reward.save(reward)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Reward offer successfully created',
            data: { reward: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.updateReward = async function (req, res){
    let account; 

    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;

    account = await User.findOne({ '_id': req.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!account)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(500).json({
        status: 'error',
        msg: 'Only admin is authorized to perform this!',
        data: {}
    });

    var reward = await Reward.findOne({ '_id': req.body.rewardId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!reward)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such reward!',
        data: {}
    });
    
    var pathString = ""
    if(req.file) {
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

        pathString = "/public/uploads/rewards/"+req.thePath ;
    }

    var theDate = moment(req.body.endDate).tz('Asia/Singapore')
    
    if(theDate.isSameOrBefore(moment.tz('Asia/Singapore')))
    return res.status(500).json({
        status: 'error',
        msg: 'The end date is invalid! ',
        data: {}
    });

    if(req.body.quota < reward.claimedSum)
    return res.status(500).json({
        status: 'error',
        msg: 'The new quota is invalid! It is lower than the claimed number.',
        data: {}
    });

		reward.title = req.body.title
        reward.desc = req.body.desc
        reward.imgPath = pathString
        reward.point = req.body.point
        reward.quota = req.body.quota
		reward.country = req.body.country
        reward.minTier = req.body.minTier
        reward.endDate = theDate

    
    reward.save(reward)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Reward offer successfully updated',
            data: { reward: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.allReward = async function (req, res){
    let account; 

    account = await User.findOne({ '_id': req.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!account)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(500).json({
        status: 'error',
        msg: 'Only admin is authorized to perform this!',
        data: {}
    });
    
    const rewards = await Reward.find({ 'status': req.query.status }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving rewards!',
            data: {}
        });
    });

    if(!rewards) 
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such rewards!',
        data: {}
    });

    var theList = [];

    for(var i = 0; i < rewards.length; i++) {
        var reward = {
            id:"",
            title: "",
            desc: "",
            imgPath: "",
            point: "",
            quota: "",
            status: "",
            sponsorId: "",
            sponsorType: "",
            country: "",
            minTier: "",
            endDate: "",
            verifyFile: "",
            accountName: "",
            accountUsername: "",
            accountImgPath: ""
        }

        reward.id = rewards[i].id
        reward.title = rewards[i].title
        reward.desc = rewards[i].desc
        reward.imgPath = rewards[i].imgPath
        reward.point = rewards[i].point
        reward.quota = rewards[i].quota
        reward.status = rewards[i].status
        reward.sponsorId = rewards[i].sponsorId
        reward.sponsorType = rewards[i].sponsorType
        reward.country = rewards[i].country
        reward.minTier = rewards[i].minTier
        reward.endDate = rewards[i].endDate
        reward.verifyFile = rewards[i].verifyFile

        await getRequesterInfo(reward)
        if(reward.accountName === "" && reward.sponsorType != "external") continue

        theList.push(reward)
    }
    
    return res.status(200).json({
        status: 'success',
        msg: 'Reward offer successfully retrieved',
        data: { rewards: theList }
    });
}

exports.filteredReward = async function (req, res){
    let account; 

    let theCountry = nodeCountries.getCountryByName(req.query.country);
    req.query.country = theCountry.name;

    account = await User.findOne({ '_id': req.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!account)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(500).json({
        status: 'error',
        msg: 'Only admin is authorized to perform this!',
        data: {}
    });
    
    const rewards = await Reward.find({ 'status': req.query.status, 'country': req.query.country }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving rewards!',
            data: {}
        });
    });

    if(!rewards) 
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such rewards!',
        data: {}
    });

    var theList = [];

    for(var i = 0; i < rewards.length; i++) {
        var reward = {
            id:"",
            title: "",
            desc: "",
            imgPath: "",
            point: "",
            quota: "",
            status: "",
            sponsorId: "",
            sponsorType: "",
            country: "",
            minTier: "",
            endDate: "",
            verifyFile: "",
            accountName: "",
            accountUsername: "",
            accountImgPath: ""
        }

        reward.id = rewards[i].id
        reward.title = rewards[i].title
        reward.desc = rewards[i].desc
        reward.imgPath = rewards[i].imgPath
        reward.point = rewards[i].point
        reward.quota = rewards[i].quota
        reward.status = rewards[i].status
        reward.sponsorId = rewards[i].sponsorId
        reward.sponsorType = rewards[i].sponsorType
        reward.country = rewards[i].country
        reward.minTier = rewards[i].minTier
        reward.endDate = rewards[i].endDate
        reward.verifyFile = rewards[i].verifyFile

        await getRequesterInfo(reward)
        if(reward.accountName === "" && reward.sponsorType != "external") continue

        theList.push(reward)
    }
    
    return res.status(200).json({
        status: 'success',
        msg: 'Filtered reward offer successfully retrieved',
        data: { rewards: theList }
    });
}

exports.validateReward = async function (req, res){
    let account; 

    account = await User.findOne({ '_id': req.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!account)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(500).json({
        status: 'error',
        msg: 'Only admin is authorized to perform this!',
        data: {}
    });
    
    const reward = await Reward.findOne({ '_id': req.body.rewardId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving rewards!',
            data: {}
        });
    });

    if(!reward) 
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such reward!',
        data: {}
    });

    if(req.body.action === "approve")
        reward.status = "open"
    else
        reward.status = "rejected"

    reward.save(reward)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Reward offer successfully validated',
            data: { reward: data }
        });
     }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.deleteReward = async function (req, res){
    let account; 

    account = await User.findOne({ '_id': req.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!account)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(500).json({
        status: 'error',
        msg: 'Only admin is authorized to perform this!',
        data: {}
    });
    
    const reward = await Reward.findOne({ '_id': req.body.rewardId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving rewards!',
            data: {}
        });
    });

    if(!reward) 
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such reward!',
        data: {}
    });

    reward.status = "deleted"

    reward.save(reward)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Reward offer successfully deleted',
            data: { reward: data }
        });
     }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

async function getRequesterInfo(theItem) {
    var owner;

    if(theItem.sponsorType === "external") return
    if(theItem.sponsorType === "user") {
        owner = await User.findOne({ '_id': theItem.sponsorId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if (theItem.sponsorType === 'institution') {
        owner = await Institution.findOne({ '_id': theItem.sponsorId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!owner) {
        console.log("error: (getSponsorInfo) Such account not found!")
        return
    }

    theItem.accountImgPath = owner.ionicImg
    theItem.accountUsername = owner.username
    theItem.accountName = owner.name 
}

async function runRewardClearing() {
    const rewards = await Reward.find({ 'status': {$ne: 'close'} }, function (err) {
        if (err) console.log("error: "+err.message)
    });

    for(var i = 0; i < rewards.length; i++){
        var theDate = moment(rewards[i].endDate).tz('Asia/Singapore')
        if(theDate.isSameOrBefore(moment.tz('Asia/Singapore')) || rewards[i].claimedSum === rewards[i].quota){
            rewards[i].status = 'close'
            await rewards[i].save()
        }    

    }
}

exports.manualRewardClearing = async function (req, res){
    runRewardClearing()
    console.log("log: Manual reward clearing was triggered")
    
    return res.status(200).json({
        status: 'success',
        msg: 'Manual reward clearing was triggered!',
        data: {}
    });
}

new CronJob('6 0 * * *', async function () {
    runRewardClearing()
    console.log('log: Reward Clearing triggered')
  }, null, true, 'Asia/Singapore');