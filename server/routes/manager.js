const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const managerOnly = require('../middleware/managerOnly');
const managerController = require('../controllers/managerController');

// Apply auth and managerOnly middleware to all routes
router.use(auth, managerOnly);

// Lead routes
router.get('/leads', managerController.getLeads);
router.patch('/leads/:id', managerController.updateLeadStatus);

module.exports = router;