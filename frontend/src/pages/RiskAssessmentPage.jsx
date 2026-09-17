import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { assessmentAPI, policyAPI } from '../services/api';
import RiskGauge from '../components/RiskGauge';
import { CheckCircle2, AlertCircle, Save, Sliders } from 'lucide-react';

export default function RiskAssessmentPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Interactive Calculator State
  const [calcInputs, setCalcInputs] = useState({
    applicantAge: 38,
    coverageAmount: 250000,
    medicalHistoryFlag: false,
    occupationalHazardFlag: false,
    previousClaimsFlag: false,
    hazardCategory: 'COMMERCIAL'
  });

  const [calcResult, setCalcResult] = useState({
    calculatedScore: 28,
    riskTier: 'LOW',
    recommendedPremiumMultiplier: 1.0,
    identifiedRiskFactors: [],
    rationale: 'Baseline evaluation computed a quantitative risk index of 28/100 (LOW RISK).'
  });

  // Save Assessment State
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [underwritingNotes, setUnderwritingNotes] = useState('Standard comprehensive coverage underwriting assessment passed without structural hazards.');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    runRiskCalculation();
  }, [calcInputs]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assRes, polRes] = await Promise.all([
        assessmentAPI.getAll(),
        policyAPI.getAll()
      ]);
      setAssessments(assRes.data || []);
      setPolicies(polRes.data || []);
      if (polRes.data?.length > 0) {
        setSelectedPolicyId(polRes.data[0].id);
      }
    } catch (err) {
      setErrorMsg('Failed to load risk assessment data.');
    } finally {
      setLoading(false);
    }
  };

  const runRiskCalculation = async () => {
    try {
      const res = await assessmentAPI.calculate(calcInputs);
      setCalcResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePersistAssessment = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const payload = {
        policyId: parseInt(selectedPolicyId),
        riskScore: calcResult.calculatedScore,
        medicalHistoryFlag: calcInputs.medicalHistoryFlag,
        occupationalHazardFlag: calcInputs.occupationalHazardFlag,
        underwritingNotes: underwritingNotes
      };
      const res = await assessmentAPI.create(payload);
      setSuccessMsg(`Actuarial Risk Assessment recorded for Policy ${res.data.policy?.policyNumber || selectedPolicyId}! Score: ${res.data.riskScore}/100 (${res.data.riskTier})`);
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to persist risk evaluation.');
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
          Actuarial Risk Assessment
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Evaluate hazards, compute risk scores (0-100), and calibrate rates
        </p>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginBottom: '36px' }}>
        {/* Left: Interactive Actuarial Factor Sliders */}
        <div className="glass-panel" style={{ padding: '26px', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Sliders size={20} color="#0284c7" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Actuarial Factor Calibration</h3>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label>Insured Age / Asset Vintage:</label>
              <strong style={{ color: '#0284c7' }}>{calcInputs.applicantAge} years</strong>
            </div>
            <input
              type="range"
              min="18"
              max="85"
              value={calcInputs.applicantAge}
              onChange={(e) => setCalcInputs({ ...calcInputs, applicantAge: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#0284c7' }}
            />
          </div>

          <div className="form-group">
            <label>Hazard Category Classification:</label>
            <select
              className="form-control"
              value={calcInputs.hazardCategory}
              onChange={(e) => setCalcInputs({ ...calcInputs, hazardCategory: e.target.value })}
            >
              <option value="LOW_RISK_RESIDENTIAL">Low-Risk Standard Residential</option>
              <option value="COMMERCIAL">Standard Commercial &amp; Office Asset</option>
              <option value="INDUSTRIAL">Industrial &amp; Heavy Machinery</option>
              <option value="HIGH_HAZARD">High-Hazard / Dangerous Materials</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={calcInputs.medicalHistoryFlag}
                onChange={(e) => setCalcInputs({ ...calcInputs, medicalHistoryFlag: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#0284c7' }}
              />
              <span style={{ fontSize: '0.88rem', color: '#334155' }}>Pre-existing Medical / Structural Hazard Flag (+30 pts)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={calcInputs.occupationalHazardFlag}
                onChange={(e) => setCalcInputs({ ...calcInputs, occupationalHazardFlag: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#0284c7' }}
              />
              <span style={{ fontSize: '0.88rem', color: '#334155' }}>High-Risk Occupational Exposure (+20 pts)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={calcInputs.previousClaimsFlag}
                onChange={(e) => setCalcInputs({ ...calcInputs, previousClaimsFlag: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#0284c7' }}
              />
              <span style={{ fontSize: '0.88rem', color: '#334155' }}>Prior History of Loss Claims (+15 pts)</span>
            </label>
          </div>
        </div>

        {/* Right: Live Scoring & Decision Summary */}
        <div className="glass-panel" style={{ padding: '26px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Real-Time Actuarial Score</h3>
              <span className="badge badge-active">Live Calculated</span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <RiskGauge
                score={calcResult.calculatedScore}
                tier={calcResult.riskTier}
              />
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Recommended Premium Multiplier:
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>
                {parseFloat(calcResult.recommendedPremiumMultiplier).toFixed(2)}x Base Rate
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {calcResult.rationale}
              </p>
            </div>

            {calcResult.identifiedRiskFactors?.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Identified Hazard Flags:
                </div>
                <ul style={{ paddingLeft: '20px', fontSize: '0.84rem', color: '#b45309' }}>
                  {calcResult.identifiedRiskFactors.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Persist Assessment into Policy */}
          <form onSubmit={handlePersistAssessment} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div className="form-group">
              <label>Target Policy for Audit Record:</label>
              <select
                className="form-control"
                value={selectedPolicyId}
                onChange={(e) => setSelectedPolicyId(e.target.value)}
                required
              >
                {policies.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.policyNumber} — {p.coverageType} ({p.policyStatus})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Underwriting Audit Notes &amp; Findings:</label>
              <textarea
                className="form-control"
                rows="2"
                value={underwritingNotes}
                onChange={(e) => setUnderwritingNotes(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Save size={16} /> Save Risk Assessment
            </button>
          </form>
        </div>
      </div>

      {/* Historical Assessments Table */}
      <div className="glass-panel" style={{ padding: '24px', background: '#ffffff' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: '#0f172a' }}>
          Risk Assessment History
        </h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Policy No</th>
                <th>Assessor</th>
                <th>Risk Score</th>
                <th>Risk Tier</th>
                <th>Medical Flag</th>
                <th>Hazard Flag</th>
                <th>Underwriting Notes</th>
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No risk evaluations recorded yet.
                  </td>
                </tr>
              ) : (
                assessments.map(a => (
                  <tr key={a.id}>
                    <td><strong>#AUD-{a.id}</strong></td>
                    <td><strong style={{ color: '#0284c7' }}>{a.policy?.policyNumber}</strong></td>
                    <td>{a.assessor?.fullName || 'Senior Underwriter'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{a.riskScore} / 100</td>
                    <td>
                      <span className={`badge badge-${a.riskTier.toLowerCase()}`}>
                        {a.riskTier}
                      </span>
                    </td>
                    <td>{a.medicalHistoryFlag ? '🚩 Detected' : '✅ Clear'}</td>
                    <td>{a.occupationalHazardFlag ? '⚠️ Yes' : 'No'}</td>
                    <td style={{ maxWidth: '300px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{a.underwritingNotes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
