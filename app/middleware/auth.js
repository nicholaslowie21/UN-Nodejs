// const jwt = require('jsonwebtoken');
// const env = require('../config/env');


// module.exports = function (req, res, next) {
//     try {
//         let token = req.headers['authorization'].split(' ')[1];
//         var decoded = jwt.verify(token, env.jwtSecret);
//         if (decoded) {
//             req.body.id = decoded._id
//             req.body.memberid = decoded.memberid
//             next();
//         }
//     } catch (err) {
//         console.log(err);
//         res.json({ status: 'error', msg: 'Unauthorized access' });
//     }
// };