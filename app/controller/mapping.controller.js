const moment = require('moment-timezone')
const db = require('../models')
const User = db.users
const Institution = db.institution
const fs = require('fs');
const multer = require('multer');
const csvtojson = require("csvtojson");
const path = require('path');
const Isemail = require('isemail');
const nodeCountries =  require("node-countries");

var csvStorageUser = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = 'public/uploads/mappingCSV'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: async function (req, file, cb) {
        let extentsion = file.originalname.split('.')
        let thePath = "UsersCSV-"+Date.now()+'.'+extentsion[extentsion.length - 1]; 
        req.theUserCSVPath = thePath;
        cb(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})
var uploadCSVUser = multer({ 
    storage: csvStorageUser,
    fileFilter: function(_req, file, cb){
        checkCSVFileType(file, cb);
    } 
})

var csvStorageInstitution = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = 'public/uploads/mappingCSV'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: async function (req, file, cb) {
        let extentsion = file.originalname.split('.')
        let thePath = "InstitutionsCSV-"+Date.now()+'.'+extentsion[extentsion.length - 1]; 
        req.theInstitutionCSVPath = thePath;
        cb(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})
var uploadCSVInstitution = multer({ 
    storage: csvStorageInstitution,
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

exports.csvUser = uploadCSVUser.single('csvUser');

exports.csvInstitution = uploadCSVInstitution.single('csvInstitution');

exports.addUserCSV = async function (req, res, next) {
    const csvFilePath = req.file.path;
    var theList = [];

    await csvtojson().fromFile(csvFilePath).then( async function (csvData) {
        if (fs.existsSync(csvFilePath)) {
            for (const obj of csvData) {
                
                if(!obj.sequence || !obj.name || !obj.email || !obj.country || !obj.website || !obj.SDGs) {
                    return res.status(500).json({
                        status: 'error',
                        msg: 'File format is incorrect. Please check your file!',
                        data: {}
                    });
                }

                if(obj.website === "(none)") obj.website = ""

                let theCountry = nodeCountries.getCountryByName(obj.country);

                if (!theCountry)
                    return res.status(500).json({
                        status: 'error',
                        msg: 'All the data uploaded up until this sequence: '+obj.sequence +". The country is invalid for this sequence."
                    });
               
                obj.country = theCountry.name;

                if(Isemail.validate(obj.email) === false) 
                return res.status(500).json({
                    status: 'error',
                    msg: 'All the data uploaded up until this sequence: '+obj.sequence +". The email is invalid for this sequence."
                });

                let user = await User.findOne({ 'email': obj.email }, function (err) {
                    if (err)
                    return res.status(500).json({
                        status: 'error',
                        msg: 'All the data uploaded up until this sequence: '+obj.sequence +". Something went wrong while validating the email."
                    });
                  });
                let institution = await Institution.findOne({ 'email': obj.email }, function (err) {
                    if (err)
                    return res.status(500).json({
                        status: 'error',
                        msg: 'All the data uploaded up until this sequence: '+obj.sequence +". Something went wrong while validating the email."
                    });
                  });
                
                if (user || institution)
                return res.status(500).json({
                    status: 'error',
                    msg: 'All the data uploaded up until this sequence: '+obj.sequence +". This email already exists in the system."
                });

                let valid = true;
                var temp = obj.SDGs.split(";")
                temp.forEach( sdg => {
                    if(sdg<1 || sdg > 17) {
                        valid = false;
                    }
                })

                if(!valid) 
                return res.status(500).json({
                    status: 'error',
                    msg: 'All the data uploaded up until this sequence: '+obj.sequence +". This SDGs are invalid."
                });

                temp.sort()

                var newUser = new User({
                    name: obj.name,
                    email: obj.email.toLowerCase(),
                    role: 'user',
                    status: 'unclaimed',
                    isVerified: "false",
                    country: obj.country,
                    website: obj.website,
                    SDGs: temp,
                    isVerified: true
                })
                
                await newUser.save(newUser)
                .then(data => {
                    theList.push(data)
                })
                .catch(err => {
                    console.log("Something went wrong while adding user csv! (mapping)")
                    return res.status(500).json({
                        status: 'error',
                        msg: 'There was an issue in the upload please try again. Up until sequence: ' + obj.sequence
                    });
                });
            
                
            }

            fs.unlinkSync(csvFilePath)

            return res.status(200).json({
                status: 'success',
                msg: 'Users successfully added to the system.',
                data: { newUsers : theList}
            });
        }
        else {
            res.status(500).json({
                status: 'error',
                msg: 'There was an issue in the upload please try again'
            });
        }
    }).catch(error => 
    res.status(400).json({
        status: 'error',
        msg: error.toString(),
        data: {}
    }));
}

exports.addInstitutionCSV = async function (req, res, next) {
    const csvFilePath = req.file.path;
    var theList = [];

    await csvtojson().fromFile(csvFilePath).then( async function (csvData) {
        if (fs.existsSync(csvFilePath)) {
            for (const obj of csvData) {
                
                if(!obj.sequence || !obj.name || !obj.email || !obj.country || !obj.website || !obj.SDGs || !obj.address || !obj.bio) {
                    return res.status(500).json({
                        status: 'error',
                        msg: 'File format is incorrect. Please check your file!',
                        data: {}
                    });
                }

                if(obj.address === "(none)") obj.address = ""
                if(obj.bio === "(none)") obj.bio = ""
                if(obj.website === "(none)") obj.website = ""

                let theCountry = nodeCountries.getCountryByName(obj.country);

                if (!theCountry)
                    return res.status(500).json({
                        status: 'error',
                        msg: 'All the data uploaded up until this sequence: '+obj.sequence +". The country is invalid for this sequence."
                    });
               
                obj.country = theCountry.name;

                if(Isemail.validate(obj.email) === false) 
                return res.status(500).json({
                    status: 'error',
                    msg: 'All the data uploaded up until this sequence: '+obj.sequence +". The email is invalid for this sequence."
                });

                let user = await User.findOne({ 'email': obj.email }, function (err) {
                    if (err)
                    return res.status(500).json({
                        status: 'error',
                        msg: 'All the data uploaded up until this sequence: '+obj.sequence +". Something went wrong while validating the email."
                    });
                  });
                let institution = await Institution.findOne({ 'email': obj.email }, function (err) {
                    if (err)
                    return res.status(500).json({
                        status: 'error',
                        msg: 'All the data uploaded up until this sequence: '+obj.sequence +". Something went wrong while validating the email."
                    });
                  });
                
                if (user || institution)
                return res.status(500).json({
                    status: 'error',
                    msg: 'All the data uploaded up until this sequence: '+obj.sequence +". This email already exists in the system."
                });

                let valid = true;
                var temp = obj.SDGs.split(";")
                temp.forEach( sdg => {
                    if(sdg<1 || sdg > 17) {
                        valid = false;
                    }
                })

                if(!valid) 
                return res.status(500).json({
                    status: 'error',
                    msg: 'All the data uploaded up until this sequence: '+obj.sequence +". This SDGs are invalid."
                });

                temp.sort()

                var newInstitution = new Institution({
                    name: obj.name,
                    email: obj.email.toLowerCase(),
                    status: 'unclaimed',
                    bio: obj.bio,
                    address: obj.address,
                    isVerified: true,
                    country: obj.country,
                    SDGs: temp,
                    website: obj.website
                })
                
                await newInstitution.save(newInstitution)
                .then(data => {
                    theList.push(data)
                })
                .catch(err => {
                    console.log("Something went wrong while adding institutions csv! (mapping)" + err)
                    return res.status(500).json({
                        status: 'error',
                        msg: 'There was an issue in the upload please try again. Up until sequence: ' + obj.sequence
                    });
                });
            
                
            }

            fs.unlinkSync(csvFilePath)

            return res.status(200).json({
                status: 'success',
                msg: 'Institutions successfully added to the system.',
                data: { newInstitutions : theList}
            });
        }
        else {
            res.status(500).json({
                status: 'error',
                msg: 'There was an issue in the upload please try again'
            });
        }
    }).catch(error => 
    res.status(400).json({
        status: 'error',
        msg: error.toString(),
        data: {}
    }));
}