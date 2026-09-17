import React from 'react';
import { CheckCircle2, Printer, X, ShieldCheck } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, disbursement }) {
  if (!isOpen || !disbursement) return null;

  const handlePrint = () => {
    window.print();
  };

  const amount = parseFloat(disbursement.disbursementAmount) || 0;
  const dateFormatted = disbursement.disbursementDate
    ? new Date(disbursement.disbursementDate).toLocaleString()
    : new Date().toLocaleString();

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '620px', padding: '32px', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Electronic Wire Settlement Slip</h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Automated Clearing House (ACH) Clearance</div>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Receipt Box */}
        <div style={{
          background: '#f8fafc',
          border: '1px dashed #cbd5e1',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7', letterSpacing: '0.04em' }}>
              INSUREFLOW FINANCIAL NETWORK
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              Transaction Reference: <strong style={{ color: '#0f172a' }}>{disbursement.transactionHash || 'ACH-TXN-PENDING'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.92rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Settled Payout Amount:</span>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#047857', fontFamily: 'var(--font-mono)' }}>
                ₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Claim Reference ID:</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{disbursement.claim?.claimNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Policy Coverage Contract:</span>
              <span style={{ fontWeight: 600 }}>{disbursement.claim?.policy?.policyNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Beneficiary Claimant:</span>
              <span style={{ fontWeight: 600 }}>{disbursement.claim?.claimant?.fullName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>ACH Routing Number:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{disbursement.bankRoutingNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Designated Account:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{disbursement.bankAccountNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Execution Timestamp:</span>
              <span style={{ fontSize: '0.88rem' }}>{dateFormatted}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>Clearance Status:</span>
              <span className="badge badge-completed">{disbursement.executionStatus}</span>
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748b' }}>
            <ShieldCheck size={16} color="#059669" />
            <span>Cryptographically sealed &amp; verified by InsureFlow Transactional Ledger.</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-outline" onClick={handlePrint}>
            <Printer size={16} /> Print Wire Slip
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
