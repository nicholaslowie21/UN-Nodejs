const moment = require('moment-timezone')
const db = require('../models')
const User = db.users
const Institution = db.institution
const PaidResource = db.paidresource
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const nodeCountries =  require("node-countries")
const Helper = require("../service/helper.service")
const sharp = require('sharp')

var createPaidStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        let dir = 'public/uploads/resources/paidresources'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        callback(null, dir)
    },
    filename: (req, file, callback) => {
      const match = ["image/png", "image/jpeg"];
  
      if (match.indexOf(file.mimetype) === -1) {
        var message = `${file.originalname} is invalid. Only accept png/jpeg.`;
        return callback(message, null);
      }

      let extentsion = file.originalname.split('.')
      let thePath = 'PaidResourcesPic-'+req.id+"-"+Date.now()+'.'+extentsion[extentsion.length - 1]; 
      req.thePath.push('/public/uploads/resources/paidresources/'+thePath);
      callback(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})

var uploadCreatePaidResource = multer({ storage: createPaidStorage }).array("paidResourcesPics", 10);

exports.multerCreatePaidResource = uploadCreatePaidResource;

exports.createPaidResource = async function (req, res) {
    var theOwner = await getAccount(req.id,req.type)

    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;
    
    if(!theOwner) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    for(var i = 0; i < req.files.length; i++) {
        await sharp("./"+req.files[i].path).toBuffer().then(
            async data => {
                await sharp(data).resize(1000).toFile("./"+req.files[i].path, (err,info) => {
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
    }

    var price = Math.round((parseFloat(req.body.price)+Number.EPSILON)*100)/100
    
    if(price < 5)
    return res.status(500).json({
        status: 'error',
        msg: 'Price is too low! Not sufficient to cover transaction fee. Minimal: $5.',
        data: {}
    });

    const paidresource = new PaidResource({
		title: req.body.title,
        desc: req.body.desc,
        country: req.body.country,
        category: req.body.category,
        owner: theOwner.id,
        price: price,
		status: "active",
        ownerType: req.type,
        imgPaths: req.thePath
    });

    paidresource.save(paidresource)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Paid Resource successfully created',
            data: { paidresource: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    title = "Paid Resource"
    desc = "Listed a paid resource: " + paidresource.title
    accountId = theOwner.id
    accountType = req.type
        
    Helper.createProfileFeed(title,desc,accountId,accountType)
}

exports.updatePaidResource = async function (req, res) {
    var theOwner = await getAccount(req.id,req.type)

    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;
    
    if(!theOwner) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    var price = Math.round((parseFloat(req.body.price)+Number.EPSILON)*100)/100
    
    if(price < 5)
    return res.status(500).json({
        status: 'error',
        msg: 'Price is too low! Not sufficient to cover transaction fee. Minimal: $5.',
        data: {}
    });

    var paidresource = await PaidResource.findOne({ '_id': req.body.paidResourceId }, function (err) {
        if (err) 
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

   	paidresource.title = req.body.title
    paidresource.desc = req.body.desc
    paidresource.country = req.body.country
    paidresource.category = req.body.category
    paidresource.price = price

    paidresource.save(paidresource)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Paid Resource successfully updated',
            data: { paidresource: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

var paidResStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        let dir = 'public/uploads/resources/paidresource'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        callback(null, dir)
    },
    filename: (req, file, callback) => {
      const match = ["image/png", "image/jpeg"];
  
      if (match.indexOf(file.mimetype) === -1) {
        var message = `${file.originalname} is invalid. Only accept png/jpeg.`;
        return callback(message, null);
      }

      let extentsion = file.originalname.split('.')
      let thePath = 'PaidResourcePic-'+req.body.paidResourceId+"-"+Date.now()+'.'+extentsion[extentsion.length - 1]; 
      req.thePath.push('/public/uploads/resources/paidresource/'+thePath);
      callback(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
  });

var uploadPaidResPics = multer({ storage: paidResStorage }).array("paidResPics", 10);

exports.multerPaidResourcePic = uploadPaidResPics;

exports.uploadPaidResPic = async function (req, res){
    if(!req.body.paidResourceId) {
        return res.status(500).json({
            status: 'error',
            msg: 'Paid Resource id is empty! ',
            data: {}
        });
    }

    
    if(req.files.length === 0) {
        return res.status(500).json({
            status: 'error',
            msg: 'No picture uploaded! ',
            data: {}
        });
    }

    const paidresource = await PaidResource.findOne({ '_id': req.body.paidResourceId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!paidresource)
    return res.status(500).json({
        status: 'error',
        msg: 'Such paid resource does not exist!',
        data: {}
    });

    var theOwner = await getAccount(req.id,req.type)
    if(!theOwner)
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving owner!',
        data: {}
    });

    if(theOwner.id != paidresource.owner)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to perform this action!',
        data: {}
    });

    for(var i = 0; i < req.files.length; i++) {
        await sharp("./"+req.files[i].path).toBuffer().then(
            async data => {
                await sharp(data).resize(1000).toFile("./"+req.files[i].path, (err,info) => {
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
    }

    paidresource.imgPaths = paidresource.imgPaths.concat(req.thePath)

    paidresource.save(paidresource)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Paid resource picture successfully updated',
            data: { paidresource: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.deletePaidResourcePicture = async function (req, res){
    if(!req.body.paidResourceId) {
        return res.status(500).json({
            status: 'error',
            msg: 'Paid Resource id is empty! ',
            data: {}
        });
    }

    const paidresource = await PaidResource.findOne({ '_id': req.body.paidResourceId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!paidresource)
    return res.status(500).json({
        status: 'error',
        msg: 'Paid Resource does not exist!',
        data: {}
    });

    var theOwner = await getAccount(req.id, req.type)
    if(!theOwner)
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving owner!',
        data: {}
    });

    if(theOwner.id != paidresource.owner)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to perform this action!',
        data: {}
    });

    var oldList = paidresource.imgPaths
    var toDelete = req.body.indexes
    var newList = []

    for(var i = 0; i < oldList.length; i++) {
        if(!toDelete.includes(i))
            newList.push(oldList[i])
    }

    paidresource.imgPaths = newList;

    paidresource.save(paidresource)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Paid resource picture successfully deleted',
            data: { paidresource: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.statusPaidResource = async function (req, res){
    const paidresource = await PaidResource.findOne({ '_id': req.body.paidResourceId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!paidresource)
    return res.status(500).json({
        status: 'error',
        msg: 'Paid Resource does not exist!',
        data: {}
    });

    var theOwner = await getAccount(req.id, req.type)
    if(!theOwner)
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving owner!',
        data: {}
    });

    if(theOwner.id != paidresource.owner)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to perform this action!',
        data: {}
    });

    paidresource.status = req.body.status;

    paidresource.save(paidresource)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Paid resource status successfully updated!',
            data: { paidresource: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.paidResourceDetail = async function (req, res){
    const paidresource = await PaidResource.findOne({ '_id': req.query.paidResourceId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!paidresource)
    return res.status(500).json({
        status: 'error',
        msg: 'Paid Resource does not exist!',
        data: {}
    });

    var theOwner = await getAccount(paidresource.owner, paidresource.ownerType)
    
    if(!theOwner)
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving owner!',
        data: {}
    });

    var thepaidresource = JSON.parse(JSON.stringify(paidresource))
    thepaidresource.ownerName = theOwner.name
    thepaidresource.ownerUsername = theOwner.username
    thepaidresource.ownerImg = theOwner.ionicImg

    return res.status(200).json({
        status: 'success',
        msg: 'Paid resource detail successfully retrieved!',
        data: { paidresource: thepaidresource }
    });
}

exports.myPaidResources = async function (req, res){
    const paidresources = await PaidResource.find({ 'owner': req.id, 'ownerType': req.type, 'status': {$ne: 'deleted'} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!paidresources)
    return res.status(500).json({
        status: 'error',
        msg: 'Paid Resource does not exist!',
        data: {}
    });

    paidresources.reverse()

    return res.status(200).json({
        status: 'success',
        msg: 'My paid resources successfully retrieved!',
        data: { paidresource: paidresources }
    });
}

exports.othersPaidResources = async function (req, res){
    const paidresources = await PaidResource.find({ 'owner': req.query.accountId, 'ownerType': req.query.accountType, 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!paidresources)
    return res.status(500).json({
        status: 'error',
        msg: 'Paid Resource does not exist!',
        data: {}
    });

    paidresources.reverse()

    return res.status(200).json({
        status: 'success',
        msg: 'Account\'s paid resources successfully retrieved!',
        data: { paidresource: paidresources }
    });
}

async function getAccount(theId, theType) {
    var account;

    if(theType === "user") {
        account = await User.findOne({ '_id': theId }, function (err) {
            if (err) {
                console.log("error [paidresource]: (getAccount)" + err.toString())
                return
            }
        });
    } else if (theType === 'institution') {
        account = await Institution.findOne({ '_id': theId }, function (err) {
            if (err) {
                console.log("error [paidresource]: (getAccount)" + err.toString())
                return
            }
        });
    }

    if(!account) {
        console.log("Error: Something went wrong when retrieving account")
        return
    }

    return account
}