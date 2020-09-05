const env = require('../config/env');
const nodemailer = require('nodemailer');

exports.sendEmail = function(target, subject, message, callback) {
    console.log('reach send email')
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