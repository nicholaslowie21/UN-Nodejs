const express = require('express');
const router = express.Router();
const targetController = require('../controller/target.controller');
const auth = require('../middleware/auth')

const TargetValidator = require('../validator/target.validator');
const Helper = require('../service/helper.service');

router.post('/possible/targets', auth, TargetValidator.possibleTarget, Helper.ifErrors, targetController.possibleTarget)

router.post('/account/targets', auth, TargetValidator.updateAccountTarget, Helper.ifErrors, targetController.updateAccountTarget)
router.get('/account/targets', auth, TargetValidator.getAccountTarget, Helper.ifErrors, targetController.accountTargetLists)

router.post('/project/targets', auth, TargetValidator.updateProjectTarget, Helper.ifErrors, targetController.updateProjectTarget)
router.get('/project/targets', TargetValidator.getProjectTarget, Helper.ifErrors, targetController.getProjectTarget)

module.exports = router;
