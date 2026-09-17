import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { policyAPI } from '../services/api';
import CapacityBar from '../components/CapacityBar';
import { Shield, Plus, CheckCircle2, AlertCircle, Trash2, Activity, Search, X } from 'lucide-react';

export default function PoliciesPage({ onNavigate }) {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form State
  const [newPolicy, setNewPolicy] = useState({
    accountId: 1,
    coverageType: 'Comprehensive Commercial Property',
    premiumAmount: '4500.00',
    maxCoverageLimit: '300000.00',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const isUnderwriterOrManager = user?.role === 'ROLE_UNDERWRITER' || user?.role === 'ROLE_INSURANCE_MANAGER';
  const isPolicyholder = user?.role === 'ROLE_POLICYHOLDER';

  useEffect(() => {
    loadPolicies();
  }, [user]);

  const loadPolicies = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let res = isPolicyholder ? await policyAPI.getMyPolicies() : await policyAPI.getAll();
      let pols = res.data || [];
      if (isPolicyholder && pols.length === 0) {
        const allRes = await policyAPI.getAll();
        pols = allRes.data || [];
      }
      setPolicies(pols);
    } catch (err) {
      setErrorMsg('Failed to load insurance policies.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const payload = {
        ...newPolicy,
        accountId: parseInt(newPolicy.accountId),
        premiumAmount: parseFloat(newPolicy.premiumAmount),
        maxCoverageLimit: parseFloat(newPolicy.maxCoverageLimit)
      };
      const res = await policyAPI.create(payload);
      setSuccessMsg(`Policy ${res.data.policyNumber} provisioned successfully in PENDING state.`);
      setIsModalOpen(false);
      loadPolicies();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create policy.');
    }
  };

  const handleActivatePolicy = async (id, policyNumber) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await policyAPI.activate(id);
      setSuccessMsg(`Policy ${policyNumber} activated successfully! Coverage is now active.`);
      loadPolicies();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to activate policy.');
    }
  };

  const handleDeletePolicy = async (id, policyNumber) => {
    if (!window.confirm(`Are you sure you want to delete policy ${policyNumber}?`)) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await policyAPI.delete(id);
      setSuccessMsg(`Policy ${policyNumber} deleted.`);
      loadPolicies();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete policy.');
    }
  };

  const filteredPolicies = policies.filter(p => {
    const matchesFilter = filter === 'ALL' || p.policyStatus === filter;
    const matchesSearch = p.policyNumber.toLowerCase().includes(search.toLowerCase()) ||
                          p.coverageType.toLowerCase().includes(search.toLowerCase()) ||
                          (p.account?.fullName && p.account.fullName.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div
      className="page-wrapper"
      style={isPolicyholder ? {
        backgroundImage: "url('/policy holder.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        minHeight: 'calc(100vh - 68px)',
        padding: '32px 36px 60px'
      } : {}}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            {isPolicyholder ? 'My Insurance Coverages' : 'Policy Underwriting & Provisioning'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            {isPolicyholder
              ? 'Active coverage limits and policy buffers'
              : 'Provision, evaluate, and manage policy contracts'}
          </p>
        </div>

        {isUnderwriterOrManager && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} /> Provision Policy
          </button>
        )}
      </div>

      {/* Alerts */}
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

      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', background: '#ffffff' }}>
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by policy #, coverage type, or holder..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'ACTIVE', 'PENDING', 'EXPIRED'].map(st => (
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

      {/* Policies Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
        {filteredPolicies.length === 0 ? (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', color: '#64748b', background: '#ffffff' }}>
            <Shield size={42} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p>No insurance policies found matching the filter criteria.</p>
          </div>
        ) : (
          filteredPolicies.map(policy => (
            <div key={policy.id} className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                    {policy.policyNumber}
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    {policy.coverageType}
                  </div>
                </div>
                <span className={`badge badge-${policy.policyStatus.toLowerCase()}`}>
                  {policy.policyStatus}
                </span>
              </div>

              <div style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '14px' }}>
                Insured Holder: <strong style={{ color: '#0f172a' }}>{policy.account?.fullName || 'N/A'}</strong> ({policy.account?.email})
              </div>

              {/* Capacity Progress Bar */}
              <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <CapacityBar
                  maxLimit={policy.maxCoverageLimit}
                  remainingLimit={policy.remainingLimit}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.84rem', color: '#475569', marginBottom: '18px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Annual Premium:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                    ₹{parseFloat(policy.premiumAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Term Expiry:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {policy.expiryDate}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                {isPolicyholder && policy.policyStatus === 'ACTIVE' && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => onNavigate('claim-intake')}
                  >
                    File Loss Claim
                  </button>
                )}

                {isUnderwriterOrManager && policy.policyStatus === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ color: '#b45309', borderColor: '#fde68a' }}
                      onClick={() => onNavigate('assessments')}
                    >
                      <Activity size={14} /> Risk Audit
                    </button>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={() => handleActivatePolicy(policy.id, policy.policyNumber)}
                    >
                      <CheckCircle2 size={14} /> Activate Policy
                    </button>
                  </>
                )}

                {isUnderwriterOrManager && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ color: '#e11d48', padding: '6px 10px' }}
                    onClick={() => handleDeletePolicy(policy.id, policy.policyNumber)}
                    title="Delete Policy"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Provision Policy Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '30px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={20} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Provision New Insurance Policy</h3>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePolicy}>
              <div className="form-group">
                <label>Target Policyholder Account ID:</label>
                <input
                  type="number"
                  className="form-control"
                  value={newPolicy.accountId}
                  onChange={(e) => setNewPolicy({ ...newPolicy, accountId: e.target.value })}
                  required
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>1: Abishek Claimant (holder@insureflow.com), 5: David Miller (client@insureflow.com)</span>
              </div>

              <div className="form-group">
                <label>Coverage Category Type:</label>
                <select
                  className="form-control"
                  value={newPolicy.coverageType}
                  onChange={(e) => setNewPolicy({ ...newPolicy, coverageType: e.target.value })}
                >
                  <option value="Comprehensive Commercial Property">Comprehensive Commercial Property</option>
                  <option value="Executive Fleet & Commercial Auto">Executive Fleet & Commercial Auto</option>
                  <option value="Corporate Executive Health & Medical">Corporate Executive Health & Medical</option>
                  <option value="Cyber Security & Critical Data Breach">Cyber Security & Critical Data Breach</option>
                  <option value="Heavy Industrial & Marine Cargo">Heavy Industrial & Marine Cargo</option>
                  <option value="Executive Life & Disability Protection">Executive Life & Disability Protection</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Max Coverage Limit (₹):</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={newPolicy.maxCoverageLimit}
                    onChange={(e) => setNewPolicy({ ...newPolicy, maxCoverageLimit: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Annual Premium (₹):</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={newPolicy.premiumAmount}
                    onChange={(e) => setNewPolicy({ ...newPolicy, premiumAmount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Effective Date:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newPolicy.effectiveDate}
                    onChange={(e) => setNewPolicy({ ...newPolicy, effectiveDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newPolicy.expiryDate}
                    onChange={(e) => setNewPolicy({ ...newPolicy, expiryDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Provision Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
