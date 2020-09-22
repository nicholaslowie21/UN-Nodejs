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
        let thePath = 'ItemPic-'+req.body.itemId+'.'+extentsion[extentsion.length - 1]; 
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

exports.multerItemPicUpload = upload.single('itemPic');

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
        let thePath = file.originalname+"-"+req.body.knowledgeId+'.'+extentsion[extentsion.length - 1]; 
        req.thePath = thePath;
        cb(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})
var uploadIPAttachment = multer({ storage: IPStorage  })

exports.multerIPUpload = uploadIPAttachment.single('IP');

exports.itemPicture = async function (req, res){
    if(!req.body.itemId) {
        return res.status(500).json({
            status: 'error',
            msg: 'Item id is empty! ',
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

    const item = await Item.findOne({ '_id': req.body.itemId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such item resource!',
            data: {}
        });
    });

    if(!item)
    return res.status(500).json({
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
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(500).json({
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
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
        theOwner = user
    }

    if(theOwner.id!=item.owner)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to perform this action!',
        data: {}
    });

    item.imgPath = "/public/uploads/resources/item/"+req.thePath;

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
}

exports.IPupload = async function (req, res){
    if(!req.body.knowledgeId) {
        return res.status(500).json({
            status: 'error',
            msg: 'Knowledge id is empty! ',
            data: {}
        });
    }

    
    if(!req.file) {
        return res.status(500).json({
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
    return res.status(500).json({
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
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(500).json({
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
        return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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

exports.createItem = async function (req, res) {
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
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });
    
    const item = new Item({
		title: req.body.title,
		desc: req.body.desc,
		owner: theOwner.id,
		status: "active",
        country: theOwner.country,
		ownerType: req.body.type
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
}

exports.createVenue = async function (req, res) {
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
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });
    
    const venue = new Venue({
		title: req.body.title,
		desc: req.body.desc,
		owner: theOwner.id,
		status: "active",
        country: theOwner.country,
        ownerType: req.body.type,
        address: req.body.address
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
    return res.status(500).json({
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
}

exports.createKnowledge = async function (req, res) {
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
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });
    
    const knowledge = new Knowledge({
		title: req.body.title,
		desc: req.body.desc,
		owner: [{theId: theOwner.id, ownerType:req.body.type}],
		status: "active"
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
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'Such item resource not found!',
        data: {}
    });
    
    if(item.owner != theOwner.id)
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'Such venue resource not found!',
        data: {}
    });
    
    if(venue.owner != theOwner.id)
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'Such manpower resource not found!',
        data: {}
    });

    if(manpower.owner != theOwner.id)
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to edit this knowledge resource',
        data: {}
    });

    knowledge.title = req.body.title
    knowledge.desc = req.body.desc
    
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to edit this knowledge resource',
        data: {}
    });

    var arr = []
    var owner = req.body.owners;

    for(var i = 0; i < owner.length; i++) {
        if(!owner[i].theId || !owner[i].ownerType) {
            return res.status(500).json({
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
        return res.status(500).json({
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
        return res.status(500).json({
            status: 'error',
            msg: 'Venue id is empty! ',
            data: {}
        });
    }

    
    if(!req.files) {
        return res.status(500).json({
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
    return res.status(500).json({
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
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(500).json({
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
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
        theOwner = user
    }

    if(theOwner.id!=venue.owner)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to perform this action!',
        data: {}
    });

    venue.imgPath = req.thePath;

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
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'Such item resource not found!',
        data: {}
    });
    
    if(item.owner != theOwner.id)
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'Such item resource not found!',
        data: {}
    });
    
    if(item.owner != theOwner.id)
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'Such item resource not found!',
        data: {}
    });
    
    if(item.owner != theOwner.id)
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'Such manpower resource not found!',
        data: {}
    });

    if(manpower.owner != theOwner.id)
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'Such manpower resource not found!',
        data: {}
    });

    if(manpower.owner != theOwner.id)
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'Such manpower resource not found!',
        data: {}
    });

    if(manpower.owner != theOwner.id)
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'Such venue resource not found!',
        data: {}
    });
    
    if(venue.owner != theOwner.id)
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'Such venue resource not found!',
        data: {}
    });
    
    if(venue.owner != theOwner.id)
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'Such venue resource not found!',
        data: {}
    });
    
    if(venue.owner != theOwner.id)
    return res.status(500).json({
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
    return res.status(500).json({
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
        return res.status(500).json({
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
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
        theOwner = user
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Item resource detail successfully retrieved',
        data: { item: item, owner: theOwner }
    });
}