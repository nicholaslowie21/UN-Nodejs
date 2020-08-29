const express = require('express');
const router = express.Router();

const authorizationRouter = require('./authorization.route')

router.use('/authorization', authorizationRouter)

module.exports = router;