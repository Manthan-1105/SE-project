import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Header.css';

const PAGE_TITLES = {
  '/': { title: 'Dashboard', subtitle: 'Your financial overview' },
  '/expenses': { title: 'Expenses', subtitle: 'Track all your spending' },
  '/expenses/add': { title: 'Add Expense', subtitle: 'Record a new expense' },
  '/reports': { title: 'Monthly Reports', subtitle: 'Detailed spending analysis' },
  '/suggestions': { title: 'Smart Suggestions', subtitle: 'AI-powered insights' },
  '/profile': { title: 'Settings', subtitle: 'Manage your account' }
};

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const isEditPage = location.pathname.includes('/expenses/edit/');
  const pageInfo = isEditPage
    ? { title: 'Edit Expense', subtitle: 'Update expense details' }
    : PAGE_TITLES[location.pathname] || { title: 'SpendSmart', subtitle: '' };

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <span /><span /><span />
        </button>
        <div>
          <h1 className="header-title">{pageInfo.title}</h1>
          {pageInfo.subtitle && <p className="header-subtitle">{pageInfo.subtitle}</p>}
        </div>
      </div>
      <div className="header-right">
        <Link to="/expenses/add" className="header-add-btn">
          <span>+</span>
          <span className="header-add-text">Add Expense</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
