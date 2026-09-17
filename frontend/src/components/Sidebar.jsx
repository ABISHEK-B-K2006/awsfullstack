import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Shield,
  Activity,
  FilePlus2,
  FileCheck2,
  CreditCard,
  BarChart3,
  Lock,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, onTabChange, isOpen = true }) {
  const { user } = useAuth();
  const role = user?.role || '';

  const isPolicyholder = role === 'ROLE_POLICYHOLDER';
  const isUnderwriter = role === 'ROLE_UNDERWRITER';
  const isAdjuster = role === 'ROLE_CLAIMS_ADJUSTER';
  const isManager = role === 'ROLE_INSURANCE_MANAGER';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      visible: true
    },
    {
      id: 'policies',
      label: isPolicyholder ? 'My Coverages' : 'Policy Underwriting',
      icon: Shield,
      visible: true
    },
    {
      id: 'assessments',
      label: 'Risk Scoring Engine',
      icon: Activity,
      visible: isUnderwriter || isManager || isAdjuster
    },
    {
      id: 'claim-intake',
      label: 'File Claim Notice',
      icon: FilePlus2,
      visible: isPolicyholder
    },
    {
      id: 'adjudication',
      label: isManager ? 'Adjudication Console' : 'Claims Queue',
      icon: FileCheck2,
      visible: true
    },
    {
      id: 'disbursements',
      label: 'Wire Settlement (ACH)',
      icon: CreditCard,
      visible: true
    },
    {
      id: 'analytics',
      label: 'Platform Analytics',
      icon: BarChart3,
      visible: isManager || isUnderwriter || isAdjuster
    }
  ];

  return (
    <aside style={{
      width: isOpen ? '250px' : '0px',
      minWidth: isOpen ? '250px' : '0px',
      background: '#0b132b',
      borderRight: isOpen ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
      display: 'flex',
      flexDirection: 'column',
      padding: isOpen ? '20px 14px' : '0px',
      gap: '20px',
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? 'auto' : 'none',
      overflow: 'hidden',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      whiteSpace: 'nowrap'
    }}>
      <div style={{ opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s ease' }}>
        <div style={{ padding: '0 10px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Navigation
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {menuItems.filter(item => item.visible).map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.25) 0%, rgba(6, 182, 212, 0.12) 100%)' : 'transparent',
                  borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={17} color={isActive ? '#38bdf8' : 'currentColor'} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={13} color="#38bdf8" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Security & Concurrency Guarantee Card */}
      <div style={{
        marginTop: 'auto',
        padding: '14px',
        background: 'rgba(28, 37, 65, 0.7)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px', color: '#34d399', fontSize: '0.78rem', fontWeight: 700 }}>
          <span className="pulse-dot" style={{ width: '6px', height: '6px' }}></span>
          <Lock size={13} />
          <span>Zero Overdraw Engine</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
          Pessimistic write locking (<code>@Lock</code>) serializes concurrent claim settlements.
        </div>
      </div>
    </aside>
  );
}
