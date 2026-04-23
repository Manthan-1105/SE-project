import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CURRENCIES } from '../utils/constants';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    currency: 'INR', monthlyBudget: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill all required fields'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        currency: form.currency,
        monthlyBudget: parseFloat(form.monthlyBudget) || 0
      });
      toast.success('Account created successfully! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-blob auth-bg-blob--1" />
        <div className="auth-bg-blob auth-bg-blob--2" />
      </div>
      <div className="auth-card auth-card--wide animate-scale-in">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">💸</span>
            <span className="auth-logo-text">SpendSmart</span>
          </div>
          <h2 className="auth-title">Create account</h2>
          <p className="auth-subtitle">Start tracking your expenses today</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                className="form-input" placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                className="form-input" placeholder="you@example.com" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="form-input-wrapper">
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} className="form-input" placeholder="Min 6 characters" />
                <button type="button" className="form-input-toggle" onClick={() => setShowPass(p => !p)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input type={showPass ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword}
                onChange={handleChange} className="form-input" placeholder="Repeat password" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select name="currency" value={form.currency} onChange={handleChange} className="form-input form-select">
                {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Budget (optional)</label>
              <input type="number" name="monthlyBudget" value={form.monthlyBudget} onChange={handleChange}
                className="form-input" placeholder="e.g. 25000" min="0" />
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account →'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
