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

router.use('/authorization', authorizationRouter)
router.use('/user', userRouter)
router.use('/institution', institutionRouter)
router.use('/admin', adminRouter)
router.use('/verification', verificationRouter)
router.use('/project', projectRouter)
router.use('/resource', resourceRouter)
router.use('/marketplace', marketplaceRouter)

module.exports = router;