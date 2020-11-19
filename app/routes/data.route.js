const express = require('express');
const router = express.Router();
const dataController = require('../controller/data.controller');
const auth = require('../middleware/auth')

const Helper = require('../service/helper.service');

router.get('/dashboard', dataController.getDashboard)

module.exports = router;
