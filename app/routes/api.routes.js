const express = require('express');
const router = express.Router();

const authorizationRouter = require('./authorization.route')
const userRouter = require('./user.route')
const institutionRouter = require('./institution.route')
const adminRouter = require('./admin.route')
const verificationRouter = require('./verification.route')

router.use('/authorization', authorizationRouter)
router.use('/user', userRouter)
router.use('/institution', institutionRouter)
router.use('/admin', adminRouter)
router.use('/verification', verificationRouter)

module.exports = router;