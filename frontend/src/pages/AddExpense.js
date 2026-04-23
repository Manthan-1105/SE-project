import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CATEGORIES, PAYMENT_METHODS, formatDateInput } from '../utils/constants';
import toast from 'react-hot-toast';
import './AddExpense.css';

const AddExpense = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'food',
    date: formatDateInput(new Date()),
    paymentMethod: 'cash',
    description: '',
    isRecurring: false,
    recurringFrequency: ''
  });

  useEffect(() => {
    if (isEdit) {
      api.get(`/expenses/${id}`)
        .then(res => {
          const e = res.data.expense;
          setForm({
            title: e.title,
            amount: e.amount,
            category: e.category,
            date: formatDateInput(e.date),
            paymentMethod: e.paymentMethod || 'cash',
            description: e.description || '',
            isRecurring: e.isRecurring || false,
            recurringFrequency: e.recurringFrequency || ''
          });
        })
        .catch(() => { toast.error('Expense not found'); navigate('/expenses'); })
        .finally(() => setFetching(false));
    }
  }, [id, isEdit, navigate]);

  const handleChange = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Valid amount is required'); return; }
    if (!form.date) { toast.error('Date is required'); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        recurringFrequency: form.isRecurring ? form.recurringFrequency : null
      };
      if (isEdit) {
        await api.put(`/expenses/${id}`, payload);
        toast.success('Expense updated!');
      } else {
        await api.post('/expenses', payload);
        toast.success('Expense added! 🎉');
      }
      navigate('/expenses');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = CATEGORIES.find(c => c.value === form.category);

  if (fetching) return (
    <div className="add-expense-page">
      <div className="skeleton" style={{ height: 500, borderRadius: 20 }} />
    </div>
  );

  return (
    <div className="add-expense-page animate-fade-in">
      <div className="add-expense-card">
        <div className="category-preview" style={{ background: `${selectedCategory?.color}18` }}>
          <span className="category-preview-icon">{selectedCategory?.icon}</span>
          <div>
            <div className="category-preview-name">{selectedCategory?.label}</div>
            <div className="category-preview-sub">Selected category</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="add-expense-form">
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                className="form-input"
                placeholder="e.g. Lunch at restaurant"
                maxLength={100}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount ({user?.currency || 'INR'}) *</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => handleChange('amount', e.target.value)}
                  className="form-input amount-input"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => handleChange('date', e.target.value)}
                  className="form-input"
                  max={formatDateInput(new Date())}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Category *</label>
            <div className="category-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  className={`category-btn ${form.category === cat.value ? 'category-btn--active' : ''}`}
                  onClick={() => handleChange('category', cat.value)}
                  style={form.category === cat.value ? {
                    background: `${cat.color}20`,
                    borderColor: cat.color,
                    color: cat.color
                  } : {}}
                >
                  <span className="category-btn-icon">{cat.icon}</span>
                  <span className="category-btn-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <div className="payment-grid">
                  {PAYMENT_METHODS.map(pm => (
                    <button
                      key={pm.value}
                      type="button"
                      className={`payment-btn ${form.paymentMethod === pm.value ? 'payment-btn--active' : ''}`}
                      onClick={() => handleChange('paymentMethod', pm.value)}
                    >
                      <span>{pm.icon}</span>
                      <span>{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                className="form-input form-textarea"
                placeholder="Add notes about this expense..."
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="form-group">
              <label className="form-label form-label--checkbox">
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={e => handleChange('isRecurring', e.target.checked)}
                  className="form-checkbox"
                />
                <span>Recurring expense</span>
              </label>
              {form.isRecurring && (
                <select
                  value={form.recurringFrequency}
                  onChange={e => handleChange('recurringFrequency', e.target.value)}
                  className="form-input form-select"
                  style={{ marginTop: 8 }}
                >
                  <option value="">Select frequency</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="form-btn form-btn--cancel" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="form-btn form-btn--submit" disabled={loading}>
              {loading
                ? <><span className="spinner" /> {isEdit ? 'Updating...' : 'Adding...'}</>
                : isEdit ? '✓ Update Expense' : '+ Add Expense'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
