const express = require('express');
const router = express.Router();
const marketController = require('../controller/marketplace.controller');
const auth = require('../middleware/auth')

const MarketValidator = require('../validator/marketplace.validator');
const Helper = require('../service/helper.service');

router.post('/requestResource', auth, MarketValidator.reqResource, Helper.ifErrors, marketController.reqResource)

module.exports = router;
