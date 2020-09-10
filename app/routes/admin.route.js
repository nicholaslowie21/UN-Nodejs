const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin.controller');
const auth = require('../middleware/auth')

const AdminValidator = require('../validator/admin.validator');

// search for a user to be promoted
router.get('/searchUsersToPromote', auth, AdminValidator.searchUsersToPromote, AdminValidator.ifErrors, adminController.searchUsersToPromote)

// promote an individual user to regional admin
router.post('/promoteToRegionalAdmin', auth, AdminValidator.promoteToRegionalAdmin, AdminValidator.ifErrors, adminController.promoteToRegionalAdmin);

// demote a regional admin back to user
router.post('/demoteRegionalAdmin', auth, AdminValidator.demoteRegionalAdmin, AdminValidator.ifErrors, adminController.demoteAnyAdmin);

// promote an individual user or regional admin to admin
router.post('/promoteToAdmin', auth, AdminValidator.promoteToAdmin, AdminValidator.ifErrors, adminController.promoteToAdmin);

// demote an admin back to user
router.post('/demoteAdmin', auth, AdminValidator.demoteAdmin, AdminValidator.ifErrors, adminController.demoteAnyAdmin);

// promote an individual user, regional admin or admin to admin lead
router.post('/promoteToAdminLead', auth, AdminValidator.promoteToAdminLead, AdminValidator.ifErrors, adminController.promoteToAdminLead);

// demote an admin lead back to user
router.post('/demoteAdminLead', auth, AdminValidator.demoteAdminLead, AdminValidator.ifErrors, adminController.demoteAnyAdmin);

module.exports = router;
