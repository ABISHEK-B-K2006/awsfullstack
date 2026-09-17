import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, policyAPI, claimAPI } from '../services/api';
import StatsCard from '../components/StatsCard';
import CapacityBar from '../components/CapacityBar';
import {
  Shield,
  FileText,
  CreditCard,
  Activity,
  ArrowUpRight,
  Lock,
  Plus,
  Database,
  ChevronRight,
  FileCheck,
  Download,
  User
} from 'lucide-react';

export default function DashboardPage({ onNavigate }) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [activePolicies, setActivePolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const isHolder = user?.role === 'ROLE_POLICYHOLDER';
      const [metricsRes, claimsRes, policiesRes] = await Promise.all([
        analyticsAPI.getMetrics().catch(() => null),
        (isHolder ? claimAPI.getMyClaims() : claimAPI.getAll()).catch(() => ({ data: [] })),
        (isHolder ? policyAPI.getMyPolicies() : policyAPI.getAll()).catch(() => ({ data: [] }))
      ]);

      if (metricsRes?.data) {
        setMetrics(metricsRes.data);
      }
      setRecentClaims(claimsRes?.data || []);
      
      let pols = policiesRes?.data || [];
      if (isHolder && pols.length === 0) {
        const allPols = await policyAPI.getAll().catch(() => ({ data: [] }));
        pols = allPols?.data || [];
      }
      setActivePolicies(pols);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isPolicyholder = user?.role === 'ROLE_POLICYHOLDER';
  const isManager = user?.role === 'ROLE_INSURANCE_MANAGER';
  const isUnderwriter = user?.role === 'ROLE_UNDERWRITER';

  // Computed metrics for Policyholder
  const totalCoverage = (activePolicies || []).reduce((acc, p) => acc + parseFloat(p.maxCoverageLimit || 0), 0);
  const totalRemaining = (activePolicies || []).reduce((acc, p) => acc + parseFloat(p.remainingLimit || 0), 0);
  const settledCount = (recentClaims || []).filter(c => c && (c.claimStatus === 'APPROVED' || c.claimStatus === 'SETTLED')).length;
  const inReviewCount = (recentClaims || []).filter(c => c && (c.claimStatus === 'UNDER_REVIEW' || c.claimStatus === 'SUBMITTED' || c.claimStatus === 'PENDING')).length;

  if (isPolicyholder) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 70px)',
        backgroundImage: "url('/policyholder-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#eaf4fe',
        padding: '36px 44px 40px',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Hero Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 1.15fr) minmax(0, 1.85fr)',
          gap: '32px',
          alignItems: 'center',
          marginBottom: '32px',
          position: 'relative',
          minHeight: '270px'
        }}>
          {/* Left Headline & CTA */}
          <div style={{ paddingBottom: '8px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 16px',
              background: 'rgba(219, 234, 254, 0.85)',
              borderRadius: '9999px',
              color: '#1d4ed8',
              fontSize: '0.86rem',
              fontWeight: 700,
              marginBottom: '16px',
              border: '1px solid rgba(191, 219, 254, 0.95)',
              backdropFilter: 'blur(8px)'
            }}>
              Policyholder Dashboard
            </div>

            <h1 style={{
              fontSize: '3.4rem',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.08,
              letterSpacing: '-0.035em',
              marginBottom: '16px'
            }}>
              Your Safety.<br />
              Our Priority.
            </h1>

            <p style={{
              fontSize: '1.02rem',
              color: '#334155',
              lineHeight: 1.48,
              marginBottom: '26px',
              fontWeight: 600,
              maxWidth: '380px'
            }}>
              Manage your policies, file claims and track settlements effortlessly.
            </p>

            <button
              type="button"
              onClick={() => onNavigate('claim-intake')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: '#2563eb',
                color: '#ffffff',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '0.98rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(37, 99, 235, 0.45)';
                e.currentTarget.style.background = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.35)';
                e.currentTarget.style.background = '#2563eb';
              }}
            >
              <Plus size={20} strokeWidth={3} /> File New Claim &rarr;
            </button>
          </div>

          {/* Right Column: Calligraphy + 3 KPI Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {/* Top Right Handwritten Script */}
            <div style={{
              textAlign: 'right',
              marginBottom: '18px',
              userSelect: 'none'
            }}>
              <div style={{
                fontFamily: "'Caveat', cursive",
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#2563eb',
                lineHeight: 1.08,
                transform: 'rotate(-4deg)',
                letterSpacing: '-0.01em',
                filter: 'drop-shadow(0 2px 4px rgba(37, 99, 235, 0.15))'
              }}>
                Safer People<br />
                Brighter Tomorrows
              </div>
              <svg width="170" height="20" viewBox="0 0 170 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-4deg) translateY(-4px)' }}>
                <path d="M3 12C45 5 120 3 167 10C125 15 60 15 20 18" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
              </svg>
            </div>

            {/* Right Horizontal KPI Metric Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              width: '100%'
            }}>
              {/* Card 1: My Active Coverages */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '18px',
                padding: '18px 20px',
                border: '1px solid rgba(226, 232, 240, 0.95)',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '140px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                    My Active Coverages
                  </span>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: '#ecfdf5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Shield size={18} color="#10b981" strokeWidth={2.2} />
                  </div>
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {activePolicies.length}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                    Total Capped: ₹{totalCoverage > 0 ? (totalCoverage / 1000).toFixed(0) + 'k' : '₹0'}
                  </span>
                  <span style={{
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.03em'
                  }}>
                    PROTECTED
                  </span>
                </div>
              </div>

              {/* Card 2: Available Claim Buffer */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '18px',
                padding: '18px 20px',
                border: '1px solid rgba(226, 232, 240, 0.95)',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '140px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                    Available Claim Buffer
                  </span>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Database size={18} color="#2563eb" strokeWidth={2.2} />
                  </div>
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  ₹{(totalRemaining / 1000).toFixed(1)}k
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                    Dynamic Zero-Overdraw Ledger
                  </span>
                  <span style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.03em'
                  }}>
                    ACID SAFE
                  </span>
                </div>
              </div>

              {/* Card 3: My Filed Claims */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '18px',
                padding: '18px 20px',
                border: '1px solid rgba(226, 232, 240, 0.95)',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '140px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                    My Filed Claims
                  </span>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: '#fffbeb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={18} color="#f59e0b" strokeWidth={2.2} />
                  </div>
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {recentClaims.length}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                    {settledCount} Settled • {inReviewCount} In Review
                  </span>
                  <span style={{
                    background: '#fffbeb',
                    color: '#b45309',
                    border: '1px solid #fde68a',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.03em'
                  }}>
                    LIVE STATUS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '20px',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          padding: '24px 30px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
          marginTop: '220px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '1.24rem', fontWeight: 800, color: '#0f172a', marginBottom: '18px' }}>
            Quick Actions
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '16px'
          }}>
            {/* Action 1: File New Claim */}
            <div
              onClick={() => onNavigate('claim-intake')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.borderColor = '#bfdbfe';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={20} color="#2563eb" />
                </div>
                <div>
                  <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                    File New Claim
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Submit loss details
                  </span>
                </div>
              </div>
              <ChevronRight size={18} color="#2563eb" />
            </div>

            {/* Action 2: View My Policies */}
            <div
              onClick={() => onNavigate('policies')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ecfdf5';
                e.currentTarget.style.borderColor = '#a7f3d0';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileCheck size={20} color="#10b981" />
                </div>
                <div>
                  <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                    View My Policies
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Active coverages & limits
                  </span>
                </div>
              </div>
              <ChevronRight size={18} color="#10b981" />
            </div>

            {/* Action 3: Download Receipts */}
            <div
              onClick={() => onNavigate('disbursements')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f3ff';
                e.currentTarget.style.borderColor = '#ddd6fe';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#f5f3ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Download size={20} color="#8b5cf6" />
                </div>
                <div>
                  <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                    Download Receipts
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Settled disbursements
                  </span>
                </div>
              </div>
              <ChevronRight size={18} color="#8b5cf6" />
            </div>

            {/* Action 4: Update Profile */}
            <div
              onClick={() => onNavigate('policies')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.borderColor = '#bfdbfe';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={20} color="#2563eb" />
                </div>
                <div>
                  <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                    Update Profile
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Manage account details
                  </span>
                </div>
              </div>
              <ChevronRight size={18} color="#2563eb" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          marginTop: 'auto',
          paddingTop: '20px',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.84rem',
          color: '#64748b',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <span style={{ fontWeight: 800, color: '#0f172a', marginRight: '6px' }}>Insure<span style={{ color: '#2563eb' }}>Flow</span></span>
            <span style={{ color: '#94a3b8' }}>Smarter Insurance. Safer Tomorrow.</span>
          </div>
          <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
            <a href="#privacy" onClick={(e) => e.preventDefault()} style={{ color: '#64748b', textDecoration: 'none' }}>Privacy</a>
            <span>|</span>
            <a href="#terms" onClick={(e) => e.preventDefault()} style={{ color: '#64748b', textDecoration: 'none' }}>Terms</a>
            <span>|</span>
            <a href="#help" onClick={(e) => e.preventDefault()} style={{ color: '#64748b', textDecoration: 'none' }}>Help &amp; Support</a>
            <span>|</span>
            <span>&copy; 2026 InsureFlow. All rights reserved.</span>
          </div>
        </footer>
      </div>
    );
  }

  // Underwriter, Claims Adjuster, Insurance Manager View
  return (
    <div className="page-wrapper">
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
            Operational Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
            Signed in as {user?.fullName?.replace('Executive Claims Director', 'Manager')} ({user?.role?.replace('ROLE_INSURANCE_MANAGER', 'MANAGER')?.replace('ROLE_', '')}) • Real-time transactional overview
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {isUnderwriter && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate('policies')}
            >
              <Plus size={16} /> Provision Policy
            </button>
          )}

          {(isManager || isUnderwriter) && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => onNavigate('assessments')}
            >
              <Activity size={16} /> Actuarial Scoring
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <StatsCard
          title="Active Policies"
          value={metrics ? metrics.activePolicies : activePolicies.length}
          subtext={`Total Capped: ₹${(metrics?.totalCoverageCapacity || activePolicies.reduce((acc, p) => acc + parseFloat(p.maxCoverageLimit || 0), 0)).toLocaleString()}`}
          icon={Shield}
          color="#0284c7"
          badgeText="Active Coverage"
        />

        <StatsCard
          title="Remaining Capacity Buffer"
          value={`₹${((metrics?.totalRemainingLimit || activePolicies.reduce((acc, p) => acc + parseFloat(p.remainingLimit || 0), 0)) / 1000).toFixed(1)}k`}
          subtext="Dynamic Zero-Overdraw Ledger"
          icon={Lock}
          color="#059669"
          badgeText="ACID Safe"
        />

        <StatsCard
          title="Claims Backlog"
          value={recentClaims.length}
          subtext={`${recentClaims.filter(c => c.claimStatus === 'APPROVED' || c.claimStatus === 'SETTLED').length} Settled • ${recentClaims.filter(c => c.claimStatus === 'UNDER_REVIEW' || c.claimStatus === 'SUBMITTED').length} In Review`}
          icon={FileText}
          color="#d97706"
          badgeText="Queue Active"
        />

        <StatsCard
          title="Settled Wire Disbursals"
          value={`₹${((metrics?.totalDisbursedPayouts || 0) / 1000).toFixed(1)}k`}
          subtext={`Loss Ratio: ${metrics?.actuarialLossRatio ? parseFloat(metrics.actuarialLossRatio).toFixed(1) : '0.0'}%`}
          icon={CreditCard}
          color="#7c3aed"
          badgeText="ACH Direct"
        />
      </div>

      {/* Active Policies Capacity Visualizer */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          marginBottom: '32px',
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
              Policy Capacity &amp; Buffer Monitor
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Live remaining financial buffers
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onNavigate('policies')}
            style={{ borderRadius: '8px' }}
          >
            <span>Manage Policies</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {activePolicies.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: '#64748b' }}>
              No policies registered yet.
            </div>
          ) : (
            activePolicies.slice(0, 4).map(policy => (
              <div
                key={policy.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '18px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '1rem', color: '#1d4ed8', fontFamily: 'monospace' }}>{policy.policyNumber}</strong>
                    <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginTop: '2px' }}>{policy.coverageType}</div>
                  </div>
                  <span className={`badge badge-${policy.policyStatus?.toLowerCase()}`}>
                    {policy.policyStatus}
                  </span>
                </div>
                <CapacityBar
                  maxLimit={policy.maxCoverageLimit}
                  remainingLimit={policy.remainingLimit}
                  height={8}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Claims Pipeline */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
              Recent Claim Activity
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Loss notices and claim settlements
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onNavigate('adjudication')}
            style={{ borderRadius: '8px' }}
          >
            <span>Claims Console</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Policy No</th>
                <th>Incident Date</th>
                <th>Requested Amount</th>
                <th>Approved Settlement</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentClaims.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No claim records registered yet.
                  </td>
                </tr>
              ) : (
                recentClaims.slice(0, 5).map(claim => (
                  <tr key={claim.id}>
                    <td><strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{claim.claimNumber}</strong></td>
                    <td>{claim.policy?.policyNumber}</td>
                    <td>{claim.incidentDate}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      ₹{parseFloat(claim.requestedPayout).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: claim.approvedPayout ? '#047857' : 'var(--text-muted)' }}>
                      {claim.approvedPayout ? `₹${parseFloat(claim.approvedPayout).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'In Review'}
                    </td>
                    <td>
                      <span className={`badge badge-${claim.claimStatus?.toLowerCase()}`}>
                        {claim.claimStatus}
                      </span>
                    </td>
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
