const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlySummary,
  getYearlySummary
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getExpenses)
  .post([
    body('title').notEmpty().withMessage('Title is required').trim(),
    body('amount').isNumeric().withMessage('Amount must be a number').custom(v => v > 0),
    body('category').notEmpty().withMessage('Category is required'),
    body('date').notEmpty().withMessage('Date is required')
  ], createExpense);

router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

router.get('/summary/monthly/:year/:month', getMonthlySummary);
router.get('/summary/yearly/:year', getYearlySummary);

module.exports = router;
