import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CATEGORIES, MONTHS, formatCurrency, getCategoryInfo } from '../utils/constants';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Cell
} from 'recharts';
import './MonthlyReport.css';

const MonthlyReport = () => {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [summary, setSummary] = useState(null);
  const [yearSummary, setYearSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monthly');
  const currency = user?.currency || 'INR';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [monthRes, yearRes] = await Promise.all([
          api.get(`/expenses/summary/monthly/${year}/${month}`),
          api.get(`/expenses/summary/yearly/${year}`)
        ]);
        setSummary(monthRes.data.summary);
        setYearSummary(yearRes.data.summary);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, month]);

  const categoryData = summary
    ? Object.entries(summary.byCategory).map(([cat, data]) => ({
        name: getCategoryInfo(cat).label,
        icon: getCategoryInfo(cat).icon,
        color: getCategoryInfo(cat).color,
        value: data.total,
        count: data.count
      })).sort((a, b) => b.value - a.value)
    : [];

  const dailyData = summary
    ? Object.entries(summary.dailySpending).map(([day, amount]) => ({
        day: parseInt(day),
        amount
      })).sort((a, b) => a.day - b.day)
    : [];

  const yearlyBarData = yearSummary?.monthlyTotals.map(m => ({
    month: MONTHS[m.month - 1].slice(0, 3),
    amount: m.total,
    count: m.count
  })) || [];

  const CustomTooltip = ({ active, payload, label }) => {
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

  const years = [];
  for (let y = now.getFullYear(); y >= now.getFullYear() - 4; y--) years.push(y);

  return (
    <div className="report-page animate-fade-in">
      <div className="report-controls">
        <div className="report-tabs">
          <button
            className={`report-tab ${activeTab === 'monthly' ? 'report-tab--active' : ''}`}
            onClick={() => setActiveTab('monthly')}
          >Monthly View</button>
          <button
            className={`report-tab ${activeTab === 'yearly' ? 'report-tab--active' : ''}`}
            onClick={() => setActiveTab('yearly')}
          >Yearly View</button>
        </div>

        <div className="report-date-picker">
          {activeTab === 'monthly' && (
            <select
              value={month}
              onChange={e => setMonth(parseInt(e.target.value))}
              className="report-select"
            >
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          )}
          <select
            value={year}
            onChange={e => setYear(parseInt(e.target.value))}
            className="report-select"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="report-skeleton">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />
          ))}
        </div>
      ) : activeTab === 'monthly' ? (
        <>
          {/* Monthly Summary Cards */}
          <div className="report-summary-grid">
            <div className="report-summary-card">
              <div className="report-summary-label">Total Spent</div>
              <div className="report-summary-value">{formatCurrency(summary?.totalAmount || 0, currency)}</div>
              <div className="report-summary-sub">{MONTHS[month - 1]} {year}</div>
            </div>
            <div className="report-summary-card">
              <div className="report-summary-label">Transactions</div>
              <div className="report-summary-value">{summary?.totalExpenses || 0}</div>
              <div className="report-summary-sub">expenses recorded</div>
            </div>
            <div className="report-summary-card">
              <div className="report-summary-label">Daily Average</div>
              <div className="report-summary-value">
                {formatCurrency(summary?.totalAmount
                  ? summary.totalAmount / new Date(year, month, 0).getDate()
                  : 0, currency)}
              </div>
              <div className="report-summary-sub">per day</div>
            </div>
            <div className="report-summary-card">
              <div className="report-summary-label">Top Category</div>
              <div className="report-summary-value" style={{ fontSize: 22 }}>
                {categoryData[0] ? `${categoryData[0].icon} ${categoryData[0].name}` : '—'}
              </div>
              <div className="report-summary-sub">
                {categoryData[0] ? formatCurrency(categoryData[0].value, currency) : 'No data'}
              </div>
            </div>
          </div>

          {/* Daily Spending Chart */}
          {dailyData.length > 0 && (
            <div className="report-chart-card">
              <h3 className="report-chart-title">Daily Spending — {MONTHS[month - 1]} {year}</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyData} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v, currency)} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,92,252,0.08)' }} />
                  <Bar dataKey="amount" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Breakdown */}
          <div className="report-chart-card">
            <h3 className="report-chart-title">Category Breakdown</h3>
            {categoryData.length > 0 ? (
              <div className="category-breakdown">
                {categoryData.map((cat) => {
                  const pct = summary?.totalAmount > 0
                    ? (cat.value / summary.totalAmount) * 100
                    : 0;
                  return (
                    <div key={cat.name} className="breakdown-item">
                      <div className="breakdown-item-header">
                        <div className="breakdown-item-left">
                          <span className="breakdown-icon" style={{ background: `${cat.color}20`, color: cat.color }}>
                            {cat.icon}
                          </span>
                          <div>
                            <div className="breakdown-name">{cat.name}</div>
                            <div className="breakdown-count">{cat.count} transaction{cat.count !== 1 ? 's' : ''}</div>
                          </div>
                        </div>
                        <div className="breakdown-item-right">
                          <div className="breakdown-amount">{formatCurrency(cat.value, currency)}</div>
                          <div className="breakdown-pct">{pct.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className="breakdown-bar">
                        <div
                          className="breakdown-bar-fill"
                          style={{ width: `${pct}%`, background: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="report-empty">No expenses recorded for {MONTHS[month - 1]} {year}</div>
            )}
          </div>

          {/* Expense List */}
          {summary?.expenses?.length > 0 && (
            <div className="report-chart-card">
              <h3 className="report-chart-title">All Transactions</h3>
              <div className="report-expense-list">
                {summary.expenses.map(exp => {
                  const info = getCategoryInfo(exp.category);
                  return (
                    <div key={exp._id} className="report-expense-item">
                      <span className="report-expense-icon" style={{ background: `${info.color}18`, color: info.color }}>
                        {info.icon}
                      </span>
                      <div className="report-expense-info">
                        <div className="report-expense-title">{exp.title}</div>
                        <div className="report-expense-date">
                          {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          {' · '}{info.label}
                        </div>
                      </div>
                      <div className="report-expense-amount" style={{ color: info.color }}>
                        -{formatCurrency(exp.amount, currency)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Yearly Summary */}
          <div className="report-summary-grid">
            <div className="report-summary-card">
              <div className="report-summary-label">Total {year}</div>
              <div className="report-summary-value">{formatCurrency(yearSummary?.totalAmount || 0, currency)}</div>
              <div className="report-summary-sub">{yearSummary?.totalExpenses || 0} transactions</div>
            </div>
            <div className="report-summary-card">
              <div className="report-summary-label">Monthly Average</div>
              <div className="report-summary-value">
                {formatCurrency((yearSummary?.totalAmount || 0) / 12, currency)}
              </div>
              <div className="report-summary-sub">per month</div>
            </div>
            <div className="report-summary-card">
              <div className="report-summary-label">Busiest Month</div>
              <div className="report-summary-value" style={{ fontSize: 20 }}>
                {yearSummary?.monthlyTotals
                  ? MONTHS[yearSummary.monthlyTotals.reduce((max, m) => m.total > max.total ? m : max, { total: 0, month: 1 }).month - 1]
                  : '—'}
              </div>
              <div className="report-summary-sub">highest spending</div>
            </div>
            <div className="report-summary-card">
              <div className="report-summary-label">Top Category</div>
              <div className="report-summary-value" style={{ fontSize: 20 }}>
                {yearSummary?.byCategory && Object.keys(yearSummary.byCategory).length > 0
                  ? (() => {
                      const top = Object.entries(yearSummary.byCategory).sort((a, b) => b[1] - a[1])[0];
                      const info = getCategoryInfo(top[0]);
                      return `${info.icon} ${info.label}`;
                    })()
                  : '—'}
              </div>
              <div className="report-summary-sub">most spent on</div>
            </div>
          </div>

          <div className="report-chart-card">
            <h3 className="report-chart-title">Monthly Spending — {year}</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={yearlyBarData} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v, currency)} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,92,252,0.08)' }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {yearlyBarData.map((entry, i) => (
                    <Cell key={i} fill={entry.month === MONTHS[now.getMonth()].slice(0, 3) ? 'var(--accent)' : 'var(--bg-card-hover)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Yearly Category Breakdown */}
          {yearSummary?.byCategory && Object.keys(yearSummary.byCategory).length > 0 && (
            <div className="report-chart-card">
              <h3 className="report-chart-title">Yearly Category Breakdown</h3>
              <div className="category-breakdown">
                {Object.entries(yearSummary.byCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, amount]) => {
                    const info = getCategoryInfo(cat);
                    const pct = yearSummary.totalAmount > 0 ? (amount / yearSummary.totalAmount) * 100 : 0;
                    return (
                      <div key={cat} className="breakdown-item">
                        <div className="breakdown-item-header">
                          <div className="breakdown-item-left">
                            <span className="breakdown-icon" style={{ background: `${info.color}20`, color: info.color }}>
                              {info.icon}
                            </span>
                            <div className="breakdown-name">{info.label}</div>
                          </div>
                          <div className="breakdown-item-right">
                            <div className="breakdown-amount">{formatCurrency(amount, currency)}</div>
                            <div className="breakdown-pct">{pct.toFixed(1)}%</div>
                          </div>
                        </div>
                        <div className="breakdown-bar">
                          <div className="breakdown-bar-fill" style={{ width: `${pct}%`, background: info.color }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MonthlyReport;
