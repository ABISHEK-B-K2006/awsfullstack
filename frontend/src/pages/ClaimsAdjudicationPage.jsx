import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { claimAPI } from '../services/api';
import ConcurrencyModal from '../components/ConcurrencyModal';
import { FileCheck2, CheckCircle2, XCircle, AlertCircle, Clock, Search, Filter, Lock, Eye, Check } from 'lucide-react';

export default function ClaimsAdjudicationPage({ onNavigate }) {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Adjudication Modal State
  const [activeClaim, setActiveClaim] = useState(null);
  const [decision, setDecision] = useState('APPROVED');
  const [customPayout, setCustomPayout] = useState('');
  const [adjudicationNotes, setAdjudicationNotes] = useState('');
  const [isConcurrencyModalOpen, setIsConcurrencyModalOpen] = useState(false);

  // Review Modal State (Adjuster)
  const [reviewingClaim, setReviewingClaim] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('Site inspection completed. Invoices verified against damage narrative.');
  const [recommendation, setRecommendation] = useState('RECOMMEND_APPROVAL');

  const isManager = user?.role === 'ROLE_INSURANCE_MANAGER';
  const isAdjuster = user?.role === 'ROLE_CLAIMS_ADJUSTER';
  const isPolicyholder = user?.role === 'ROLE_POLICYHOLDER';

  useEffect(() => {
    loadClaims();
  }, [user]);

  const loadClaims = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = isPolicyholder ? await claimAPI.getMyClaims() : await claimAPI.getAll();
      setClaims(res.data || []);
    } catch (err) {
      setErrorMsg('Failed to load claims queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdjudicate = (claim, dec) => {
    setActiveClaim(claim);
    setDecision(dec);
    setCustomPayout(claim.requestedPayout);
    setAdjudicationNotes(dec === 'APPROVED' ? 'Approved following thorough adjuster verification and pessimistic lock capacity deduction.' : 'Rejected due to policy coverage exclusions.');
    setIsConcurrencyModalOpen(true);
  };

  const handleExecuteAdjudication = async () => {
    if (!activeClaim) return;
    try {
      const payload = {
        decision: decision,
        approvedAmount: decision === 'APPROVED' ? parseFloat(customPayout) : 0,
        adjudicationNotes: adjudicationNotes
      };
      const res = await claimAPI.adjudicate(activeClaim.id, payload);
      setSuccessMsg(`Claim ${res.data.claimNumber} adjudicated as ${res.data.claimStatus}!`);
      loadClaims();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Adjudication failed.');
      throw err;
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewingClaim) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await claimAPI.review(reviewingClaim.id, {
        reviewNotes,
        recommendation
      });
      setSuccessMsg(`Adjuster review recorded for Claim ${reviewingClaim.claimNumber}. Status updated to UNDER_REVIEW.`);
      setReviewingClaim(null);
      loadClaims();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  const filteredClaims = claims.filter(c => {
    const matchesFilter = filter === 'ALL' || c.claimStatus === filter;
    const matchesSearch = c.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
                          (c.policy?.policyNumber && c.policy.policyNumber.toLowerCase().includes(search.toLowerCase())) ||
                          (c.claimant?.fullName && c.claimant.fullName.toLowerCase().includes(search.toLowerCase())) ||
                          c.incidentDescription.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            {isManager ? 'Claims Adjudication' : 'Claims Review Backlog'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            {isManager
              ? 'Review claims and finalize capacity settlements'
              : 'Inspect loss notices and verify incident evidence'}
          </p>
        </div>

        {isManager && (
          <span className="pessimistic-lock-indicator">
            <span className="pulse-dot"></span>
            @Lock Active
          </span>
        )}
      </div>

      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.35)',
          color: '#fb7185',
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
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#34d399',
          fontSize: '0.88rem',
          marginBottom: '20px'
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by claim #, policy #, claimant, or loss narrative..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map(st => (
            <button
              key={st}
              type="button"
              className={`btn btn-sm ${filter === st ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Claims Queue Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Policy Reference</th>
                <th>Claimant</th>
                <th>Incident Date</th>
                <th>Loss Narrative</th>
                <th>Requested</th>
                <th>Approved</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No claims found in this queue.
                  </td>
                </tr>
              ) : (
                filteredClaims.map(claim => {
                  const canAdjudicate = isManager && (claim.claimStatus === 'SUBMITTED' || claim.claimStatus === 'UNDER_REVIEW');
                  const canReview = (isAdjuster || isManager) && (claim.claimStatus === 'SUBMITTED' || claim.claimStatus === 'UNDER_REVIEW');

                  return (
                    <tr key={claim.id}>
                      <td><strong style={{ color: 'var(--accent-cyan)' }}>{claim.claimNumber}</strong></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{claim.policy?.policyNumber}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Buffer: ₹{parseFloat(claim.policy?.remainingLimit || 0).toLocaleString()}
                        </div>
                      </td>
                      <td>{claim.claimant?.fullName}</td>
                      <td>{claim.incidentDate}</td>
                      <td style={{ maxWidth: '280px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {claim.incidentDescription}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        ₹{parseFloat(claim.requestedPayout).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: claim.approvedPayout ? '#34d399' : 'var(--text-muted)' }}>
                        {claim.approvedPayout ? `₹${parseFloat(claim.approvedPayout).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td>
                        <span className={`badge badge-${claim.claimStatus.toLowerCase()}`}>
                          {claim.claimStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {/* Adjuster Review */}
                          {canReview && (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => setReviewingClaim(claim)}
                              title="Submit Adjuster Review"
                              style={{ padding: '6px 10px', color: '#7c3aed', borderColor: '#c4b5fd' }}
                            >
                              Inspect
                            </button>
                          )}

                          {/* Manager Adjudication (Pessimistic Lock) */}
                          {canAdjudicate && (
                            <>
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={() => handleOpenAdjudicate(claim, 'APPROVED')}
                                style={{ padding: '6px 10px' }}
                              >
                                <Lock size={12} /> Approve
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleOpenAdjudicate(claim, 'REJECTED')}
                                style={{ padding: '6px 10px' }}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {!canAdjudicate && !canReview && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Finalized</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjuster Review Modal */}
      {reviewingClaim && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '14px' }}>
              Claims Adjuster Loss Verification
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Inspecting Claim <strong>{reviewingClaim.claimNumber}</strong> on Policy <strong>{reviewingClaim.policy?.policyNumber}</strong>
            </p>

            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Adjuster Findings &amp; Evidence Notes:</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Adjudication Recommendation:</label>
                <select
                  className="form-control"
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                >
                  <option value="RECOMMEND_APPROVAL">Recommend Full Approval</option>
                  <option value="RECOMMEND_PARTIAL">Recommend Partial Settlement</option>
                  <option value="RECOMMEND_REJECTION">Recommend Rejection (Exclusion Found)</option>
                  <option value="REQUEST_MORE_INFO">Request Additional Police/Medical Records</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setReviewingClaim(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Adjuster Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Concurrency Modal */}
      <ConcurrencyModal
        isOpen={isConcurrencyModalOpen}
        onClose={() => setIsConcurrencyModalOpen(false)}
        claim={activeClaim}
        decision={decision}
        payoutAmount={customPayout}
        onConfirm={handleExecuteAdjudication}
      />
    </div>
  );
}
