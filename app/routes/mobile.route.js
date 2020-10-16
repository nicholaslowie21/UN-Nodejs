const express = require('express');
const router = express.Router();
const mobileController = require('../controller/mobile.controller');
const auth = require('../middleware/auth')

const MobileValidator = require('../validator/mobile.validator');
const Helper = require('../service/helper.service');

router.post('/institutionChoice', auth, MobileValidator.institutionChoice, Helper.ifErrors, mobileController.institutionChoice )
router.delete('/institutionChoice', auth, mobileController.deleteInsitutionChoice )
router.post('/addContact', auth, MobileValidator.addContact, Helper.ifErrors, mobileController.addContact )
router.post('/deleteContact', auth, MobileValidator.deleteContact, Helper.ifErrors, mobileController.deleteContact )
router.get('/contactList', auth, mobileController.contactList)

module.exports = router;
