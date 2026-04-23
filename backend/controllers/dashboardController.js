const Expense = require('../models/Expense');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [thisMonthExpenses, lastMonthExpenses, allExpenses] = await Promise.all([
      Expense.find({ user: req.user.id, date: { $gte: startOfMonth, $lte: endOfMonth } }),
      Expense.find({ user: req.user.id, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Expense.find({ user: req.user.id })
    ]);

    const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalAllTime = allExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Category breakdown this month
    const categoryBreakdown = thisMonthExpenses.reduce((acc, expense) => {
      if (!acc[expense.category]) acc[expense.category] = { total: 0, count: 0 };
      acc[expense.category].total += expense.amount;
      acc[expense.category].count += 1;
      return acc;
    }, {});

    // Last 7 days spending
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      const dayExpenses = allExpenses.filter(e => {
        const eDate = new Date(e.date);
        return eDate >= dayStart && eDate <= dayEnd;
      });
      last7Days.push({
        date: dayStart.toISOString().split('T')[0],
        total: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
        count: dayExpenses.length
      });
    }

    // Recent expenses
    const recentExpenses = await Expense.find({ user: req.user.id })
      .sort('-date')
      .limit(5);

    const user = await User.findById(req.user.id);
    const budgetUsed = user.monthlyBudget > 0 ? (thisMonthTotal / user.monthlyBudget) * 100 : 0;

    res.json({
      success: true,
      stats: {
        thisMonthTotal,
        lastMonthTotal,
        totalAllTime,
        thisMonthCount: thisMonthExpenses.length,
        monthlyBudget: user.monthlyBudget,
        budgetUsed: Math.min(budgetUsed, 100),
        budgetRemaining: Math.max(user.monthlyBudget - thisMonthTotal, 0),
        percentChange: lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1) : 0,
        categoryBreakdown,
        last7Days,
        recentExpenses
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get spending suggestions
// @route   GET /api/dashboard/suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last3MonthsStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    const [thisMonthExpenses, last3MonthsExpenses] = await Promise.all([
      Expense.find({ user: req.user.id, date: { $gte: startOfMonth } }),
      Expense.find({ user: req.user.id, date: { $gte: last3MonthsStart, $lt: startOfMonth } })
    ]);

    const user = await User.findById(req.user.id);
    const suggestions = [];

    const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const avgLast3Months = last3MonthsExpenses.reduce((sum, e) => sum + e.amount, 0) / 3;

    // Budget suggestions
    if (user.monthlyBudget > 0 && thisMonthTotal > user.monthlyBudget * 0.8) {
      suggestions.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Approaching Budget Limit',
        message: `You've used ${((thisMonthTotal / user.monthlyBudget) * 100).toFixed(0)}% of your monthly budget. Consider reducing discretionary spending.`,
        category: 'budget'
      });
    }

    // Category analysis
    const categoryTotals = thisMonthExpenses.reduce((acc, e) => {
      if (!acc[e.category]) acc[e.category] = 0;
      acc[e.category] += e.amount;
      return acc;
    }, {});

    const last3CategoryTotals = last3MonthsExpenses.reduce((acc, e) => {
      if (!acc[e.category]) acc[e.category] = 0;
      acc[e.category] += e.amount;
      return acc;
    }, {});

    Object.keys(categoryTotals).forEach(category => {
      const thisMonth = categoryTotals[category];
      const avgPrev = (last3CategoryTotals[category] || 0) / 3;
      if (avgPrev > 0 && thisMonth > avgPrev * 1.5) {
        suggestions.push({
          type: 'alert',
          icon: '📈',
          title: `High ${category.charAt(0).toUpperCase() + category.slice(1)} Spending`,
          message: `Your ${category} spending is ${((thisMonth / avgPrev - 1) * 100).toFixed(0)}% higher than your 3-month average. Try to cut back.`,
          category
        });
      }
    });

    // Savings tip
    if (thisMonthTotal > avgLast3Months * 1.2) {
      suggestions.push({
        type: 'tip',
        icon: '💡',
        title: 'Spending Above Average',
        message: `You're spending ${((thisMonthTotal / avgLast3Months - 1) * 100).toFixed(0)}% more than your 3-month average this month.`,
        category: 'general'
      });
    }

    // Positive reinforcement
    if (thisMonthTotal < avgLast3Months * 0.8) {
      suggestions.push({
        type: 'success',
        icon: '🎉',
        title: 'Great Savings!',
        message: `You're spending ${((1 - thisMonthTotal / avgLast3Months) * 100).toFixed(0)}% less than your average. Keep it up!`,
        category: 'general'
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'info',
        icon: '✅',
        title: 'Spending on Track',
        message: 'Your spending is within normal ranges. Keep tracking your expenses to stay on budget!',
        category: 'general'
      });
    }

    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
