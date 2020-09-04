const moment = require('moment-timezone')
const db = require('../models')
const Institution = db.institution
const nodeCountries = require('node-countries');
const fs = require('fs');
const multer = require('multer');

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
    }
})
var upload = multer({ storage: storage })

exports.multerUpload = upload.single('profilePic');

exports.profilePicture = async function (req, res){
    const institution = await Institution.findOne({ 'username': req.username }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!institution)
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });

    institution.profilePic = 'https://localhost:8080/public/uploads/profilePicture/'+req.thePath;

    institution.save(institution)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Account profile picture successfully updated',
            data: { institution: data }
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
    
    const institution = await Institution.findOne({ '_id': req.body.id }, function (err, person) {
        if (err) return handleError(err);
    });

    if(!institution) 
    return res.status(500).json({
        status: 'error',
        msg: 'Account not found!',
        data: {}
    });
    
    institution.name = req.body.name;
    institution.email = req.body.email;
    institution.username = req.body.username;
    institution.bio = req.body.bio;
    institution.phone = req.body.phone;
    institution.country = req.body.country;
    institution.address = req.body.address;

    institution.save(institution)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Account profile successfully updated',
            data: { institution: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });   
}