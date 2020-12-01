const moment = require('moment-timezone')
const db = require('../models')
const Institution = db.institution
const User = db.users
const Reward = db.reward
const Voucher = db.voucher
const { default: ShortUniqueId } = require('short-unique-id');
const uid = new ShortUniqueId();
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const nodeCountries =  require("node-countries");
const Helper = require('../service/helper.service')
const sharp = require('sharp')
const CronJob = require('cron').CronJob;
const randomstring = require("randomstring");

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
    return res.status(400).json({
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
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(account.status != "active")
        return res.status(400).json({
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
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(account.isVerified != "true")
        return res.status(400).json({
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

    var theDate = moment(req.body.endDate)
    
    if(theDate.isSameOrBefore(moment.tz('Asia/Singapore')))
    return res.status(400).json({
        status: 'error',
        msg: 'The end date is invalid! ',
        data: {}
    });
    
    var startDate = moment(req.body.startDate).tz('Asia/Singapore')
    if(startDate.isSameOrBefore(moment.tz('Asia/Singapore')))
    return res.status(400).json({
        status: 'error',
        msg: 'The start date is invalid! ',
        data: {}
    });

    if(theDate.isBefore(startDate))
    return res.status(400).json({
        status: 'error',
        msg: 'The start date is invalid! ',
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
        endDate: theDate.format("YYYY-MM-DD"),
        startDate: startDate.format("YYYY-MM-DD"),
        verifyFile: "/public/uploads/rewards/verification/"+ req.files.rewardFile[0].filename
    });
    
    reward.save(reward)
    .then(data => {
        var action = "Account offered a reward request "+ data.title +" ("+data.id+")"
    
        Helper.createAuditLog(action,req.type,req.id)
            
        action = "Reward request is offered"
        Helper.createAuditLog(action,"reward",data.id)

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
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(account.status != "active")
        return res.status(400).json({
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
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(account.isVerified != "true")
        return res.status(400).json({
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
    return res.status(400).json({
        status: 'error',
        msg: 'Such reward not found!',
        data: {}
    });
    
    if(reward.status != "pending")
    return res.status(400).json({
        status: 'error',
        msg: 'The reward is no longer pending!',
        data: {}
    });

    reward.status = "canceled"

    reward.save(reward)
    .then(data => {
        var action = "Account cancelled a reward offer request"+ data.title +" ("+data.id+")"
    
        Helper.createAuditLog(action,req.type,req.id)

        action = "Reward request is canceled"
        Helper.createAuditLog(action,"reward",data.id)

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
    return res.status(400).json({
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

exports.getMarketplace = async function (req, res){
    const rewards = await Reward.find({ 'status':'open' }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
    });

    if(!rewards)
    return res.status(400).json({
        status: 'error',
        msg: 'Rewards not found!',
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
            accountImgPath: "",
            createdAt:"",
            claimedNum: 0,
            startDate:"",
            externalName:""
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
        reward.createdAt = rewards[i].createdAt
        reward.claimedNum = rewards[i].claimedNum
        reward.startDate = rewards[i].startDate
        reward.externalName = rewards[i].externalName

        await getRequesterInfo(reward)
        if(reward.accountName === "" && reward.sponsorType != "external") continue

        theList.push(reward)
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Reward marketplace list successfully retrieved',
        data: { rewards: theList }
    });
}

exports.getFilteredMarketplace = async function (req, res){
    const rewards = await Reward.find({ 'status':'open', 'minTier':req.query.tier }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
    });

    if(!rewards)
    return res.status(400).json({
        status: 'error',
        msg: 'Rewards not found!',
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
            accountImgPath: "",
            createdAt:"",
            claimedNum: 0,
            startDate:"",
            externalName:""
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
        reward.createdAt = rewards[i].createdAt
        reward.claimedNum = rewards[i].claimedNum
        reward.startDate = rewards[i].startDate
        reward.externalName = rewards[i].externalName

        await getRequesterInfo(reward)
        if(reward.accountName === "" && reward.sponsorType != "external") continue

        theList.push(reward)
    }

    theList.sort(function(a, b){
        var aTime = a.updatedAt
        var bTime = b.updatedAt
        if(moment(aTime).isBefore(moment(bTime)) ) 
            return 1
        else
            return -1      
    })

    return res.status(200).json({
        status: 'success',
        msg: ' Filtered reward marketplace list successfully retrieved',
        data: { rewards: theList }
    });
}

exports.redeemReward = async function (req, res){
    const reward = await Reward.findOne({ '_id':req.body.rewardId, 'status':'open' }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
    });

    if(!reward)
    return res.status(400).json({
        status: 'error',
        msg: 'Such valid reward not found!',
        data: {}
    });

    if(reward.claimedNum >= reward.quota) {
        return res.status(400).json({
            status: 'error',
            msg: 'Reward not found!',
            data: {}
        });

    }

    var theOwner = await User.findOne({ '_id': req.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
        
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    var tierLevel = 0

    if(theOwner.tier === 'bronze') tierLevel = 1
    else if(theOwner.tier === 'silver') tierLevel = 2
    else if(theOwner.tier === 'gold') tierLevel = 3
    
    var targetTierLevel = 0
    if(reward.minTier === 'bronze') targetTierLevel = 1
    else if(reward.minTier === 'silver') targetTierLevel = 2
    else if(reward.minTier === 'gold') targetTierLevel = 3

    if(tierLevel<targetTierLevel)
    return res.status(400).json({
        status: 'error',
        msg: 'Your account tier is not eligible!',
        data: {}
    });

    if(reward.point > theOwner.wallet)
    return res.status(400).json({
        status: 'error',
        msg: 'Your account wallet point is not sufficient!',
        data: {}
    });

    reward.claimedNum = reward.claimedNum + 1
    if(reward.claimedNum >= reward.quota) reward.status = 'close'
    reward.save().catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    theOwner.wallet = theOwner.wallet - reward.point
    theOwner.save().catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    let voucherCode = randomstring.generate({ length: 5, charset:'alphabetic', capitalization:'uppercase' })

    const voucher = new Voucher({
        rewardId: reward.id,
        code: voucherCode,
        status: 'active',
        userId: theOwner.id,
        endDate: reward.endDate
    });

    voucher.save(voucher)
    .then(data => {
        var action = "Account redeemed a reward "+ reward.title +" ("+reward.id+")"
    
        Helper.createAuditLog(action,req.type,req.id)

        action = "Reward is redeemed by " + theOwner.username +" (username) "
        action =+ "voucher: "+voucher.code+" ("+data.id+")"
        Helper.createAuditLog(action,"reward",data.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Reward successfully redeemed!',
            data: { voucher: data}
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
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
    return res.status(400).json({
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

exports.getMarketplaceRewardDetail = async function (req, res){
    const theReward = await Reward.findOne({ '_id':req.query.rewardId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
    });

    if(!theReward)
    return res.status(400).json({
        status: 'error',
        msg: 'Reward not found!',
        data: {}
    });

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
        accountImgPath: "",
        createdAt:"",
        startDate:"",
        externalName:""
    }

    reward.id = theReward.id
    reward.title = theReward.title
    reward.desc = theReward.desc
    reward.imgPath = theReward.imgPath
    reward.point = theReward.point
    reward.quota = theReward.quota
    reward.status = theReward.status
    reward.sponsorId = theReward.sponsorId
    reward.sponsorType = theReward.sponsorType
    reward.country = theReward.country
    reward.minTier = theReward.minTier
    reward.endDate = theReward.endDate
    reward.verifyFile = theReward.verifyFile
    reward.createdAt = theReward.createdAt
    reward.startDate = theReward.startDate
    reward.externalName = theReward.externalName

    await getRequesterInfo(reward)
    if(reward.accountName === "" && reward.sponsorType != "external") 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving the sponsor info!',
        data: { }
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Reward detail successfully retrieved',
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
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(400).json({
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
    return res.status(400).json({
        status: 'error',
        msg: 'The end date is invalid! ',
        data: {}
    });

    var startDate = moment(req.body.startDate).tz('Asia/Singapore')
    if(startDate.isSameOrBefore(moment.tz('Asia/Singapore')))
    return res.status(400).json({
        status: 'error',
        msg: 'The start date is invalid! ',
        data: {}
    });

    if(theDate.isBefore(startDate))
    return res.status(400).json({
        status: 'error',
        msg: 'The start date is invalid! ',
        data: {}
    });

    const reward = new Reward({
		title: req.body.title,
        desc: req.body.desc,
        imgPath: pathString,
        point: req.body.point,
        quota: req.body.quota,
        status: "accepted",
		sponsorId: "",
		sponsorType: "external",
		country: req.body.country,
        minTier: req.body.minTier,
        endDate: theDate.format("YYYY-MM-DD"),
        verifyFile: "",
        startDate: startDate.format("YYYY-MM-DD"),
        externalName: req.body.externalName
    });
    
    reward.save(reward)
    .then(data => {
        var action = "Account created a reward "+ data.title +" ("+data.id+")"
    
        Helper.createAuditLog(action,"admin",req.id)

        action = "Reward is created"
        Helper.createAuditLog(action,"reward",data.id)

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
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(400).json({
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
    return res.status(400).json({
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

    var theDate = moment(req.body.endDate) 
    if(theDate.isSameOrBefore(moment.tz('Asia/Singapore')))
    return res.status(400).json({
        status: 'error',
        msg: 'The end date is invalid! ',
        data: {}
    });

    var startDate;
    if(reward.status != 'open') {
        startDate = moment(req.body.startDate).tz('Asia/Singapore')
        if(startDate.isSameOrBefore(moment.tz('Asia/Singapore')))
        return res.status(400).json({
            status: 'error',
            msg: 'The start date is invalid! ',
            data: {}
        });
    }

    if(req.body.quota < reward.claimedSum)
    return res.status(400).json({
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
        reward.endDate = theDate.format("YYYY-MM-DD")

        if(reward.status != 'active') {
            reward.startDate = startDate.format("YYYY-MM-DD")
        }
    reward.save(reward)
    .then(data => {
        var action = "Account updated a reward "+ data.title +" ("+data.id+")"
    
        Helper.createAuditLog(action,"admin",req.id)

        action = "Reward detail is updated"
        Helper.createAuditLog(action,"reward",data.id)

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
            accountImgPath: "",
            createdAt:"",
            startDate:"",
            externalName:""
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
        reward.createdAt = rewards[i].createdAt
        reward.startDate = rewards[i].startDate
        reward.externalName = rewards[i].externalName

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

exports.getVoucher = async function (req, res){
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
    
    const vouchers = await Voucher.find({ 'status': req.query.status, 'userId':req.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving vouchers!',
            data: {}
        });
    });

    if(!vouchers) 
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such vouchers!',
        data: {}
    });

    var theList = [];

    for(var i = 0; i < vouchers.length; i++) {
        var voucher = {
            id:"",
            rewardId: "",
            code: "",
            status: "",
            userId: "",
            claimedAt: "",
            endDate: "",
            createdAt: "",
            rewardTitle: "",
            rewardDesc:"",
            rewardImgPath:"",
            rewardCountry:""
        }

        voucher.id = vouchers[i].id
        voucher.rewardId = vouchers[i].rewardId
        voucher.code = vouchers[i].code
        voucher.status = vouchers[i].status
        voucher.userId = vouchers[i].userId
        voucher.claimedAt = vouchers[i].claimedAt
        voucher.endDate = vouchers[i].endDate
        voucher.createdAt = vouchers[i].createdAt
        
        await getRewardInfo(voucher)
        if(voucher.rewardTitle === "" ) continue

        theList.push(voucher)
    }
    
    theList.sort(function(a, b){
        var aTime = a.updatedAt
        var bTime = b.updatedAt
        if(moment(aTime).isBefore(moment(bTime)) ) 
            return 1
        else
            return -1      
    })

    return res.status(200).json({
        status: 'success',
        msg: 'Voucher successfully retrieved',
        data: { vouchers: theList }
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
            accountImgPath: "",
            createdAt:"",
            startDate:"",
            externalName:""
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
        reward.createdAt = rewards[i].createdAt
        reward.startDate = rewards[i].startDate
        reward.externalName = rewards[i].externalName

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
        reward.status = "accepted"
    else
        reward.status = "rejected"

    reward.save(reward)
    .then(data => {
        var action = "Account validated a reward request "+ data.title +" ("+data.id+") action: "+data.status
    
        Helper.createAuditLog(action,"admin",req.id)
        
        action = "Reward request is validated, action: "+data.status
        Helper.createAuditLog(action,"reward",data.id)

        Helper.createNotification("Reward", "Your request: "+ data.title + " status has been updated to "+reward.status, reward.sponsorId, reward.sponsorType)

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
        var action = "Account deleted a reward "+ data.title +" ("+data.id+")"
    
        Helper.createAuditLog(action,"admin",req.id)

        action = "Reward is deleted"
        Helper.createAuditLog(action,"reward",data.id)

        Helper.createNotification("Reward", "Your reward: "+ data.title + " has been deleted ", data.sponsorId, data.sponsorType)

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

exports.claimVoucher = async function (req, res){
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
    
    const voucher = await Voucher.findOne({ '_id': req.body.voucherId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving voucher!',
            data: {}
        });
    });

    if(!voucher) 
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such voucher!',
        data: {}
    });

    if(voucher.userId != req.id)
    return res.status(500).json({
        status: 'error',
        msg: 'This voucher is not yours!',
        data: {}
    });

    voucher.status = "claimed"
    voucher.claimedAt = moment().tz("Asia/Singapore")
    
    voucher.save(voucher)
    .then(data => {
        var action = "Account claimed a voucher "+ voucher.title +" ("+data.id+")"
    
        Helper.createAuditLog(action,req.type,req.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Voucher successfully claimed',
            data: { voucher: data }
        });
     }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.transferVoucher = async function (req, res){
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
    
    const voucher = await Voucher.findOne({ '_id': req.body.voucherId, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving voucher!',
            data: {}
        });
    });

    if(!voucher) 
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such active voucher!',
        data: {}
    });

    if(voucher.userId != req.id)
    return res.status(500).json({
        status: 'error',
        msg: 'This voucher is not yours!',
        data: {}
    });

    targetAccount = await User.findOne({ '_id': req.body.targetId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!targetAccount)
    return res.status(500).json({
        status: 'error',
        msg: 'The target account does not exists!',
        data: {}
    });

    voucher.userId = req.body.targetId

    voucher.save(voucher)
    .then(data => {
        var action = "Account transferred a voucher "+ voucher.title +" ("+voucher.id+") "
        action +="to :"+ targetAccount.username + " ("+targetAccount.id+")"
        Helper.createAuditLog(action,req.type,req.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Voucher successfully transferred',
            data: { voucher: data }
        });
     }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    Helper.createNotification("Reward", account.username+" transferred you a voucher "+ voucher.title, targetAccount.id, "user")
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

async function getRewardInfo(theItem) {
    var reward = await Reward.findOne({ '_id': theItem.rewardId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    

    if(!reward) {
        console.log("error: (getRewardInfo) Such reward not found!")
        return
    }

    theItem.rewardTitle = reward.title
    theItem.rewardDesc = reward.desc
    theItem.rewardImgPath = reward.imgPath
    theItem.rewardCountry = reward.country
}

// to activate and deactivate reward based on the dates
async function runRewardClearing() {
    const rewards = await Reward.find({ 'status': {$ne: 'close'} }, function (err) {
        if (err) console.log("error: "+err.message)
    });

    for(var i = 0; i < rewards.length; i++){
        if(rewards[i].status === 'accepted') {
            var startDate = moment(rewards[i].startDate).tz('Asia/Singapore')
            if(startDate.isSameOrBefore(moment.tz('Asia/Singapore'))) {
                rewards[i].status = 'open'
                await rewards[i].save()
            }
        
        }
        
        var theDate = moment(rewards[i].endDate).tz('Asia/Singapore')
        if(theDate.isBefore(moment.tz('Asia/Singapore')) || rewards[i].claimedSum === rewards[i].quota){
            rewards[i].status = 'close'
            await rewards[i].save()
        }
    }
}

async function runVoucherClearing() {
    const vouchers = await Voucher.find({ 'status': {$ne: 'close'} }, function (err) {
        if (err) console.log("error: "+err.message)
    });

    for(var i = 0; i < vouchers.length; i++){
        var theDate = moment(vouchers[i].endDate).tz('Asia/Singapore')
        if(theDate.isBefore(moment.tz('Asia/Singapore'))){
            vouchers[i].status = 'close'
            await vouchers[i].save()
        }    

    }
}

exports.manualRewardClearing = async function (req, res){
    runRewardClearing()
    runVoucherClearing()
    console.log("log: Manual reward and voucher clearing was triggered")
    
    return res.status(200).json({
        status: 'success',
        msg: 'Manual reward and voucher clearing was triggered!',
        data: {}
    });
}

new CronJob('6 0 * * *', async function () {
    runRewardClearing()
    runVoucherClearing()
    console.log('log: Reward and Voucher Clearing triggered')
  }, null, true, 'Asia/Singapore');