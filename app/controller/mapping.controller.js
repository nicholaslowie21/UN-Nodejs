const moment = require('moment-timezone')
const db = require('../models')
const User = db.users
const Institution = db.institution
const AccountClaim = db.accountclaim
const fs = require('fs');
const multer = require('multer');
const csvtojson = require("csvtojson");
const path = require('path');
const Isemail = require('isemail');
const nodeCountries =  require("node-countries");
const saltedMd5 = require('salted-md5');
const randomstring = require("randomstring");
const Helper = require('../service/helper.service')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = 'public/uploads/verifyClaim'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: async function (req, file, cb) {
        let extentsion = file.originalname.split('.')
        let thePath = 'VerifyClaim-'+Date.now()+'.'+extentsion[extentsion.length - 1]; 
        req.thePath = thePath;
        cb(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})
var uploadClaim = multer({ 
    storage: storage     
})

exports.claimUpload = uploadClaim.single('verifyFile');

exports.accountClaim = async function(req,res) {
    if(!req.file || req.file.fieldname != 'verifyFile') 
    return res.status(400).json({
        status: 'error',
        msg: 'No file uploaded',
        data: {}
    });

    let accountClaim = await AccountClaim.findOne({ 'accountId': req.body.accountId, 'accountType': req.body.accountType, 'status': 'pending'  }, function (err, person) {
        if (err) 
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    if(accountClaim) {
        return res.status(400).json({
            status: 'error',
            msg: 'There is already a pending claim!',
            data: {}
        });
    }

    var account = await getAccount(req.body.accountId, req.body.accountType)

    if(!account)
    return res.status(400).json({
        status: 'error',
        msg: 'There is no such account!',
        data: {}
    });

    var user = await User.findOne({ 'email': req.body.email, '_id': {$ne: account.id} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+ err
        });
      });
    var institution = await Institution.findOne({ 'email': req.body.email, '_id': {$ne: account.id} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+ err
        });
      });
    
    if (user || institution)
    return res.status(400).json({
        status: 'error',
        msg: 'Email already exists in the system. Please input another one!'
    });

    user = await User.findOne({ 'username': req.body.username }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+ err
        });
      });
    
      institution = await Institution.findOne({ 'username': req.body.username }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+ err
        });
      });
    
    if (user || institution)
    return res.status(400).json({
        status: 'error',
        msg: 'Username already exists in the system. Please input another one!'
    });

    let randomString = randomstring.generate({ length: 8 });
    let saltedHashPassword = saltedMd5(randomString, req.body.password);
    
    const accountclaim = new AccountClaim({
        accountId: req.body.accountId,
        accountType: req.body.accountType,
        status: 'pending',
        verificationFile: req.thePath,
        country: account.country
    });

    account.username = req.body.username
    account.email = req.body.email
    account.password = saltedHashPassword
    account.salt = randomString

    var gotError = false
    account.save(account).catch( err => {
        gotError = true
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong while saving the account! Error: ' + err.message,
            data: {}
        });
    })

    if(gotError === true) return
    
    accountclaim.save(accountclaim)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Account claim successfully sent!',
            data: { account: account, accountclaim: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });


}

async function getAccount(theId, theType) {
    var account;

    if(theType === "user") {
        account = await User.findOne({ '_id': theId }, function (err) {
            if (err) {
                console.log("error [mapping]: (getAccount)" + err.toString())
                return
            }
        });
    } else if (theType === 'institution') {
        account = await Institution.findOne({ '_id': theId }, function (err) {
            if (err) {
                console.log("error [mapping]: (getAccount)" + err.toString())
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
                
                if(!obj.sequence || !obj.name || !obj.email || !obj.country || !obj.website || !obj.SDGs || !obj.bio) {
                    return res.status(400).json({
                        status: 'error',
                        msg: 'File format is incorrect. Please check your file!',
                        data: {}
                    });
                }

                if(obj.address)
                return res.status(400).json({
                    status: 'error',
                    msg: 'File format is incorrect. Please check your file!',
                    data: {}
                });

                if(obj.website === "(none)") obj.website = ""
                if(obj.bio === "(none)") obj.bio = ""

                let theCountry = nodeCountries.getCountryByName(obj.country);

                if (!theCountry)
                    return res.status(400).json({
                        status: 'error',
                        msg: 'All the data uploaded up until this sequence: '+obj.sequence +". The country is invalid for this sequence."
                    });
               
                obj.country = theCountry.name;

                if(Isemail.validate(obj.email) === false) 
                return res.status(400).json({
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
                    isVerified: "true",
                    country: obj.country,
                    website: obj.website,
                    bio: obj.bio,
                    SDGs: temp
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
            
                // let subject = 'KoCoSD Platform'
                // let theMessage = `
                //     <h1>Hi there!</h1>
                //     <p>An account of yours is generated in our system. Come and claim it :)<p>
                //     <p>If there is any discrepancy, please contact our admin to resolve it.</p><br>
                // `

                // Helper.sendEmail(obj.email, subject, theMessage, function (info) {
                //     if (!info) {
                //         console.log('Something went wrong while trying to send email!')
                //     } 
                // })
                
            }

            fs.unlinkSync(csvFilePath)

            var action = "Account uploaded a user mapping csv: "+ csvFilePath
            Helper.createAuditLog(action,"admin",req.id)

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

exports.getUsers = async function (req, res, next) {
    var users = await User.find({ 'status': {$in: ['active','unclaimed']} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: "Something went wrong! Error: "+err.message
        });
    });

    if(!users)
    return res.status(500).json({
        status: 'error',
        msg: "Something went wrong!"
    });

    users.sort(function(a, b){
        if(a.name<b.name) return -1
        else return 1    
    })

    return res.status(200).json({
        status: 'success',
        msg: "Users successfully retrieved!",
        data: { users: users}
    });
      
}

exports.getInstitutions = async function (req, res, next) {
    var institutions = await Institution.find({ 'status': {$in: ['active','unclaimed']} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: "Something went wrong! Error: "+err.message
        });
    });

    if(!institutions)
    return res.status(500).json({
        status: 'error',
        msg: "Something went wrong!"
    });

    institutions.sort(function(a, b){
        if(a.name<b.name) return -1
        else return 1    
    })

    return res.status(200).json({
        status: 'success',
        msg: "Institutions successfully retrieved!",
        data: { institutions: institutions}
    });
      
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
                return res.status(400).json({
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
            
                // let subject = 'KoCoSD Platform'
                // let theMessage = `
                //     <h1>Hi there!</h1>
                //     <p>An account of yours is generated in our system. Come and claim it :)<p>
                //     <p>If there is any discrepancy, please contact our admin to resolve it.</p><br>
                // `

                // Helper.sendEmail(obj.email, subject, theMessage, function (info) {
                //     if (!info) {
                //         console.log('Something went wrong while trying to send email!')
                //     } 
                // })
            }

            fs.unlinkSync(csvFilePath)

            var action = "Account uploaded an institution mapping csv: "+ csvFilePath
            Helper.createAuditLog(action,"admin",req.id)

            return res.status(200).json({
                status: 'success',
                msg: 'Institutions successfully added to the system.',
                data: { newInstitutions : theList}
            });
        }
        else {
            res.status(400).json({
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