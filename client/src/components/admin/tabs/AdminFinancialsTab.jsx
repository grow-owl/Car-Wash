import React from 'react';
import { Lock, Eye, EyeOff, TrendingUp, DollarSign } from 'lucide-react';

export default function AdminFinancialsTab({
  analytics,
  expenses = [],
  showFinancialFigures,
  setShowFinancialFigures
}) {
  return (
    <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
      
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '20px',
        background: 'rgba(0, 49, 53, 0.4)',
        padding: '14px 18px',
        borderRadius: '12px',
        border: '1px solid var(--border-light)'
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={18} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 800, fontSize: 'clamp(0.95rem, 3.2vw, 1.15rem)', color: '#FFFFFF' }}>
            Private Financials & Profit
          </span>
        </div>

        {/* Controls Row: Confidential on Left, Reveal Button on Right */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
          width: '100%'
        }}>
          {/* Square Confidential Badge (Left Side) */}
          <span style={{
            fontSize: '0.66rem',
            padding: '0 8px',
            borderRadius: '4px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontWeight: 800,
            background: 'rgba(0, 229, 255, 0.12)',
            color: 'var(--accent-cyan)',
            border: '1px solid rgba(0, 229, 255, 0.35)',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '28px',
            boxSizing: 'border-box'
          }}>
            Confidential
          </span>

          {/* Compact Reveal Numbers Button (Right Side) */}
          <button
            type="button"
            onClick={() => setShowFinancialFigures(!showFinancialFigures)}
            className="btn-secondary"
            style={{
              height: '28px',
              minHeight: '28px',
              padding: '0 10px',
              fontSize: '0.72rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              fontWeight: 700,
              boxSizing: 'border-box'
            }}
          >
            {showFinancialFigures ? <EyeOff size={13} /> : <Eye size={13} />}
            {showFinancialFigures ? 'Mask Numbers' : 'Reveal Numbers'}
          </button>
        </div>
      </div>

      {/* PRIVATE METRIC CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', background: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 700, letterSpacing: '0.05em' }}>NET PROFIT</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#25D366', marginTop: '6px' }}>
            {showFinancialFigures ? `₹${analytics?.netProfit || (analytics?.monthlyRevenue ? Math.round(analytics.monthlyRevenue * 0.72) : 0)}` : '₹ ••••••'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255, 195, 0, 0.08)', border: '1px solid rgba(255, 195, 0, 0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 700, letterSpacing: '0.05em' }}>MONTHLY REVENUE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-gold)', marginTop: '6px' }}>
            {showFinancialFigures ? `₹${analytics?.monthlyRevenue || 0}` : '₹ ••••••'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255, 89, 100, 0.08)', border: '1px solid rgba(255, 89, 100, 0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 700, letterSpacing: '0.05em' }}>TOTAL EXPENSES</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FF5964', marginTop: '6px' }}>
            {showFinancialFigures ? `₹${expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)}` : '₹ ••••••'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 700, letterSpacing: '0.05em' }}>TODAY'S TURNOVER</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-cyan)', marginTop: '6px' }}>
            {showFinancialFigures ? `₹${analytics?.dailyRevenue || 0}` : '₹ ••••••'}
          </div>
        </div>
      </div>

      {/* EXPENSE CATEGORY BREAKDOWN */}
      <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF' }}>
          Expense Allocation
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          {['Supplies', 'Electricity', 'Salary', 'Maintenance', 'Misc'].map((cat) => {
            const totalForCat = expenses
              .filter(e => e.category?.toLowerCase() === cat.toLowerCase())
              .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
            return (
              <div key={cat} style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(74, 92, 106, 0.25)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>{cat}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
                  {showFinancialFigures ? `₹${totalForCat}` : '₹ ••••'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
