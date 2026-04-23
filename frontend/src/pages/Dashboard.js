import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  formatCurrency, getCategoryInfo, getRelativeDate, MONTHS
} from '../utils/constants';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import './Dashboard.css';

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="stat-card animate-fade-in">
    <div className="stat-card-icon" style={{ background: `${color}20`, color }}>{icon}</div>
    <div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        <p className="chart-tooltip-value">{formatCurrency(payload[0].value, currency)}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="dashboard">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
    </div>
  );

  const currency = user?.currency || 'INR';
  const pieData = stats ? Object.entries(stats.categoryBreakdown).map(([cat, data]) => ({
    name: cat,
    value: data.total,
    color: getCategoryInfo(cat).color
  })) : [];

  const barData = stats?.last7Days.map(d => ({
    day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    amount: d.total
  })) || [];

  const percentChange = parseFloat(stats?.percentChange || 0);

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <h2>Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋</h2>
        <p>{MONTHS[now.getMonth()]} {now.getFullYear()} overview</p>
      </div>

      <div className="stats-grid">
        <StatCard
          label="This Month"
          value={formatCurrency(stats?.thisMonthTotal || 0, currency)}
          sub={`${stats?.thisMonthCount || 0} transactions`}
          color="var(--accent)"
          icon="💳"
        />
        <StatCard
          label="Last Month"
          value={formatCurrency(stats?.lastMonthTotal || 0, currency)}
          sub={percentChange !== 0 ? `${percentChange > 0 ? '↑' : '↓'} ${Math.abs(percentChange)}% vs last month` : 'No change'}
          color={percentChange > 0 ? 'var(--danger)' : 'var(--success)'}
          icon={percentChange > 0 ? '📈' : '📉'}
        />
        <StatCard
          label="Total Spent"
          value={formatCurrency(stats?.totalAllTime || 0, currency)}
          sub="All time"
          color="var(--info)"
          icon="📊"
        />
        {user?.monthlyBudget > 0 ? (
          <div className="stat-card stat-card--budget animate-fade-in">
            <div className="stat-card-icon" style={{ background: 'rgba(34,211,165,0.12)', color: 'var(--success)' }}>💰</div>
            <div style={{ flex: 1 }}>
              <div className="stat-card-value">{formatCurrency(stats?.budgetRemaining || 0, currency)}</div>
              <div className="stat-card-label">Budget Remaining</div>
              <div className="budget-bar">
                <div
                  className="budget-bar-fill"
                  style={{
                    width: `${stats?.budgetUsed || 0}%`,
                    background: (stats?.budgetUsed || 0) > 80 ? 'var(--danger)' : 'var(--success)'
                  }}
                />
              </div>
              <div className="stat-card-sub">{(stats?.budgetUsed || 0).toFixed(0)}% used of {formatCurrency(user.monthlyBudget, currency)}</div>
            </div>
          </div>
        ) : (
          <StatCard
            label="Set Budget"
            value="No budget"
            sub={<Link to="/profile" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Set one →</Link>}
            color="var(--warning)"
            icon="🎯"
          />
        )}
      </div>

      <div className="dashboard-charts">
        <div className="chart-card animate-fade-in">
          <h3 className="chart-title">Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v, currency)} />
              <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'rgba(124,92,252,0.08)' }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={i === barData.length - 1 ? 'var(--accent)' : 'var(--bg-card-hover)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card animate-fade-in">
          <h3 className="chart-title">By Category</h3>
          {pieData.length > 0 ? (
            <div className="pie-container">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value, currency), '']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {pieData.slice(0, 5).map(item => {
                  const info = getCategoryInfo(item.name);
                  return (
                    <div key={item.name} className="pie-legend-item">
                      <span className="pie-legend-dot" style={{ background: item.color }} />
                      <span className="pie-legend-label">{info.icon} {info.label}</span>
                      <span className="pie-legend-value">{formatCurrency(item.value, currency)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="chart-empty">No expenses this month</div>
          )}
        </div>
      </div>

      <div className="recent-card animate-fade-in">
        <div className="recent-header">
          <h3 className="chart-title">Recent Expenses</h3>
          <Link to="/expenses" className="recent-view-all">View all →</Link>
        </div>
        {stats?.recentExpenses?.length > 0 ? (
          <div className="recent-list">
            {stats.recentExpenses.map(expense => {
              const info = getCategoryInfo(expense.category);
              return (
                <div key={expense._id} className="recent-item">
                  <div className="recent-item-icon" style={{ background: `${info.color}20`, color: info.color }}>
                    {info.icon}
                  </div>
                  <div className="recent-item-info">
                    <div className="recent-item-title">{expense.title}</div>
                    <div className="recent-item-meta">{info.label} · {getRelativeDate(expense.date)}</div>
                  </div>
                  <div className="recent-item-amount" style={{ color: info.color }}>
                    -{formatCurrency(expense.amount, currency)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="chart-empty">
            No expenses yet. <Link to="/expenses/add" style={{ color: 'var(--accent)' }}>Add your first →</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
