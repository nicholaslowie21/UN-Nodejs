// /* added by Lowie */

// const express = require('express');
// const router = express.Router();
// const auth = require('../middleware/auth');

// const attendanceController = require('../controller/attendance.controller');

// const AttendanceValidator = require('../validator/attendance.validator');

// // GET Location Name
// router.get('/getLocation', auth, AttendanceValidator.userLocationAttendance, AttendanceValidator.ifErrors ,attendanceController.getLocation);

// // POST check in user
// router.post('/checkIn', auth, AttendanceValidator.locationNameExists, AttendanceValidator.ifErrors, attendanceController.userCheckIn);

// // POST check out user
// router.post('/checkOut', auth, AttendanceValidator.locationNameExists, AttendanceValidator.ifErrors, attendanceController.userCheckOut);

// // GET User's attendance list
// router.get('/attendanceList', auth, AttendanceValidator.ifErrors, attendanceController.userAttendanceList);

// // GET User's attendance list for the month
// router.get('/monthAttendanceList', auth, AttendanceValidator.userMonthAttendance, AttendanceValidator.ifErrors ,attendanceController.userMonthAttendanceList);

// module.exports = router;
