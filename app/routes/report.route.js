const express = require('express');
const router = express.Router();
const reportController = require('../controller/report.controller');
const auth = require('../middleware/auth')

const ReportValidator = require('../validator/report.validator');
const Helper = require('../service/helper.service');

router.post('/', auth, ReportValidator.createReport, Helper.ifErrors, reportController.createReport)
router.get('/filtered/status', auth, ReportValidator.filteredStatus, reportController.filteredStatus)
router.get('/filtered/regional', auth, ReportValidator.filteredStatus, reportController.filteredRegional)
router.get('/my/filtered', auth, ReportValidator.filteredStatus, reportController.myReport)
router.post('/update/status', auth, ReportValidator.updateReport, Helper.ifErrors, reportController.updateReport)

module.exports = router;
