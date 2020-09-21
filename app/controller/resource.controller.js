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
const nodeCountries =  require("node-countries");

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
            msg: 'Account is not authorized to perform project creation right now!',
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
            msg: 'Project picture successfully updated',
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