const express = require('express');
const router = express.Router();

const authorizationRouter = require('./authorization.route')
const userRouter = require('./user.route')
const institutionRouter = require('./institution.route')
const adminRouter = require('./admin.route')
const verificationRouter = require('./verification.route')
const projectRouter = require('./project.route')
const resourceRouter = require('./resource.route')
const marketplaceRouter = require('./marketplace.route')
const rewardRouter = require('./reward.route')
const mobileRouter = require('./mobile.route')
const communicationRouter = require('./communication.route')
const reportRouter = require('./report.route')

router.use('/authorization', authorizationRouter)
router.use('/user', userRouter)
router.use('/institution', institutionRouter)
router.use('/admin', adminRouter)
router.use('/verification', verificationRouter)
router.use('/project', projectRouter)
router.use('/resource', resourceRouter)
router.use('/marketplace', marketplaceRouter)
router.use('/reward', rewardRouter)
router.use('/mobile', mobileRouter)
router.use('/communication', communicationRouter)
router.use('/report', reportRouter)

module.exports = router;