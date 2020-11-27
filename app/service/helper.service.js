const env = require('../config/env');
const nodemailer = require('nodemailer');
const { body, validationResult, oneOf, check } = require('express-validator');
const db = require('../models')
const ProfileFeed = db.profilefeed;
const AuditLog = db.auditlog;
const Notification = db.notification

const { networkInterfaces } = require('os');
const contactcardModel = require('../models/contactcard.model');

const nets = networkInterfaces();
const results = {}; 

exports.sendEmail = function(target, subject, message, callback) {
    var transporter = nodemailer.createTransport({
        service: env.emailService,
        auth: {
          user: env.ourEmail,
          pass: env.emailPassword
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var mailOptions = {
        from: env.ourEmail,
        to: target,
        subject: subject,
        html: message
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          callback(false, error);
        } else {
          console.log('Email sent: ' + info.response);
          callback(true, info);
        }
      });
}

exports.createProfileFeed = function(title, desc, accountId, accountType) {
  const pf = new ProfileFeed({
		title: title,
    desc: desc,
    accountId: accountId,
    accountType: accountType
  });

  pf.save(pf).catch(err => {
      console.log('Error: (profileFeedHelper) '+err.message)
      return
    });
}

exports.createAuditLog = async function(action, targetType, targetId) {
  const log = new AuditLog({
		action: action,
    targetType: targetType,
    targetId: targetId
  });

  await log.save(log).catch(err => {
    console.log('Error: (auditLogHelper) '+err.message)
    return
  });
}

exports.createNotification = function(title, desc, accountId, accountType) {
  const notif = new Notification({
    title: title,
    desc: desc,
    accountType: accountType,
    accountId: accountId,
    isRead: false
  });

  notif.save(notif).catch(err => {
    console.log('Error: (notifCreationHelper) '+err.message)
    return
  });
}

// to process error from built-in express check
exports.ifErrors = (req, res, next) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      errorsArr = errors.array();
      let msg = "";
      let param = "";
      if (errorsArr[0].nestedErrors) {
          if (errorsArr[0].nestedErrors.length > 0) {
              msg = errorsArr[0].nestedErrors[0].msg;
              param = errorsArr[0].nestedErrors[0].param;

          }
      } else {
          msg = errorsArr[0].msg;
          param = errorsArr[0].param;

      }

      return res.status(422).json({
          status: 'error',
          msg: param+': '+msg ,
          param: param
      });
  }
  next();
}

exports.getLocalIP = function() {
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
  
            results[name].push(net.address);
        }
    }
  }  
  return results['Wi-Fi'][0];
}