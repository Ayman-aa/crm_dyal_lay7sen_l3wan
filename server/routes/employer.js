const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const employerOnly = require('../middleware/employerOnly');
const employerController = require('../controllers/employerController');

// Apply auth and employerOnly middleware to all routes
router.use(auth, employerOnly);

// Dashboard
router.get('/dashboard-stats', employerController.getDashboardStats);

// Manager routes
router.get('/managers', employerController.getManagers);
router.post('/managers', employerController.createManager);
router.put('/managers/:managerId', employerController.updateManager);
router.delete('/managers/:managerId', employerController.deleteManager);

// Lead routes
router.get('/leads', employerController.getLeads);
router.post('/leads', employerController.createLead);
router.put('/leads/:leadId', employerController.updateLead);
router.delete('/leads/:leadId', employerController.deleteLead);

module.exports = router;