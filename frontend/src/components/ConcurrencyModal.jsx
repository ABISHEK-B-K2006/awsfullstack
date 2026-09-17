import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, ShieldCheck, ArrowRight, Database, Zap, X } from 'lucide-react';

export default function ConcurrencyModal({ isOpen, onClose, claim, decision, payoutAmount, onConfirm }) {
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen || !claim) return null;

  const handleExecute = async () => {
    setIsProcessing(true);
    setStep(1); // Step 1: Acquiring Pessimistic Lock

    setTimeout(() => {
      setStep(2); // Step 2: Validating Buffer & Deducting
      setTimeout(() => {
        setStep(3); // Step 3: Transaction Commit
        setTimeout(async () => {
          try {
            await onConfirm();
            setStep(4); // Success
            setTimeout(() => {
              onClose();
            }, 1200);
          } catch (err) {
            setIsProcessing(false);
          }
        }, 600);
      }, 700);
    }, 800);
  };

  const remaining = parseFloat(claim.policy?.remainingLimit) || 0;
  const payout = parseFloat(payoutAmount) || parseFloat(claim.requestedPayout) || 0;
  const newRemaining = Math.max(0, remaining - payout);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px', padding: '30px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: decision === 'APPROVED' ? '#ecfdf5' : '#fff1f2',
              color: decision === 'APPROVED' ? '#059669' : '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                {decision === 'APPROVED' ? 'Adjudicate & Lock Capacity Buffer' : 'Reject Insurance Claim'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Policy: <strong style={{ color: '#0284c7' }}>{claim.policy?.policyNumber}</strong> &bull; Claim {claim.claimNumber}
              </p>
            </div>
          </div>
          <span className="pessimistic-lock-indicator">
            <span className="pulse-dot"></span>
            @Lock(PESSIMISTIC_WRITE)
          </span>
        </div>

        {/* Transaction Flow Diagram */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <Database size={16} color="#0284c7" />
            <span>Transactional Concurrency Buffer Simulation:</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Current Remaining Buffer</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                ₹{remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: decision === 'APPROVED' ? '#e11d48' : '#64748b', fontWeight: 700 }}>
                {decision === 'APPROVED' ? `-₹${payout.toLocaleString()}` : '₹0.00'}
              </div>
              <ArrowRight size={20} color="#64748b" />
            </div>

            <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Locked Ledger Result</div>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: decision === 'APPROVED' ? (newRemaining > 0 ? '#059669' : '#e11d48') : '#0284c7',
                fontFamily: 'var(--font-mono)',
                marginTop: '2px'
              }}>
                ₹{(decision === 'APPROVED' ? newRemaining : remaining).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Live Stepper when executing */}
        {isProcessing && (
          <div style={{ marginBottom: '20px', padding: '16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} /> Transaction Pipeline:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem' }}>
              <div style={{ color: step >= 1 ? '#047857' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <CheckCircle2 size={15} /> 1. Acquiring pessimistic lock on policy record (FOR UPDATE)
              </div>
              <div style={{ color: step >= 2 ? '#047857' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <CheckCircle2 size={15} /> 2. Verifying buffer (₹{remaining}) &gt;= payout (₹{payout})
              </div>
              <div style={{ color: step >= 3 ? '#047857' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <CheckCircle2 size={15} /> 3. Atomic deduction, scheduling disbursement &amp; commit
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${decision === 'APPROVED' ? 'btn-success' : 'btn-danger'}`}
            onClick={handleExecute}
            disabled={isProcessing}
          >
            {isProcessing ? 'Executing Pessimistic Lock...' : (decision === 'APPROVED' ? 'Confirm & Deduct Capacity' : 'Confirm Rejection')}
          </button>
        </div>
      </div>
    </div>
  );
}
