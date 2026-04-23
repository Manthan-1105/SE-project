const express = require('express');
const router = express.Router();
const { getDashboardStats, getSuggestions } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getDashboardStats);
router.get('/suggestions', getSuggestions);

module.exports = router;
