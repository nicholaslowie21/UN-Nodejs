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
var uploadReward = multer({ 
    storage: rewardStorage,
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

exports.multerRequestReward = uploadReward.single('rewardImg');

exports.requestReward = async function (req, res){
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

        pathString = "/public/uploads/rewards/"+req.thePath;
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
        endDate: theDate
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

async function runRewardClearing() {
    const rewards = await Reward.find({ 'status': 'open' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    for(var i = 0; i < rewards.length; i++){
        var theDate = moment(rewards[i].endDate).tz('Asia/Singapore')
        if(theDate.isSameOrBefore(moment.tz('Asia/Singapore')) || rewards[i].claimedSum === rewards[i].quota){
            rewards[i].status = 'close'
            await rewards[i].save()
        }    

    }
}

new CronJob('6 0 * * *', async function () {
    runRewardClearing()
    console.log('Reward Clearing triggered')
  }, null, true, 'Asia/Singapore');