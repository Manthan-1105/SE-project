import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CURRENCIES, getCurrencySymbol } from '../utils/constants';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    currency: user?.currency || 'INR',
    monthlyBudget: user?.monthlyBudget || ''
  });
  const [passForm, setPassForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleProfileChange = e =>
    setProfileForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handlePassChange = e =>
    setPassForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await api.put('/auth/update', {
        name: profileForm.name,
        currency: profileForm.currency,
        monthlyBudget: parseFloat(profileForm.monthlyBudget) || 0
      });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword) {
      toast.error('Please fill all fields'); return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setPassLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      toast.success('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="profile-page animate-fade-in">
      {/* User Card */}
      <div className="profile-hero">
        <div className="profile-avatar-large">{initials}</div>
        <div>
          <h2 className="profile-name">{user?.name}</h2>
          <p className="profile-email">{user?.email}</p>
          {memberSince && <p className="profile-since">Member since {memberSince}</p>}
        </div>
        <div className="profile-hero-stats">
          <div className="profile-hero-stat">
            <div className="profile-hero-stat-value">{getCurrencySymbol(user?.currency)}</div>
            <div className="profile-hero-stat-label">Currency</div>
          </div>
          <div className="profile-hero-stat">
            <div className="profile-hero-stat-value">
              {user?.monthlyBudget > 0
                ? `${getCurrencySymbol(user?.currency)}${(user.monthlyBudget / 1000).toFixed(0)}K`
                : 'None'}
            </div>
            <div className="profile-hero-stat-label">Monthly Budget</div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Profile Settings */}
        <div className="profile-card">
          <h3 className="profile-card-title">Account Settings</h3>
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                className="form-input"
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="form-input form-input--disabled"
              />
              <span className="form-hint">Email cannot be changed</span>
            </div>

            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                name="currency"
                value={profileForm.currency}
                onChange={handleProfileChange}
                className="form-input form-select"
              >
                {CURRENCIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Budget</label>
              <div className="form-input-prefix">
                <span className="form-prefix">{getCurrencySymbol(profileForm.currency)}</span>
                <input
                  type="number"
                  name="monthlyBudget"
                  value={profileForm.monthlyBudget}
                  onChange={handleProfileChange}
                  className="form-input form-input--prefixed"
                  placeholder="Enter monthly budget"
                  min="0"
                />
              </div>
              <span className="form-hint">Set to 0 to disable budget tracking</span>
            </div>

            <button type="submit" className="profile-btn" disabled={profileLoading}>
              {profileLoading ? <><span className="spinner" /> Saving...</> : '✓ Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="profile-card">
          <h3 className="profile-card-title">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="profile-form">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div className="form-input-wrapper">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="currentPassword"
                  value={passForm.currentPassword}
                  onChange={handlePassChange}
                  className="form-input"
                  placeholder="Enter current password"
                />
                <button type="button" className="form-input-toggle" onClick={() => setShowPass(p => !p)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                name="newPassword"
                value={passForm.newPassword}
                onChange={handlePassChange}
                className="form-input"
                placeholder="Min 6 characters"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                name="confirmPassword"
                value={passForm.confirmPassword}
                onChange={handlePassChange}
                className="form-input"
                placeholder="Repeat new password"
              />
            </div>

            <button type="submit" className="profile-btn profile-btn--secondary" disabled={passLoading}>
              {passLoading ? <><span className="spinner" /> Updating...</> : '🔒 Update Password'}
            </button>
          </form>

          {/* Security Info */}
          <div className="security-info">
            <h4 className="security-info-title">Security Tips</h4>
            <ul className="security-tips">
              <li>Use a strong password with letters, numbers & symbols</li>
              <li>Never share your password with anyone</li>
              <li>Change your password regularly for better security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
