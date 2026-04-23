import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getCategoryInfo } from '../utils/constants';
import './Suggestions.css';

const TIPS = [
  { icon: '🛒', title: '50/30/20 Rule', body: 'Allocate 50% of income for needs, 30% for wants, and 20% for savings & investments.' },
  { icon: '☕', title: 'The Latte Factor', body: 'Small daily expenses like coffee add up. ₹150/day = ₹54,750/year. Track them carefully.' },
  { icon: '📅', title: 'Weekly Review', body: 'Set aside 15 minutes every Sunday to review your weekly spending and plan ahead.' },
  { icon: '🎯', title: 'Envelope Budgeting', body: 'Assign a fixed amount for each category at the start of the month and stick to it.' },
  { icon: '💳', title: 'Card vs Cash', body: 'Studies show people spend 15-20% more when paying with cards vs cash. Be mindful.' },
  { icon: '🔄', title: 'Automate Savings', body: 'Set up automatic transfers to savings on payday. Pay yourself first.' },
  { icon: '📊', title: 'Track Everything', body: 'Even small expenses add up. Tracking every rupee gives you a true picture of your spending.' },
  { icon: '🏷️', title: 'Wait 24 Hours', body: 'For non-essential purchases above ₹1000, wait 24 hours before buying to avoid impulse spending.' }
];

const TYPE_STYLES = {
  warning: { border: 'var(--warning)', bg: 'var(--warning-dim)', badge: '#f59e0b' },
  alert: { border: 'var(--danger)', bg: 'var(--danger-dim)', badge: '#f43f5e' },
  tip: { border: 'var(--accent)', bg: 'var(--accent-dim)', badge: 'var(--accent)' },
  success: { border: 'var(--success)', bg: 'var(--success-dim)', badge: 'var(--success)' },
  info: { border: 'var(--info)', bg: 'var(--info-dim)', badge: 'var(--info)' }
};

const Suggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [topSpending, setTopSpending] = useState([]);
  const [loading, setLoading] = useState(true);
  const currency = user?.currency || 'INR';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const [sugRes, statsRes] = await Promise.all([
          api.get('/dashboard/suggestions'),
          api.get('/dashboard/stats')
        ]);
        setSuggestions(sugRes.data.suggestions);
        const catBreakdown = statsRes.data.stats.categoryBreakdown;
        setTopSpending(
          Object.entries(catBreakdown)
            .map(([cat, data]) => ({ cat, ...data }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="suggestions-page">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />
      ))}
    </div>
  );

  return (
    <div className="suggestions-page animate-fade-in">
      {/* Smart Insights */}
      <section>
        <h2 className="section-title">Smart Insights</h2>
        <div className="suggestions-grid">
          {suggestions.map((sug, i) => {
            const style = TYPE_STYLES[sug.type] || TYPE_STYLES.info;
            return (
              <div
                key={i}
                className="suggestion-card"
                style={{ borderColor: style.border, background: style.bg }}
              >
                <div className="suggestion-card-header">
                  <span className="suggestion-icon">{sug.icon}</span>
                  <span className="suggestion-badge" style={{ background: `${style.badge}20`, color: style.badge }}>
                    {sug.type}
                  </span>
                </div>
                <h3 className="suggestion-title">{sug.title}</h3>
                <p className="suggestion-message">{sug.message}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top Spending Categories */}
      {topSpending.length > 0 && (
        <section>
          <h2 className="section-title">This Month's Top Spending</h2>
          <div className="top-spending-card">
            {topSpending.map(({ cat, total, count }) => {
              const info = getCategoryInfo(cat);
              const maxVal = topSpending[0].total;
              const pct = (total / maxVal) * 100;
              return (
                <div key={cat} className="top-spending-item">
                  <div className="top-spending-left">
                    <span className="top-spending-icon" style={{ background: `${info.color}20`, color: info.color }}>
                      {info.icon}
                    </span>
                    <div>
                      <div className="top-spending-name">{info.label}</div>
                      <div className="top-spending-count">{count} transaction{count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="top-spending-right">
                    <div className="top-spending-bar-wrap">
                      <div className="top-spending-bar">
                        <div
                          className="top-spending-bar-fill"
                          style={{ width: `${pct}%`, background: info.color }}
                        />
                      </div>
                    </div>
                    <div className="top-spending-amount" style={{ color: info.color }}>
                      {formatCurrency(total, currency)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Money Tips */}
      <section>
        <h2 className="section-title">💡 Money-Saving Tips</h2>
        <div className="tips-grid">
          {TIPS.map((tip, i) => (
            <div key={i} className="tip-card">
              <div className="tip-icon">{tip.icon}</div>
              <div className="tip-title">{tip.title}</div>
              <div className="tip-body">{tip.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Budget Reminder */}
      {!user?.monthlyBudget && (
        <div className="budget-reminder">
          <span className="budget-reminder-icon">🎯</span>
          <div>
            <div className="budget-reminder-title">Set a Monthly Budget</div>
            <div className="budget-reminder-text">
              Setting a monthly budget helps you track overspending and get better suggestions.
            </div>
          </div>
          <a href="/profile" className="budget-reminder-btn">Set Budget →</a>
        </div>
      )}
    </div>
  );
};

export default Suggestions;
