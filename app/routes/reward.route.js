const express = require('express');
const router = express.Router();
const rewardController = require('../controller/reward.controller');
const auth = require('../middleware/auth')

const RewardValidator = require('../validator/reward.validator');
const Helper = require('../service/helper.service');

router.post('/offerReward', auth, rewardController.multerRequestReward , RewardValidator.requestReward, Helper.ifErrors , rewardController.requestReward)
router.post('/cancelReward', auth, RewardValidator.cancelReward, Helper.ifErrors , rewardController.cancelReward)
router.get('/rewardOfferingList', auth, rewardController.getRewardList)
router.get('/rewardOfferingDetail', auth, RewardValidator.rewardDetail, rewardController.getRewardDetail)

router.post('/createReward', auth, rewardController.multerCreateRequestReward, RewardValidator.createRequestReward, Helper.ifErrors, rewardController.createReward)
router.get('/allReward', auth, rewardController.allPendingReward)

router.post('/rewardClearing', rewardController.manualRewardClearing)

module.exports = router;
