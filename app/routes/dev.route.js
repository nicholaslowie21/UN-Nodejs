const express = require('express');
const router = express.Router();
const devController = require('../controller/dev.controller');
const auth = require('../middleware/auth')

const DevValidator = require('../validator/dev.validator');
const Helper = require('../service/helper.service');

router.post('/addTarget', DevValidator.addTarget, Helper.ifErrors, devController.addTarget )

// to import the SDG existing targets
router.post('/csv/target', devController.csvTarget, devController.addTargetCSV)

module.exports = router;
