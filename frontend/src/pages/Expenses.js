import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CATEGORIES, formatCurrency, formatDate, getCategoryInfo } from '../utils/constants';
import toast from 'react-hot-toast';
import './Expenses.css';

const Expenses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: 'all', startDate: '', endDate: '', search: '', page: 1, limit: 15
  });
  const [deleteId, setDeleteId] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'all') params.append(k, v); });
      const res = await api.get(`/expenses?${params}`);
      setExpenses(res.data.expenses);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleFilterChange = (key, val) => {
    setFilters(p => ({ ...p, [key]: val, page: 1 }));
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Expense deleted');
      setDeleteId(null);
      fetchExpenses();
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  const currency = user?.currency || 'INR';
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="expenses-page">
      <div className="expenses-filters animate-fade-in">
        <div className="filter-search">
          <span className="filter-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
            className="filter-input"
          />
        </div>
        <select
          value={filters.category}
          onChange={e => handleFilterChange('category', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
          ))}
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={e => handleFilterChange('startDate', e.target.value)}
          className="filter-input filter-date"
          placeholder="Start date"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={e => handleFilterChange('endDate', e.target.value)}
          className="filter-input filter-date"
          placeholder="End date"
        />
        {(filters.search || filters.category !== 'all' || filters.startDate || filters.endDate) && (
          <button
            className="filter-clear"
            onClick={() => setFilters({ category: 'all', startDate: '', endDate: '', search: '', page: 1, limit: 15 })}
          >
            Clear ✕
          </button>
        )}
      </div>

      <div className="expenses-summary animate-fade-in">
        <span className="expenses-count">{total} expense{total !== 1 ? 's' : ''}</span>
        <span className="expenses-total">Total: <strong>{formatCurrency(totalAmount, currency)}</strong></span>
      </div>

      {loading ? (
        <div className="expenses-loading">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton expense-skeleton" />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="expenses-empty animate-fade-in">
          <div className="expenses-empty-icon">💸</div>
          <h3>No expenses found</h3>
          <p>
            {filters.search || filters.category !== 'all' ? 'Try adjusting your filters' : 'Start by adding your first expense'}
          </p>
          <Link to="/expenses/add" className="expenses-empty-btn">+ Add Expense</Link>
        </div>
      ) : (
        <div className="expenses-list animate-fade-in">
          {expenses.map(expense => {
            const info = getCategoryInfo(expense.category);
            return (
              <div key={expense._id} className="expense-item">
                <div className="expense-item-icon" style={{ background: `${info.color}18`, color: info.color }}>
                  {info.icon}
                </div>
                <div className="expense-item-info">
                  <div className="expense-item-title">{expense.title}</div>
                  <div className="expense-item-meta">
                    <span className="expense-tag" style={{ background: `${info.color}18`, color: info.color }}>
                      {info.label}
                    </span>
                    <span>·</span>
                    <span>{formatDate(expense.date)}</span>
                    {expense.paymentMethod && <><span>·</span><span className="expense-method">{expense.paymentMethod.toUpperCase()}</span></>}
                  </div>
                  {expense.description && (
                    <div className="expense-item-desc">{expense.description}</div>
                  )}
                </div>
                <div className="expense-item-amount" style={{ color: info.color }}>
                  -{formatCurrency(expense.amount, currency)}
                </div>
                <div className="expense-item-actions">
                  <button className="expense-action-btn expense-action-btn--edit"
                    onClick={() => navigate(`/expenses/edit/${expense._id}`)} title="Edit">
                    ✏️
                  </button>
                  <button className="expense-action-btn expense-action-btn--delete"
                    onClick={() => setDeleteId(expense._id)} title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination animate-fade-in">
          <button
            className="page-btn"
            disabled={filters.page === 1}
            onClick={() => handleFilterChange('page', filters.page - 1)}
          >← Prev</button>
          <span className="page-info">Page {filters.page} of {totalPages}</span>
          <button
            className="page-btn"
            disabled={filters.page === totalPages}
            onClick={() => handleFilterChange('page', filters.page + 1)}
          >Next →</button>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <h3 className="modal-title">Delete Expense?</h3>
            <p className="modal-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="modal-btn modal-btn--cancel" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="modal-btn modal-btn--danger" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
