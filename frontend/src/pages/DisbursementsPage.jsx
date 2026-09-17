import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { disbursementAPI } from '../services/api';
import ReceiptModal from '../components/ReceiptModal';
import confetti from 'canvas-confetti';
import { CreditCard, CheckCircle2, AlertCircle, Zap, Printer } from 'lucide-react';

export default function DisbursementsPage() {
  const { user } = useAuth();
  const [disbursements, setDisbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [executingId, setExecutingId] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  const isManager = user?.role === 'ROLE_INSURANCE_MANAGER';
  const isPolicyholder = user?.role === 'ROLE_POLICYHOLDER';

  useEffect(() => {
    loadDisbursements();
  }, [user]);

  const loadDisbursements = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = isPolicyholder ? await disbursementAPI.getMyDisbursements() : await disbursementAPI.getAll();
      setDisbursements(res.data || []);
    } catch (err) {
      setErrorMsg('Failed to load disbursements registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteWire = async (id, claimNumber) => {
    setExecutingId(id);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await disbursementAPI.execute(id, {});
      setSuccessMsg(`Wire Transfer for Claim ${claimNumber} executed successfully! TX Hash: ${res.data.transactionHash}`);
      
      // Fire celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setActiveReceipt(res.data);
      loadDisbursements();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Wire transfer execution failed.');
    } finally {
      setExecutingId(null);
    }
  };

  const totalSettled = disbursements
    .filter(d => d.executionStatus === 'COMPLETED')
    .reduce((sum, d) => sum + parseFloat(d.disbursementAmount || 0), 0);

  const totalScheduled = disbursements
    .filter(d => d.executionStatus === 'SCHEDULED')
    .reduce((sum, d) => sum + parseFloat(d.disbursementAmount || 0), 0);

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            ACH Wire Disbursements
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Direct electronic wire transfers for approved claim payouts
          </p>
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          <div className="glass-panel" style={{ padding: '10px 18px', textAlign: 'right', background: '#ffffff' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Settled Payouts</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>
              ₹{totalSettled.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '10px 18px', textAlign: 'right', background: '#ffffff' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Scheduled Wires</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-mono)' }}>
              ₹{totalScheduled.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          color: '#be123c',
          fontSize: '0.88rem',
          marginBottom: '20px'
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#047857',
          fontSize: '0.88rem',
          marginBottom: '20px'
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Disbursements Table */}
      <div className="glass-panel" style={{ padding: '24px', background: '#ffffff' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Disbursement ID</th>
                <th>Claim Reference</th>
                <th>Beneficiary Claimant</th>
                <th>Settled Payout</th>
                <th>ACH Routing</th>
                <th>Account Mask</th>
                <th>Execution Hash</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {disbursements.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No wire disbursement transactions recorded yet.
                  </td>
                </tr>
              ) : (
                disbursements.map(d => (
                  <tr key={d.id}>
                    <td><strong style={{ color: '#0284c7' }}>#DISB-{d.id}</strong></td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{d.claim?.claimNumber}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.claim?.policy?.policyNumber}</div>
                    </td>
                    <td>{d.claim?.claimant?.fullName || 'Claimant'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#059669', fontSize: '0.98rem' }}>
                      ₹{parseFloat(d.disbursementAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{d.bankRoutingNumber}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{d.bankAccountNumber}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      {d.transactionHash ? d.transactionHash : '—'}
                    </td>
                    <td>
                      <span className={`badge badge-${d.executionStatus.toLowerCase()}`}>
                        {d.executionStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        {isManager && d.executionStatus === 'SCHEDULED' && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={executingId === d.id}
                            onClick={() => handleExecuteWire(d.id, d.claim?.claimNumber)}
                          >
                            <Zap size={14} />
                            <span>{executingId === d.id ? 'Wiring...' : 'Execute Wire'}</span>
                          </button>
                        )}

                        {d.executionStatus === 'COMPLETED' && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setActiveReceipt(d)}
                            title="View Wire Settlement Receipt"
                          >
                            <Printer size={14} />
                            <span>Receipt</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={!!activeReceipt}
        onClose={() => setActiveReceipt(null)}
        disbursement={activeReceipt}
      />
    </div>
  );
}
