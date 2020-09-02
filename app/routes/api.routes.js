const express = require('express');
const router = express.Router();

const authorizationRouter = require('./authorization.route')
const userRouter = require('./user.route')

router.use('/authorization', authorizationRouter)
router.use('/user', userRouter)

module.exports = router;