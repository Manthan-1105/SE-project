export const CATEGORIES = [
  { value: 'food', label: 'Food & Dining', icon: '🍔', color: '#f97316' },
  { value: 'travel', label: 'Travel', icon: '✈️', color: '#06b6d4' },
  { value: 'clothes', label: 'Clothes', icon: '👗', color: '#ec4899' },
  { value: 'bills', label: 'Bills & Utilities', icon: '⚡', color: '#f59e0b' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
  { value: 'health', label: 'Health & Fitness', icon: '💊', color: '#22c55e' },
  { value: 'education', label: 'Education', icon: '📚', color: '#3b82f6' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️', color: '#e879f9' },
  { value: 'housing', label: 'Housing & Rent', icon: '🏠', color: '#f43f5e' },
  { value: 'personal', label: 'Personal Care', icon: '💆', color: '#14b8a6' },
  { value: 'other', label: 'Other', icon: '📦', color: '#94a3b8' }
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'card', label: 'Card', icon: '💳' },
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'netbanking', label: 'Net Banking', icon: '🏦' },
  { value: 'other', label: 'Other', icon: '💰' }
];

export const CURRENCIES = [
  { value: 'INR', label: '₹ Indian Rupee', symbol: '₹' },
  { value: 'USD', label: '$ US Dollar', symbol: '$' },
  { value: 'EUR', label: '€ Euro', symbol: '€' },
  { value: 'GBP', label: '£ British Pound', symbol: '£' },
  { value: 'JPY', label: '¥ Japanese Yen', symbol: '¥' }
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const getCategoryInfo = (value) =>
  CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1];

export const getCurrencySymbol = (currency) =>
  CURRENCIES.find(c => c.value === currency)?.symbol || '₹';

export const formatCurrency = (amount, currency = 'INR') => {
  const symbol = getCurrencySymbol(currency);
  if (amount >= 100000) return `${symbol}${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${symbol}${(amount / 1000).toFixed(1)}K`;
  return `${symbol}${amount.toFixed(2)}`;
};

export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateInput = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const getRelativeDate = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return formatDate(date);
};
