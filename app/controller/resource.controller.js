const moment = require('moment-timezone')
const db = require('../models')
const Manpower = db.manpower
const User = db.users
const Knowledge = db.knowledge
const Item = db.item
const Venue = db.venue
const Institution = db.institution
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const nodeCountries =  require("node-countries")
const Helper = require("../service/helper.service")
const sharp = require('sharp')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = 'public/uploads/resources/item'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: async function (req, file, cb) {
        let extentsion = file.originalname.split('.')
        let thePath = 'ItemPic-'+req.body.itemId+Date.now()+'.'+extentsion[extentsion.length - 1]; 
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

var itemStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        let dir = 'public/uploads/resources/item'
        
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
      let thePath = 'ItemPic-'+req.body.itemId+"-"+Date.now()+'.'+extentsion[extentsion.length - 1]; 
      req.thePath.push('/public/uploads/resources/item/'+thePath);
      callback(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
  });

var uploadItemPics = multer({ storage: itemStorage }).array("itemPics", 10);

exports.multerItemPicUpload = uploadItemPics;

var IPStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = 'public/uploads/resources/IP'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: async function (req, file, cb) {
        let extentsion = file.originalname.split('.')
        let thePath = extentsion[0]+"-"+req.id+Date.now()+'.'+extentsion[extentsion.length - 1]; 
        req.thePath = thePath;
        cb(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})
var uploadIPAttachment = multer({ storage: IPStorage  })

exports.multerIPUpload = uploadIPAttachment.single('attachment');

exports.itemPicture = async function (req, res){
    if(!req.body.itemId) {
        return res.status(400).json({
            status: 'error',
            msg: 'Item id is empty! ',
            data: {}
        });
    }

    
    if(req.files.length === 0) {
        return res.status(400).json({
            status: 'error',
            msg: 'No picture uploaded! ',
            data: {}
        });
    }

    const item = await Item.findOne({ '_id': req.body.itemId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such item resource!',
            data: {}
        });
    });

    if(!item)
    return res.status(400).json({
        status: 'error',
        msg: 'Item does not exists!',
        data: {}
    });

    var theOwner;

    if(req.type === "institution") {
        const institution = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(400).json({
            status: 'error',
            msg: 'Account is not authorized to perform this action right now!',
            data: {}
        });

        theOwner = institution
    } else if (req.type === "user") {
        const user = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
        theOwner = user
    }

    if(theOwner.id!=item.owner)
    return res.status(400).json({
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

    item.imgPath = item.imgPath.concat(req.thePath)

    item.save(item)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Item picture successfully updated',
            data: { item: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account added pictures for Item Resource: "+ item.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.IPupload = async function (req, res){
    if(!req.body.knowledgeId) {
        return res.status(400).json({
            status: 'error',
            msg: 'Knowledge id is empty! ',
            data: {}
        });
    }

    
    if(!req.file) {
        return res.status(400).json({
            status: 'error',
            msg: 'No file uploaded! ',
            data: {}
        });
    }

    const knowledge = await Knowledge.findOne({ '_id': req.body.knowledgeId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such knowledge resource!',
            data: {}
        });
    });

    if(!knowledge)
    return res.status(400).json({
        status: 'error',
        msg: 'Knowledge does not exists!',
        data: {}
    });

    var theOwner;

    if(req.type === "institution") {
        const institution = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(400).json({
            status: 'error',
            msg: 'Account is not authorized to perform this action right now!',
            data: {}
        });

        theOwner = institution
    } else if (req.type === "user") {
        const user = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
        theOwner = user
    }

    var valid = false;
    for(var i = 0; i < knowledge.owner.length; i++) {
        if(theOwner.id === knowledge.owner[i].theId) {
            valid = true;
            break;
        }
    }
    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to upload file for this knowledge resource',
        data: {}
    });

    knowledge.attachment = "/public/uploads/resources/IP/"+req.thePath;

    knowledge.save(knowledge)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Knowledge attachment successfully updated',
            data: { knowledge: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account uploaded an attachment for Knowledge Resource: "+ knowledge.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.viewUserKnowledge = async function (req, res) {
    const user = await User.findOne({ '_id': req.query.userId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!user) 
    return res.status(400).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });
    
    const knowledges = await Knowledge.find({ 'owner.theId': user.id, 'owner.ownerType': 'user', 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!knowledges) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Knowledge resource successfully retrieved',
        data: { knowledges: knowledges }
    });
}

exports.viewPrivateUserKnowledge = async function (req, res) {
    const user = await User.findOne({ '_id': req.body.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!user) 
    return res.status(400).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });
    
    const knowledges = await Knowledge.find({ 'owner.theId': user.id, 'owner.ownerType': 'user', 'status': {$ne: 'deleted'} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!knowledges) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Private knowledge resource successfully retrieved',
        data: { knowledges: knowledges }
    });
}

exports.viewUserManpower = async function (req, res) {
    const user = await User.findOne({ '_id': req.query.userId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!user) 
    return res.status(400).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });
    
    const manpowers = await Manpower.find({ 'owner': user.id, 'ownerType': 'user', 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!manpowers) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Manpower resource successfully retrieved',
        data: { manpowers: manpowers }
    });
}

exports.viewPrivateUserManpower = async function (req, res) {
    const user = await User.findOne({ '_id': req.body.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!user) 
    return res.status(400).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });
    
    const manpowers = await Manpower.find({ 'owner': user.id, 'ownerType': 'user', 'status': {$ne: 'deleted'} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!manpowers) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Private manpower resource successfully retrieved',
        data: { manpowers: manpowers }
    });
}

exports.viewUserItem = async function (req, res) {
    const user = await User.findOne({ '_id': req.query.userId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!user) 
    return res.status(400).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });
    
    const items = await Item.find({ 'owner': user.id, 'ownerType': 'user', 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!items) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Item resource successfully retrieved',
        data: { items: items }
    });
}

exports.viewPrivateUserItem = async function (req, res) {
    const user = await User.findOne({ '_id': req.body.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!user) 
    return res.status(400).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });
    
    const items = await Item.find({ 'owner': user.id, 'ownerType': 'user', 'status':{ $ne: 'deleted'} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!items) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Private item resource successfully retrieved',
        data: { items: items }
    });
}

exports.viewUserVenue = async function (req, res) {
    const user = await User.findOne({ '_id': req.query.userId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!user) 
    return res.status(400).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });
    
    const venues = await Venue.find({ 'owner': user.id, 'ownerType': 'user', 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!venues) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Venue resource successfully retrieved',
        data: { venues: venues }
    });
}

exports.viewPrivateUserVenue = async function (req, res) {
    const user = await User.findOne({ '_id': req.body.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!user) 
    return res.status(400).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });
    
    const venues = await Venue.find({ 'owner': user.id, 'ownerType': 'user', 'status':{ $ne: 'deleted'} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!venues) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Private venue resource successfully retrieved',
        data: { venues: venues }
    });
}

exports.viewInstitutionKnowledge = async function (req, res) {
    const institution = await Institution.findOne({ '_id': req.query.institutionId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!institution) 
    return res.status(400).json({
        status: 'error',
        msg: 'Institution not found!',
        data: {}
    });
    
    const knowledges = await Knowledge.find({ 'owner.theId': institution.id, 'owner.ownerType': 'institution', 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!knowledges) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Knowledge resource successfully retrieved',
        data: { knowledges: knowledges }
    });
}

exports.viewPrivateInstitutionKnowledge = async function (req, res) {
    const institution = await Institution.findOne({ '_id': req.body.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!institution) 
    return res.status(400).json({
        status: 'error',
        msg: 'Institution not found!',
        data: {}
    });
    
    const knowledges = await Knowledge.find({ 'owner.theId': institution.id, 'owner.ownerType': 'institution', 'status': { $ne: 'deleted'} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!knowledges) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Private knowledge resource successfully retrieved',
        data: { knowledges: knowledges }
    });
}

exports.viewInstitutionItem = async function (req, res) {
    const institution = await Institution.findOne({ '_id': req.query.institutionId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!institution) 
    return res.status(400).json({
        status: 'error',
        msg: 'Institution not found!',
        data: {}
    });
    
    const items = await Item.find({ 'owner': institution.id, 'ownerType': 'institution', 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!items) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Item resource successfully retrieved',
        data: { items: items }
    });
}

exports.viewPrivateInstitutionItem = async function (req, res) {
    const institution = await Institution.findOne({ '_id': req.body.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!institution) 
    return res.status(400).json({
        status: 'error',
        msg: 'Institution not found!',
        data: {}
    });
    
    const items = await Item.find({ 'owner': institution.id, 'ownerType': 'institution', 'status': {$ne: 'deleted'} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!items) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Private item resource successfully retrieved',
        data: { items: items }
    });
}

exports.viewInstitutionVenue = async function (req, res) {
    const institution = await Institution.findOne({ '_id': req.query.institutionId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!institution) 
    return res.status(400).json({
        status: 'error',
        msg: 'Institution not found!',
        data: {}
    });
    
    const venues = await Venue.find({ 'owner': institution.id, 'ownerType': 'institution', 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!venues) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Venue resource successfully retrieved',
        data: { venues: venues }
    });
}

exports.viewPrivateInstitutionVenue = async function (req, res) {
    const institution = await Institution.findOne({ '_id': req.body.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!institution) 
    return res.status(400).json({
        status: 'error',
        msg: 'Institution not found!',
        data: {}
    });
    
    const venues = await Venue.find({ 'owner': institution.id, 'ownerType': 'institution', 'status': {$ne: 'deleted'} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!venues) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Private venue resource successfully retrieved',
        data: { venues: venues }
    });
}

var createItemStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        let dir = 'public/uploads/resources/item'
        
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
      let thePath = 'ItemPic-'+req.id+"-"+Date.now()+'.'+extentsion[extentsion.length - 1]; 
      req.thePath.push('/public/uploads/resources/item/'+thePath);
      callback(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
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

var uploadCreateItem = multer({ storage: createItemStorage }).array("itemPics", 10);

exports.multerCreateItem = uploadCreateItem;

exports.createItem = async function (req, res) {
    var theOwner

    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;

    if (req.type === "user") {
        theOwner = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
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
    
    const item = new Item({
		title: req.body.title,
		desc: req.body.desc,
		owner: theOwner.id,
		status: "active",
        country: req.body.country,
        ownerType: req.type,
        imgPath: req.thePath
    });

    item.save(item)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Item Resource successfully created',
            data: { item: item }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    title = "Item Resource"
    desc = "Offered an item resource: " + item.title
    accountId = theOwner.id
    accountType = req.type
        
    Helper.createProfileFeed(title,desc,accountId,accountType)

    var action = "Account created an Item Resource: "+ item.title 
    Helper.createAuditLog(action,req.type,req.id)
}

var createVenueStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        let dir = 'public/uploads/resources/venue'
        
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
      let thePath = 'VenuePic-'+req.id+"-"+Date.now()+'.'+extentsion[extentsion.length - 1]; 
      req.thePath.push('/public/uploads/resources/venue/'+thePath);
      callback(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})

var uploadCreateVenue = multer({ storage: createVenueStorage }).array("venuePics", 10);

exports.multerCreateVenue = uploadCreateVenue;

exports.createVenue = async function (req, res) {
    var theOwner

    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;

    if (req.type === "user") {
        theOwner = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
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

    const venue = new Venue({
		title: req.body.title,
		desc: req.body.desc,
		owner: theOwner.id,
		status: "active",
        country: req.body.country,
        ownerType: req.type,
        address: req.body.address,
        imgPath: req.thePath
    });

    venue.save(venue)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Venue Resource successfully created!',
            data: { venue: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    title = "Venue Resource"
    desc = "Offered an venue resource: " + venue.title
    accountId = theOwner.id
    accountType = req.type
        
    Helper.createProfileFeed(title,desc,accountId,accountType)

    var action = "Account created a Venue Resource: "+ venue.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.createManpower = async function (req, res) {
    var theOwner

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        return res.status(400).json({
            status: 'error',
            msg: 'Only user account can create manpower resource!',
            data: {}
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });
    
    const manpower = new Manpower({
		title: req.body.title,
		desc: req.body.desc,
		owner: theOwner.id,
		status: "active",
        country: theOwner.country,
        ownerType: req.body.type
    });

    manpower.save(manpower)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Manpower Resource successfully created!',
            data: { manpower: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    title = "Manpower Resource"
    desc = "Offered a manpower resource: " + manpower.title
    accountId = theOwner.id
    accountType = req.body.type
        
    Helper.createProfileFeed(title,desc,accountId,accountType)

    var action = "Account created a Manpower Resource: "+ manpower.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.createKnowledge = async function (req, res) {
    var theOwner

    if (req.type === "user") {
        theOwner = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });
    
    // var expiryDate = ""
    // if(req.body.expire != "")
    //     expiryDate = moment(req.body.endDate).tz('Asia/Singapore')
    // if(theDate.isSameOrBefore(moment.tz('Asia/Singapore')))
    // return res.status(500).json({
    //     status: 'error',
    //     msg: 'The end date is invalid! ',
    //     data: {}
    // });

    var theFilePath = "";
    if(req.file) theFilePath = "/public/uploads/resources/IP/"+req.thePath;

    const knowledge = new Knowledge({
		title: req.body.title,
		desc: req.body.desc,
		owner: [{theId: theOwner.id, ownerType:req.type}],
        status: "active",
        attachment: theFilePath,
        knowType: req.body.knowType,
        link: req.body.link,
        patentNum: req.body.patentNum,
        expiry: req.body.expiry,
        issn: req.body.issn,
        doi: req.body.doi,
        issueDate: req.body.issueDate
    });

    knowledge.save(knowledge)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Knowledge Resource successfully created!',
            data: { knowledge: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    title = "Knowledge Resource"
    desc = "Offered a knowledge resource: " + knowledge.title
    accountId = req.id
    accountType = req.type
        
    Helper.createProfileFeed(title,desc,accountId,accountType)

    var action = "Account created a Knowledge Resource: "+ knowledge.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.updateItem = async function (req, res) {
    var theOwner

    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;
    

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const item = await Item.findOne({ '_id': req.body.itemId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    
    if(!item)
    return res.status(400).json({
        status: 'error',
        msg: 'Such item resource not found!',
        data: {}
    });
    
    if(item.owner != theOwner.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this item resource',
        data: {}
    });

    item.title = req.body.title
    item.desc = req.body.desc
    item.country = req.body.country

    item.save(item)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Item Resource successfully updated',
            data: { item: item }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account updated an Item Resource: "+ item.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.updateVenue = async function (req, res) {
    var theOwner

    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;
    

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const venue = await Venue.findOne({ '_id': req.body.venueId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    
    if(!venue)
    return res.status(400).json({
        status: 'error',
        msg: 'Such venue resource not found!',
        data: {}
    });
    
    if(venue.owner != theOwner.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this venue resource',
        data: {}
    });

    venue.title = req.body.title
    venue.desc = req.body.desc
    venue.country = req.body.country
    venue.address = req.body.address

    venue.save(venue)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Venue Resource successfully updated',
            data: { venue: venue }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account updated a Venue Resource: "+ venue.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.updateManpower = async function (req, res) {
    var theOwner

    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;
    

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const manpower = await Manpower.findOne({ '_id': req.body.manpowerId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    if(!manpower)
    return res.status(400).json({
        status: 'error',
        msg: 'Such manpower resource not found!',
        data: {}
    });

    if(manpower.owner != theOwner.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this manpower resource',
        data: {}
    });

    manpower.title = req.body.title
    manpower.desc = req.body.desc
    manpower.country = req.body.country
    
    manpower.save(manpower)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Manpower Resource successfully updated',
            data: { manpower: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account updated a Manpower Resource: "+ manpower.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.updateKnowledge = async function (req, res) {
    var theOwner    

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const knowledge = await Knowledge.findOne({ '_id': req.body.knowledgeId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    if(!knowledge)
    return res.status(400).json({
        status: 'error',
        msg: 'Such knowledge resource not found!',
        data: {}
    });

    var valid = false;
    for(var i = 0; i < knowledge.owner.length; i++) {
        if(theOwner.id === knowledge.owner[i].theId) {
            valid = true;
            break;
        }
    }
    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this knowledge resource',
        data: {}
    });

    knowledge.title = req.body.title
    knowledge.desc = req.body.desc
    knowledge.knowType = req.body.knowType
    knowledge.link = req.body.link
    knowledge.patentNum = req.body.patentNum
    knowledge.expiry = req.body.expiry
    knowledge.issn = req.body.issn
    knowledge.doi = req.body.doi
    knowledge.issueDate = req.body.issueDate

    knowledge.save(knowledge)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Knowledge Resource successfully updated',
            data: { knowledge: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account updated a Knowledge Resource: "+ knowledge.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.updateKnowledgeOwner = async function (req, res) {
    var theOwner    
    console.log("here")
    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const knowledge = await Knowledge.findOne({ '_id': req.body.knowledgeId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    if(!knowledge)
    return res.status(400).json({
        status: 'error',
        msg: 'Such knowledge resource not found!',
        data: {}
    });

    var valid = false;
    for(var i = 0; i < knowledge.owner.length; i++) {
        if(theOwner.id === knowledge.owner[i].theId) {
            valid = true;
            break;
        }
    }
    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this knowledge resource',
        data: {}
    });

    var arr = []
    var owner = req.body.owners;

    for(var i = 0; i < owner.length; i++) {
        if(!owner[i].theId || !owner[i].ownerType) {
            return res.status(400).json({
                status: 'error',
                msg: 'There is an invalid field!',
                data: {}
            });
        }

        var tempAcc;

        if(owner[i].ownerType === "institution") {
            const institution = await Institution.findOne({ '_id': owner[i].theId }, function (err) {
                if (err)
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong! '+err,
                    data: {}
                });
            });

            tempAcc = institution
        } else if(owner[i].ownerType === "user") {
            const user = await User.findOne({ '_id': owner[i].theId }, function (err) {
                if (err)
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong! '+err,
                    data: {}
                });
            });

            tempAcc = user
        }

        if(!tempAcc)
        return res.status(400).json({
            status: 'error',
            msg: 'There was an invalid owner field',
            data: {}
        });

        if(!arr.includes({theId: owner[i].theId, ownerType: owner[i].ownerType}))
            arr.push(owner[i]);
    }

    knowledge.owner = arr;
    
    knowledge.save(knowledge)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Knowledge Resource owners successfully updated',
            data: { knowledge: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.addKnowledgeOwner = async function (req, res) {
    var theOwner    
    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const knowledge = await Knowledge.findOne({ '_id': req.body.knowledgeId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    if(!knowledge)
    return res.status(400).json({
        status: 'error',
        msg: 'Such knowledge resource not found!',
        data: {}
    });

    var valid = false;
    for(var i = 0; i < knowledge.owner.length; i++) {
        if(theOwner.id === knowledge.owner[i].theId) {
            valid = true;
            break;
        }
    }
    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this knowledge resource',
        data: {}
    });

    const targetuser = await User.findOne({ '_id': req.body.userId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!targetuser)
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong! User does not exists! ',
        data: {}
    });

    valid = false;
    for(var i = 0; i < knowledge.owner.length; i++) {
        if(targetuser.id === knowledge.owner[i].theId) {
            valid = true;
            break;
        }
    }
    if(valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are already inside the list of owner',
        data: {}
    });

    knowledge.owner.push({theId: targetuser.id, ownerType:"user"});
    
    knowledge.save(knowledge)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Knowledge Resource owners successfully added',
            data: { knowledge: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account added owners for Knowledge Resource: "+ knowledge.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.deleteKnowledgeOwner = async function (req, res) {
    var theOwner    
    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const knowledge = await Knowledge.findOne({ '_id': req.body.knowledgeId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    if(!knowledge)
    return res.status(400).json({
        status: 'error',
        msg: 'Such knowledge resource not found!',
        data: {}
    });

    var valid = false;
    for(var i = 0; i < knowledge.owner.length; i++) {
        if(theOwner.id === knowledge.owner[i].theId) {
            valid = true;
            break;
        }
    }
    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this knowledge resource',
        data: {}
    });

    var target;

    if(req.body.targetType === "user") {
        target = await User.findOne({ '_id': req.body.targetId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if(req.body.targetType === "institution") {
        target = await Institution.findOne({ '_id': req.body.targetId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }

    if(!target)
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong! Account does not exists! ',
        data: {}
    });

    valid = false;
    for(var i = 0; i < knowledge.owner.length; i++) {
        if(target.id === knowledge.owner[i].theId && req.body.targetType === knowledge.owner[i].ownerType ) {
            valid = true;
            break;
        }
    }
    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'The user is not inside the list of owner',
        data: {}
    });

    if(knowledge.owner.length === 1)
    return res.status(400).json({
        status: 'error',
        msg: 'You are the sole owner, please delete this resource instead!',
        data: {}
    });

    Knowledge.findOneAndUpdate(
        { _id: knowledge.id },
        { $pull: { owner: { "theId": target.id, "ownerType": req.body.targetType} } },
        { new: true },
        function(err, data) {
            if (err) 
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! Error: ' + err.message,
                data: {}
            });

            return res.status(200).json({
                status: 'success',
                msg: 'Knowledge Resource owners successfully deleted',
                data: { knowledge: data }
            });
            
        }
    )

    var action = "Account removed some owners for Knowledge Resource: "+ knowledge.title 
    Helper.createAuditLog(action,req.type,req.id)
}

var venueStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        let dir = 'public/uploads/resources/venue'
        
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
      let thePath = 'VenuePic-'+req.body.venueId+"-"+Date.now()+'.'+extentsion[extentsion.length - 1]; 
      req.thePath.push('/public/uploads/resources/venue/'+thePath);
      callback(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
  });
  
  var uploadVenueFiles = multer({ storage: venueStorage }).array("venuePics", 10);
//   var uploadFilesMiddleware = util.promisify(uploadFiles);
  exports.multerVenuePicUpload = uploadVenueFiles;

  exports.venuePicture = async function (req, res){
    if(!req.body.venueId) {
        return res.status(400).json({
            status: 'error',
            msg: 'Venue id is empty! ',
            data: {}
        });
    }

    
    if(req.files.length === 0) {
        return res.status(400).json({
            status: 'error',
            msg: 'No picture uploaded! ',
            data: {}
        });
    }

    const venue = await Venue.findOne({ '_id': req.body.venueId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such venue resource!',
            data: {}
        });
    });

    if(!venue)
    return res.status(400).json({
        status: 'error',
        msg: 'Venue does not exists!',
        data: {}
    });

    var theOwner;

    if(req.type === "institution") {
        const institution = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(400).json({
            status: 'error',
            msg: 'Account is not authorized to perform this action right now!',
            data: {}
        });

        theOwner = institution
    } else if (req.type === "user") {
        const user = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
        theOwner = user
    }

    if(theOwner.id!=venue.owner)
    return res.status(400).json({
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

    venue.imgPath = venue.imgPath.concat(req.thePath);

    venue.save(venue)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Venue picture successfully updated',
            data: { venue: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account added pictures for Venue Resource: "+ venue.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.deleteItemPicture = async function (req, res){
    if(!req.body.itemId) {
        return res.status(400).json({
            status: 'error',
            msg: 'Item id is empty! ',
            data: {}
        });
    }

    const item = await Item.findOne({ '_id': req.body.itemId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such item resource!',
            data: {}
        });
    });

    if(!item)
    return res.status(400).json({
        status: 'error',
        msg: 'Item does not exist!',
        data: {}
    });

    var theOwner;

    if(req.type === "institution") {
        const institution = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(400).json({
            status: 'error',
            msg: 'Account is not authorized to perform this action right now!',
            data: {}
        });

        theOwner = institution
    } else if (req.type === "user") {
        const user = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
        theOwner = user
    }

    if(theOwner.id!=item.owner)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to perform this action!',
        data: {}
    });

    var oldList = item.imgPath
    var toDelete = req.body.indexes
    var newList = []

    for(var i = 0; i < oldList.length; i++) {
        if(!toDelete.includes(i))
            newList.push(oldList[i])
    }

    item.imgPath = newList;

    item.save(item)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Item picture successfully updated',
            data: { item: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account removed some pictures for Item Resource: "+ item.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.deleteVenuePicture = async function (req, res){
    if(!req.body.venueId) {
        return res.status(400).json({
            status: 'error',
            msg: 'Venue id is empty! ',
            data: {}
        });
    }

    const venue = await Venue.findOne({ '_id': req.body.venueId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such venue resource!',
            data: {}
        });
    });

    if(!venue)
    return res.status(400).json({
        status: 'error',
        msg: 'Venue does not exists!',
        data: {}
    });

    var theOwner;

    if(req.type === "institution") {
        const institution = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(400).json({
            status: 'error',
            msg: 'Account is not authorized to perform this action right now!',
            data: {}
        });

        theOwner = institution
    } else if (req.type === "user") {
        const user = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
        theOwner = user
    }

    if(theOwner.id!=venue.owner)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to perform this action!',
        data: {}
    });

    var oldList = venue.imgPath
    var toDelete = req.body.indexes
    var newList = []

    for(var i = 0; i < oldList.length; i++) {
        if(!toDelete.includes(i))
            newList.push(oldList[i])
    }
    venue.imgPath = newList;

    venue.save(venue)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Venue picture successfully updated',
            data: { venue: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account removed some pictures for Venue Resource: "+ venue.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.activateItem = async function (req, res) {
    var theOwner

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const item = await Item.findOne({ '_id': req.body.itemId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    
    if(!item)
    return res.status(400).json({
        status: 'error',
        msg: 'Such item resource not found!',
        data: {}
    });
    
    if(item.owner != theOwner.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this item resource',
        data: {}
    });

    item.status = "active"

    item.save(item)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Item Resource successfully activated',
            data: { item: item }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account activated an Item Resource: "+ item.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.deactivateItem = async function (req, res) {
    var theOwner

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const item = await Item.findOne({ '_id': req.body.itemId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    
    if(!item)
    return res.status(400).json({
        status: 'error',
        msg: 'Such item resource not found!',
        data: {}
    });
    
    if(item.owner != theOwner.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this item resource',
        data: {}
    });

    item.status = "inactive"

    item.save(item)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Item Resource successfully deactivated',
            data: { item: item }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account deactivated an Item Resource: "+ item.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.deleteItem = async function (req, res) {
    var theOwner

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const item = await Item.findOne({ '_id': req.body.itemId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    
    if(!item)
    return res.status(400).json({
        status: 'error',
        msg: 'Such item resource not found!',
        data: {}
    });
    
    if(item.owner != theOwner.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to delete this item resource',
        data: {}
    });

    item.status = "deleted"

    item.save(item)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Item Resource successfully deleted',
            data: { item: item }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account deleted an Item Resource: "+ item.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.activateManpower = async function (req, res) {
    var theOwner

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const manpower = await Manpower.findOne({ '_id': req.body.manpowerId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    if(!manpower)
    return res.status(400).json({
        status: 'error',
        msg: 'Such manpower resource not found!',
        data: {}
    });

    if(manpower.owner != theOwner.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this manpower resource',
        data: {}
    });

    manpower.status = "active"

    manpower.save(manpower)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Manpower Resource successfully activated',
            data: { manpower: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account activated a Manpower Resource: "+ manpower.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.deactivateManpower = async function (req, res) {
    var theOwner

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const manpower = await Manpower.findOne({ '_id': req.body.manpowerId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    if(!manpower)
    return res.status(400).json({
        status: 'error',
        msg: 'Such manpower resource not found!',
        data: {}
    });

    if(manpower.owner != theOwner.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this manpower resource',
        data: {}
    });

    manpower.status = "inactive"

    manpower.save(manpower)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Manpower Resource successfully deactivated',
            data: { manpower: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account deactivated a Manpower Resource: "+ manpower.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.deleteManpower = async function (req, res) {
    var theOwner

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const manpower = await Manpower.findOne({ '_id': req.body.manpowerId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    if(!manpower)
    return res.status(400).json({
        status: 'error',
        msg: 'Such manpower resource not found!',
        data: {}
    });

    if(manpower.owner != theOwner.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to delete this manpower resource',
        data: {}
    });

    manpower.status = "deleted"

    manpower.save(manpower)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Manpower Resource successfully deleted',
            data: { manpower: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account deleted a Manpower Resource: "+ manpower.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.activateKnowledge = async function (req, res) {
    var theOwner    

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const knowledge = await Knowledge.findOne({ '_id': req.body.knowledgeId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    if(!knowledge)
    return res.status(400).json({
        status: 'error',
        msg: 'Such knowledge resource not found!',
        data: {}
    });

    var valid = false;
    for(var i = 0; i < knowledge.owner.length; i++) {
        if(theOwner.id === knowledge.owner[i].theId) {
            valid = true;
            break;
        }
    }
    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this knowledge resource',
        data: {}
    });

    knowledge.status = "active"
    
    knowledge.save(knowledge)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Knowledge Resource successfully activated',
            data: { knowledge: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account activated a Knowledge Resource: "+ knowledge.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.deactivateKnowledge = async function (req, res) {
    var theOwner    

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const knowledge = await Knowledge.findOne({ '_id': req.body.knowledgeId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    if(!knowledge)
    return res.status(400).json({
        status: 'error',
        msg: 'Such knowledge resource not found!',
        data: {}
    });

    var valid = false;
    for(var i = 0; i < knowledge.owner.length; i++) {
        if(theOwner.id === knowledge.owner[i].theId) {
            valid = true;
            break;
        }
    }
    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this knowledge resource',
        data: {}
    });

    knowledge.status = "inactive"
    
    knowledge.save(knowledge)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Knowledge Resource successfully deactivated',
            data: { knowledge: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account deactivated a Knowledge Resource: "+ knowledge.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.deleteKnowledge = async function (req, res) {
    var theOwner    

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const knowledge = await Knowledge.findOne({ '_id': req.body.knowledgeId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    if(!knowledge)
    return res.status(400).json({
        status: 'error',
        msg: 'Such knowledge resource not found!',
        data: {}
    });

    var valid = false;
    for(var i = 0; i < knowledge.owner.length; i++) {
        if(theOwner.id === knowledge.owner[i].theId) {
            valid = true;
            break;
        }
    }
    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to delete this knowledge resource',
        data: {}
    });

    knowledge.status = "deleted"
    
    knowledge.save(knowledge)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Knowledge Resource successfully deleted',
            data: { knowledge: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account deleted a Knowledge Resource: "+ knowledge.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.activateVenue = async function (req, res) {
    var theOwner    

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const venue = await Venue.findOne({ '_id': req.body.venueId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    
    if(!venue)
    return res.status(400).json({
        status: 'error',
        msg: 'Such venue resource not found!',
        data: {}
    });
    
    if(venue.owner != theOwner.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this venue resource',
        data: {}
    });

    venue.status = "active"

    venue.save(venue)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Venue Resource successfully activated',
            data: { venue: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account activated a Venue Resource: "+ venue.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.deactivateVenue = async function (req, res) {
    var theOwner    

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const venue = await Venue.findOne({ '_id': req.body.venueId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    
    if(!venue)
    return res.status(400).json({
        status: 'error',
        msg: 'Such venue resource not found!',
        data: {}
    });
    
    if(venue.owner != theOwner.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this venue resource',
        data: {}
    });

    venue.status = "inactive"

    venue.save(venue)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Venue Resource successfully deactivated',
            data: { venue: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account deactivated a Venue Resource: "+ venue.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.deleteVenue = async function (req, res) {
    var theOwner    

    if (req.body.type === "user") {
        theOwner = await User.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        theOwner = await Institution.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! '+err,
                data: {}
            });
        });
    }
    
    if(!theOwner) 
    return res.status(400).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    const venue = await Venue.findOne({ '_id': req.body.venueId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    
    if(!venue)
    return res.status(400).json({
        status: 'error',
        msg: 'Such venue resource not found!',
        data: {}
    });
    
    if(venue.owner != theOwner.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to delete this venue resource',
        data: {}
    });

    venue.status = "deleted"

    venue.save(venue)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Venue Resource successfully deleted',
            data: { venue: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account deleted a Venue Resource: "+ venue.title 
    Helper.createAuditLog(action,req.type,req.id)
}

exports.viewItemDetails = async function (req, res) {
    const item = await Item.findOne({ '_id': req.query.itemId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!item)
    return res.status(400).json({
        status: 'error',
        msg: 'No such item found!',
        data: {}
    });

    var theOwner;

    if(item.ownerType === "institution") {
        const institution = await Institution.findOne({ '_id': item.owner }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        theOwner = institution
    } else if (item.ownerType === "user") {
        const user = await User.findOne({ '_id': item.owner }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
        theOwner = user
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Item resource detail successfully retrieved',
        data: { item: item, owner: theOwner, ownerType: item.ownerType }
    });
}

exports.viewManpowerDetails = async function (req, res) {
    const manpower = await Manpower.findOne({ '_id': req.query.manpowerId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!manpower)
    return res.status(400).json({
        status: 'error',
        msg: 'No such manpower found!',
        data: {}
    });

    var theOwner;

    if(manpower.ownerType === "institution") {
        const institution = await Institution.findOne({ '_id': manpower.owner }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        theOwner = institution
    } else if (manpower.ownerType === "user") {
        const user = await User.findOne({ '_id': manpower.owner }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
        theOwner = user
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Manpower resource detail successfully retrieved',
        data: { manpower: manpower, owner: theOwner, ownerType: manpower.ownerType }
    });
}

exports.viewVenueDetails = async function (req, res) {
    const venue = await Venue.findOne({ '_id': req.query.venueId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!venue)
    return res.status(400).json({
        status: 'error',
        msg: 'No such venue found!',
        data: {}
    });

    var theOwner;

    if(venue.ownerType === "institution") {
        const institution = await Institution.findOne({ '_id': venue.owner }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        theOwner = institution
    } else if (venue.ownerType === "user") {
        const user = await User.findOne({ '_id': venue.owner }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
        theOwner = user
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Venue resource detail successfully retrieved',
        data: { venue: venue, owner: theOwner, ownerType: venue.ownerType }
    });
}

exports.viewKnowledgeDetails = async function (req, res) {
    const knowledge = await Knowledge.findOne({ '_id': req.query.knowledgeId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!knowledge)
    return res.status(400).json({
        status: 'error',
        msg: 'No such knowledge found!',
        data: {}
    });

    var userOwner = [];
    var institutionOwner = [];
    var owners = knowledge.owner;

    for(var i = 0; i < owners.length; i++) {
        if(owners[i].ownerType === "institution") {
            const institution = await Institution.findOne({ '_id': owners[i].theId }, function (err) {
                if (err)
                return res.status(500).json({
                    status: 'error',
                    msg: 'There was no such account!',
                    data: {}
                });
            });

            if(!institution)
            return res.status(400).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });

            institutionOwner.push(institution)
        } else if (owners[i].ownerType === "user") {
            const user = await User.findOne({ '_id': owners[i].theId }, function (err) {
                if (err)
                return res.status(500).json({
                    status: 'error',
                    msg: 'There was no such account!',
                    data: {}
                });
            });

            if(!user)
            return res.status(400).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
            
            userOwner.push(user)
        }
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Knowledge resource detail successfully retrieved',
        data: { knowledge: knowledge, userOwner: userOwner, institutionOwner: institutionOwner }
    });
}

exports.searchItem = async function (req, res){

    var rgx = new RegExp(req.query.title, "i");
    
    const items = await Item.find({ 'title': { $regex: rgx }, "status": "active" }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err.message,
            data: {}
        });
    });

    if(!items) {
        return res.status(400).json({
            status: 'error',
            msg: 'No item found! ',
            data: {}
        });
    }

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for the items',
        data: { items: items }
    });
}

exports.searchVenue = async function (req, res){

    var rgx = new RegExp(req.query.title, "i");
    
    const venues = await Venue.find({ 'title': { $regex: rgx }, "status": "active" }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err.message,
            data: {}
        });
    });

    if(!venues) {
        return res.status(400).json({
            status: 'error',
            msg: 'No venue found! ',
            data: {}
        });
    }

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for the venues',
        data: { venues: venues }
    });
}

exports.searchManpower = async function (req, res){

    var rgx = new RegExp(req.query.title, "i");
    
    const manpowers = await Manpower.find({ 'title': { $regex: rgx }, "status": "active" }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err.message,
            data: {}
        });
    });

    if(!manpowers) {
        return res.status(400).json({
            status: 'error',
            msg: 'No manpower found! ',
            data: {}
        });
    }

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for the manpowers',
        data: { manpowers: manpowers }
    });
}

exports.searchKnowledge = async function (req, res){

    var rgx = new RegExp(req.query.title, "i");
    
    const knowledges = await Knowledge.find({ 'title': { $regex: rgx }, "status": "active" }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err.message,
            data: {}
        });
    });

    if(!knowledges) {
        return res.status(400).json({
            status: 'error',
            msg: 'No knowledge found! ',
            data: {}
        });
    }

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for the knowledges',
        data: { knowledges: knowledges }
    });
}