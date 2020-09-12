const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin.controller');
const auth = require('../middleware/auth')

const AdminValidator = require('../validator/admin.validator');

// search for a user to be promoted
router.get('/searchUsers', auth, AdminValidator.searchUsers, AdminValidator.ifErrors, adminController.searchUsers)

// get list of regional admin
router.get('/regionalAdmins', auth, AdminValidator.retrieveListValidator, AdminValidator.ifErrors, adminController.getRegionalAdmins)

// get list of admin
router.get('/admins', auth, AdminValidator.retrieveListValidator, AdminValidator.ifErrors, adminController.getAdmins)

// get list of admin lead
router.get('/adminLeads', auth, AdminValidator.retrieveListValidator, AdminValidator.ifErrors, adminController.getAdminLeads)

// promote an individual user to regional admin
router.post('/assignRegionalAdmin', auth, AdminValidator.assignRegionalAdmin, AdminValidator.ifErrors, adminController.assignRegionalAdmin);

// demote a regional admin back to user
router.post('/assignUser', auth, AdminValidator.assignUser, AdminValidator.ifErrors, adminController.assignUser);

// promote an individual user or regional admin to admin
router.post('/assignAdmin', auth, AdminValidator.assignAdmin, AdminValidator.ifErrors, adminController.assignAdmin);

// promote an individual user, regional admin or admin to admin lead
router.post('/assignAdminLead', auth, AdminValidator.assignAdminLead, AdminValidator.ifErrors, adminController.assignAdminLead);

router.post('/suspendUser', auth, AdminValidator.suspendUser, AdminValidator.ifErrors , adminController.suspendUser)

module.exports = router;
