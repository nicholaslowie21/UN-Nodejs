const express = require('express');
const router = express.Router();
const dataController = require('../controller/data.controller');
const auth = require('../middleware/auth')

const DataValidator = require('../validator/data.validator');
const Helper = require('../service/helper.service');

router.get('/dashboard', dataController.getDashboard)
router.get('/accountCharts', DataValidator.accountsChart, Helper.ifErrors, dataController.accountsChart)
router.get('/cumulativeProjects', DataValidator.cumulativeProjects, Helper.ifErrors, dataController.cumulativeProjects)
router.get('/resourcesTypesNumbers', DataValidator.accountsChart, Helper.ifErrors, dataController.resourcesTypesNumbers)
router.get('/contributionsTypesNumbers', DataValidator.accountsChart, Helper.ifErrors, dataController.contributionsNumbers)

router.get('/dataBySDGs', DataValidator.dataBySDG, Helper.ifErrors, dataController.dataBySDG)
router.get('/dataByCountries', DataValidator.dataByCountries, Helper.ifErrors, dataController.dataByCountries )

module.exports = router;
