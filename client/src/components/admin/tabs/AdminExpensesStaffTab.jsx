import React from 'react';
import { Lock, Eye, EyeOff, Plus, Phone, Trash2 } from 'lucide-react';

export default function AdminExpensesStaffTab({
  expenseSubTab,
  setExpenseSubTab,
  expenses = [],
  staff = [],
  analytics,
  showFinancialFigures,
  setShowFinancialFigures,
  expCategory,
  setExpCategory,
  expAmount,
  setExpAmount,
  expNotes,
  setExpNotes,
  handleAddExpenseSubmit,
  handleOpenAddStaff,
  handleOpenEditStaff,
  handleStaffQuickStatusChange,
  openDeleteConfirm,
  handleDeleteExpense,
  handleDeleteStaff
}) {
  return (
    <div className="glass-panel" style={{ padding: '16px', borderRadius: '14px' }}>
      
      {/* Sub-tab Navigation (Touch Scroll Friendly) */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '12px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none'
      }}>
        <button
          onClick={() => setExpenseSubTab('expenses')}
          style={{
            background: expenseSubTab === 'expenses' ? 'var(--accent-cyan)' : 'transparent',
            color: expenseSubTab === 'expenses' ? '#06141B' : '#CCD0CF',
            fontWeight: 700,
            fontSize: '0.82rem',
            border: 'none',
            padding: '7px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          Expenses & Bills ({expenses.length})
        </button>
        <button
          onClick={() => setExpenseSubTab('staff')}
          style={{
            background: expenseSubTab === 'staff' ? 'var(--accent-cyan)' : 'transparent',
            color: expenseSubTab === 'staff' ? '#06141B' : '#CCD0CF',
            fontWeight: 700,
            fontSize: '0.82rem',
            border: 'none',
            padding: '7px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          Staff Members ({staff.length})
        </button>
        <button
          onClick={() => setExpenseSubTab('financials')}
          style={{
            background: expenseSubTab === 'financials' ? 'var(--accent-gold)' : 'rgba(255, 195, 0, 0.1)',
            color: expenseSubTab === 'financials' ? '#06141B' : 'var(--accent-gold)',
            fontWeight: 800,
            fontSize: '0.82rem',
            border: '1px solid var(--accent-gold)',
            padding: '7px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <Lock size={13} /> Private Financials & Profit
        </button>
      </div>

      {/* 1. EXPENSES SUB-TAB */}
      {expenseSubTab === 'expenses' && (
        <div>
          {/* Responsive Add Expense Form */}
          <form onSubmit={handleAddExpenseSubmit} style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '18px',
            background: 'rgba(0, 30, 35, 0.45)',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(74, 92, 106, 0.25)'
          }}>
            <select
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value)}
              className="input-field"
              style={{ flex: '1 1 140px', minHeight: '38px', fontSize: '0.82rem', padding: '6px 10px' }}
            >
              <option value="Supplies">Chemicals & Shampoos</option>
              <option value="Electricity">Electricity & Utilities</option>
              <option value="Salary">Staff Payroll</option>
              <option value="Maintenance">Equipment Maintenance</option>
              <option value="Rent">Rent & Bay Lease</option>
              <option value="Water">Water Supply</option>
              <option value="Marketing">Marketing & Ads</option>
              <option value="Misc">Misc Overheads</option>
            </select>

            <input
              type="number"
              required
              placeholder="Amount (₹) *"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              className="input-field"
              style={{ flex: '1 1 100px', minHeight: '38px', fontSize: '0.82rem', padding: '6px 10px' }}
            />

            <input
              type="text"
              placeholder="Notes / description (optional)..."
              value={expNotes}
              onChange={(e) => setExpNotes(e.target.value)}
              className="input-field"
              style={{ flex: '2 1 180px', minHeight: '38px', fontSize: '0.82rem', padding: '6px 10px' }}
            />

            <button
              type="submit"
              className="btn-gold"
              style={{ minHeight: '38px', padding: '0 16px', fontSize: '0.82rem', borderRadius: '6px', fontWeight: 800, flex: '1 1 auto', justifyContent: 'center' }}
            >
              + Add Expense
            </button>
          </form>

          {/* Total Expenses Summary Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF' }}>
              All Recorded Expenses ({expenses.length})
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#FF5964' }}>
              Total: ₹{expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)}
            </div>
          </div>

          {expenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--ice-tint)', background: 'rgba(0, 49, 53, 0.2)', borderRadius: '10px', border: '1px dashed rgba(74, 92, 106, 0.3)' }}>
              No expenses recorded yet. Fill the form above to log expenses.
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW (>= 641px) */}
              <div className="expenses-desktop-table">
                <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--ice-tint)' }}>
                        <th style={{ padding: '10px' }}>Category</th>
                        <th style={{ padding: '10px' }}>Notes / Description</th>
                        <th style={{ padding: '10px' }}>Amount</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp) => (
                        <tr key={exp._id} style={{ borderBottom: '1px solid rgba(74, 92, 106, 0.2)' }}>
                          <td style={{ padding: '10px', fontWeight: 700, color: '#FFFFFF' }}>
                            <span className="badge badge-cyan" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                              {exp.category}
                            </span>
                          </td>
                          <td style={{ padding: '10px', color: 'var(--ice-tint)', maxWidth: '280px', wordBreak: 'break-word' }}>
                            {exp.notes || exp.description || '-'}
                          </td>
                          <td style={{ padding: '10px', fontWeight: 800, color: '#FF5964', fontSize: '0.98rem' }}>
                            ₹{exp.amount}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => openDeleteConfirm(
                                'Delete Expense?',
                                `₹${exp.amount} (${exp.category})`,
                                () => handleDeleteExpense(exp._id)
                              )}
                              style={{
                                height: '28px',
                                width: '28px',
                                padding: 0,
                                borderRadius: '6px',
                                background: 'rgba(255, 89, 100, 0.12)',
                                border: '1px solid rgba(255, 89, 100, 0.4)',
                                color: '#FF5964',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Delete Expense"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE CARDS VIEW (< 640px) - NO HORIZONTAL SCROLLING */}
              <div className="expenses-mobile-cards" style={{ display: 'none', flexDirection: 'column', gap: '8px' }}>
                {expenses.map((exp) => (
                  <div
                    key={exp._id}
                    className="glass-card"
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(0, 49, 53, 0.45)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.72rem', padding: '2px 8px', fontWeight: 700 }}>
                        {exp.category}
                      </span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#FF5964' }}>
                        ₹{exp.amount}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <div style={{ fontSize: '0.78rem', color: (exp.notes || exp.description) ? '#FFFFFF' : 'var(--ice-tint)', wordBreak: 'break-word', flex: 1, paddingRight: '8px' }}>
                        {exp.notes || exp.description || '-'}
                      </div>
                      <button
                        type="button"
                        onClick={() => openDeleteConfirm(
                          'Delete Expense?',
                          `₹${exp.amount} (${exp.category})`,
                          () => handleDeleteExpense(exp._id)
                        )}
                        style={{
                          height: '28px',
                          width: '28px',
                          padding: '0',
                          borderRadius: '6px',
                          background: 'rgba(255, 89, 100, 0.12)',
                          border: '1px solid rgba(255, 89, 100, 0.4)',
                          color: '#FF5964',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                        title="Delete Expense"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. STAFF MEMBERS SUB-TAB */}
      {expenseSubTab === 'staff' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>
              Staff Members ({staff.length})
            </h4>

            <button
              type="button"
              onClick={handleOpenAddStaff}
              className="btn-gold"
              style={{ padding: '7px 16px', fontSize: '0.82rem', borderRadius: '8px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} /> Add Staff Member
            </button>
          </div>

          {staff.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No staff members found. Click "+ Add Staff Member" to add your first technician.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {staff.map((stf) => {
                const isAvail = stf.status === 'Available';
                const isOnJob = stf.status === 'On Job';
                const statusColor = isAvail ? '#25D366' : isOnJob ? 'var(--accent-cyan)' : 'var(--ice-tint)';
                const statusBorder = isAvail ? 'rgba(37, 211, 102, 0.4)' : isOnJob ? 'rgba(0, 229, 255, 0.4)' : 'rgba(74, 92, 106, 0.4)';

                return (
                  <div
                    key={stf._id}
                    className="glass-card"
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(0, 49, 53, 0.45)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF' }}>{stf.name}</div>

                        <select
                          value={stf.status || 'Available'}
                          onChange={(e) => handleStaffQuickStatusChange(stf._id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: '#06141B',
                            color: statusColor,
                            border: `1px solid ${statusBorder}`,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="Available">Available</option>
                          <option value="On Job">On Job</option>
                          <option value="Off Duty">Off Duty</option>
                        </select>
                      </div>

                      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--ice-tint)' }}>
                        <Phone size={13} color="var(--accent-cyan)" /> {stf.phone || '-'}
                      </div>
                    </div>

                    {/* Action Buttons: Edit & Delete */}
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(74, 92, 106, 0.25)', paddingTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditStaff(stf)}
                        className="btn-secondary"
                        style={{ flex: 1, padding: '6px 10px', fontSize: '0.78rem', borderRadius: '6px', justifyContent: 'center' }}
                      >
                        Edit Details
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteConfirm(
                          'Remove Staff Member?',
                          stf.name,
                          () => handleDeleteStaff(stf._id)
                        )}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(255, 89, 100, 0.12)',
                          border: '1px solid #FF5964',
                          color: '#FF5964',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. PRIVATE FINANCIALS SUB-TAB */}
      {expenseSubTab === 'financials' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px',
            background: 'rgba(0, 49, 53, 0.4)',
            padding: '14px 18px',
            borderRadius: '12px',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="var(--accent-cyan)" />
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF' }}>Private Financials</span>
              <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>Confidential</span>
            </div>

            <button
              type="button"
              onClick={() => setShowFinancialFigures(!showFinancialFigures)}
              className="btn-secondary"
              style={{
                padding: '8px 16px',
                fontSize: '0.82rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {showFinancialFigures ? <EyeOff size={16} /> : <Eye size={16} />}
              {showFinancialFigures ? 'Mask Numbers' : 'Reveal Numbers'}
            </button>
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
      )}

    </div>
  );
}
