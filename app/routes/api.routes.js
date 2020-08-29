const express = require('express');
const router = express.Router();

// const attendanceRouter = require('./attendance.route')
// const rewardsRouter = require('./rewards.route')

router.use('/authorization', authorizationRouter )
router.use('/member', memberRouter)
router.use('/package', packageRouter)
router.use('/subscription', packagelistRouter)
router.use('/news', newsRouter)
router.use('/payment', paymentRouter)
router.use('/user', userRouter)

//added by Lowie(intern)
// router.use('/attendance', attendanceRouter)
// router.use('/rewards', rewardsRouter)

module.exports = router;