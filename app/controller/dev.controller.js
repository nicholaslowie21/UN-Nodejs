const moment = require('moment-timezone')
const db = require('../models')
const Target = db.target
const fs = require('fs');
const multer = require('multer');
const csvtojson = require("csvtojson");
const path = require('path');


var csvStorageTarget = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = 'public/uploads/targetsCSV'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: async function (req, file, cb) {
        let extentsion = file.originalname.split('.')
        let thePath = "TargetsCSV-"+Date.now()+'.'+extentsion[extentsion.length - 1]; 
        req.theTargetCSVPath = thePath;
        cb(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})
var uploadCSVTarget = multer({ 
    storage: csvStorageTarget,
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

exports.csvTarget = uploadCSVTarget.single('csvTarget');

exports.addTarget = async function (req, res){
    const newTarget = new Target({
        SDG: req.body.SDG,
        desc: req.body.desc,
        targetCode: req.body.targetCode
    })
    
    newTarget.save(newTarget)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'A new target is added',
            data: { target: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.addTargetCSV = async function (req, res, next) {
    const csvFilePath = req.file.path;
    
    await csvtojson().fromFile(csvFilePath).then( async function (csvData) {
        if (fs.existsSync(csvFilePath)) {
            for (const obj of csvData) {
                
                if(!obj.SDG || !obj.desc || !obj.targetCode) {
                    return res.status(500).json({
                        status: 'error',
                        msg: 'File format is incorrect. Please check your file!',
                        data: {}
                    });
                }

                var newTarget = new Target({
                    SDG: obj.SDG,
                    desc: obj.desc,
                    targetCode: obj.targetCode
                })
                
                newTarget.save(newTarget)
                .catch(err => {
                    console.log("Something went wrong while adding target")
                });
            
                
            }

            fs.unlinkSync(csvFilePath)

            return res.status(200).json({
                status: 'success',
                msg: 'Target successfully Added',
                data: { }
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
