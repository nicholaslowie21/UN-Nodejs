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
router.get('/allReward', auth, RewardValidator.allReward, Helper.ifErrors, rewardController.allReward)
router.get('/filteredReward', auth, RewardValidator.filteredReward, Helper.ifErrors, rewardController.filteredReward)
router.post('/validateReward', auth, RewardValidator.validateReward, Helper.ifErrors, rewardController.validateReward)
router.post('/updateReward', auth, rewardController.multerCreateRequestReward, RewardValidator.updateReward, Helper.ifErrors, rewardController.updateReward)
router.post('/deleteReward', auth, RewardValidator.deleteReward, Helper.ifErrors, rewardController.deleteReward)

router.post('/rewardClearing', rewardController.manualRewardClearing)

router.get('/marketplace', auth, rewardController.getMarketplace)
router.get('/marketplace/rewardDetail', auth, RewardValidator.rewardDetail, rewardController.getMarketplaceRewardDetail)
router.get('/filter/tier/marketplace', auth, RewardValidator.filteredMarketplaceReward, rewardController.getFilteredMarketplace)

router.post('/redeem', auth, RewardValidator.redeemReward, Helper.ifErrors, rewardController.redeemReward)

module.exports = router;
