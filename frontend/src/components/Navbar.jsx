import React, { useState, useRef, useEffect } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import {
  Search,
  Menu,
  Home,
  FileText,
  ShieldCheck,
  Database,
  BarChart3,
  Users,
  Bell,
  ChevronDown,
  LogOut,
  Zap,
  Check
} from 'lucide-react';

export default function Navbar({ onNavigate, currentPage }) {
  const { user, logout, switchDemoRole } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const roleDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setRoleDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = async (roleKey) => {
    setRoleDropdownOpen(false);
    try {
      await switchDemoRole(roleKey);
      // Navigate to dashboard when switching role to ensure relevant views
      onNavigate('dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'ROLE_POLICYHOLDER': return 'Policyholder';
      case 'ROLE_UNDERWRITER': return 'Underwriter';
      case 'ROLE_CLAIMS_ADJUSTER': return 'Claims Adjuster';
      case 'ROLE_INSURANCE_MANAGER': return 'Insurance Manager';
      default: return role ? role.replace('ROLE_', '') : 'Select Role';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'AB';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Role-specific navigation tabs tailored to each persona's workflow
  const getRoleNavTabs = (role) => {
    switch (role) {
      case 'ROLE_POLICYHOLDER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home, page: 'dashboard' },
          { id: 'policies', label: 'My Policies', icon: FileText, page: 'policies' },
          { id: 'claim-intake', label: 'File Claim', icon: ShieldCheck, page: 'claim-intake' },
          { id: 'disbursements', label: 'Payouts & Receipts', icon: Database, page: 'disbursements' },
          { id: 'analytics', label: 'Reports', icon: BarChart3, page: 'analytics' }
        ];

      case 'ROLE_UNDERWRITER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home, page: 'dashboard' },
          { id: 'policies', label: 'Policies Directory', icon: FileText, page: 'policies' },
          { id: 'assessments', label: 'Risk Assessment', icon: ShieldCheck, page: 'assessments' },
          { id: 'analytics', label: 'Loss & Exposure Reports', icon: BarChart3, page: 'analytics' }
        ];

      case 'ROLE_CLAIMS_ADJUSTER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home, page: 'dashboard' },
          { id: 'adjudication', label: 'Claims Adjudication', icon: ShieldCheck, page: 'adjudication' },
          { id: 'policies', label: 'Policies Registry', icon: FileText, page: 'policies' },
          { id: 'disbursements', label: 'Settlements & Payouts', icon: Database, page: 'disbursements' },
          { id: 'analytics', label: 'Settlement Reports', icon: BarChart3, page: 'analytics' }
        ];

      case 'ROLE_INSURANCE_MANAGER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home, page: 'dashboard' },
          { id: 'policies', label: 'Policies Oversight', icon: FileText, page: 'policies' },
          { id: 'assessments', label: 'Risk Matrix', icon: ShieldCheck, page: 'assessments' },
          { id: 'adjudication', label: 'Claims Audit', icon: ShieldCheck, page: 'adjudication' },
          { id: 'disbursements', label: 'Capacity Settlement', icon: Database, page: 'disbursements' },
          { id: 'analytics', label: 'Financial Analytics', icon: BarChart3, page: 'analytics' }
        ];

      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home, page: 'dashboard' },
          { id: 'policies', label: 'Policies', icon: FileText, page: 'policies' },
          { id: 'claims', label: 'Claims', icon: ShieldCheck, page: 'adjudication' },
          { id: 'settlement', label: 'Settlement', icon: Database, page: 'disbursements' },
          { id: 'reports', label: 'Reports', icon: BarChart3, page: 'analytics' }
        ];
    }
  };

  const navTabs = getRoleNavTabs(user?.role);

  return (
    <header style={{
      height: '68px',
      background: 'linear-gradient(180deg, rgba(240, 247, 255, 0.97) 0%, rgba(228, 241, 255, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(191, 219, 254, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 18px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      maxWidth: '100vw',
      boxSizing: 'border-box',
      boxShadow: '0 4px 18px rgba(37, 99, 235, 0.06), 0 1px 3px rgba(0, 0, 0, 0.02)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Left: 3D Shield Logo + Brand Name + Tagline + Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}
          onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
        >
          {/* 3D Shield Icon */}
          <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="34" height="34" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 4px 10px rgba(37, 99, 235, 0.28))' }}>
              <defs>
                <linearGradient id="shieldGradOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="60%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#1e40af" />
                </linearGradient>
                <linearGradient id="shieldGradInner" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#dbeafe" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.75" />
                </linearGradient>
              </defs>
              {/* Outer Blue Shield */}
              <path d="M22 3L6 9.5V20C6 30 13.5 39 22 41.5C30.5 39 38 30 38 20V9.5L22 3Z" fill="url(#shieldGradOuter)" />
              {/* Inner Facet / 3D core */}
              <path d="M22 8L10 13V20C10 27.8 15.6 34.8 22 37C28.4 34.8 34 27.8 34 20V13L22 8Z" fill="url(#shieldGradInner)" fillOpacity="0.25" />
              <path d="M22 11.5L13.5 15.5V21C13.5 26.5 17.5 31.5 22 33.2C26.5 31.5 30.5 26.5 30.5 21V15.5L22 11.5Z" fill="url(#shieldGradInner)" />
            </svg>
          </div>

          <div>
            <div style={{ fontSize: '1.32rem', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
              <span style={{ color: '#0f172a' }}>Insure</span>
              <span style={{ color: '#1d4ed8' }}>Flow</span>
            </div>
            <div style={{
              fontSize: '0.52rem',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
              marginTop: '1px'
            }}>
              SMARTER INSURANCE. SAFER TOMORROW.
            </div>
          </div>
        </div>

        {user && (
          <div style={{ width: '1px', height: '24px', background: 'rgba(147, 197, 253, 0.7)', margin: '0 4px' }} />
        )}
      </div>

      {/* Center: Dynamic Role-Specific Navigation Tabs */}
      {user ? (
        <nav style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 1, minWidth: 0, overflowX: 'auto' }}>
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPage === tab.page;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onNavigate(tab.page)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 11px',
                  borderRadius: '9999px',
                  border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                  background: isActive ? '#dbeafe' : 'transparent',
                  color: isActive ? '#2563eb' : '#334155',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.65)';
                    e.currentTarget.style.color = '#0f172a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#334155';
                  }
                }}
              >
                <Icon
                  size={16}
                  strokeWidth={isActive ? 2.3 : 1.9}
                  color={isActive ? '#2563eb' : '#475569'}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      ) : (
        <div />
      )}

      {/* Right: Search Bar + Notification Bell + User Profile Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {user ? (
          <>
            {/* Search Bar (from design) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #bfdbfe',
              borderRadius: '9999px',
              padding: '5px 10px',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.04)',
              transition: 'all 0.15s ease'
            }}>
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.8rem',
                  color: '#0f172a',
                  width: '100px',
                  fontFamily: 'inherit'
                }}
              />
              <span style={{
                background: '#f1f5f9',
                color: '#64748b',
                fontSize: '0.64rem',
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: '5px',
                border: '1px solid #e2e8f0',
                letterSpacing: '0.02em'
              }}>
                Ctrl K
              </span>
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }} ref={notifDropdownRef}>
              <button
                type="button"
                onClick={() => setNotificationOpen(!notificationOpen)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid #bfdbfe',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#334155',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f7ff';
                  e.currentTarget.style.color = '#0f172a';
                  e.currentTarget.style.borderColor = '#93c5fd';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#334155';
                  e.currentTarget.style.borderColor = '#bfdbfe';
                }}
                title="Notifications"
              >
                <Bell size={17} strokeWidth={2} />
                {/* Red Badge Indicator */}
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  border: '2px solid #ffffff'
                }} />
              </button>

              {notificationOpen && (
                <div style={{
                  position: 'absolute',
                  top: '125%',
                  right: 0,
                  width: '300px',
                  background: '#ffffff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '16px',
                  boxShadow: '0 18px 36px rgba(15, 23, 42, 0.12)',
                  padding: '12px',
                  zIndex: 100
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                    Notifications
                  </div>
                  <div style={{ padding: '8px', borderRadius: '8px', background: '#f8fafc', fontSize: '0.8rem', color: '#475569' }}>
                    <strong style={{ color: '#1e293b' }}>Live Capacity:</strong> Smart contract pool reserves rebalanced successfully.
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar & Name Pill */}
            <div style={{ position: 'relative' }} ref={userDropdownRef}>
              <div
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '3px 10px 3px 3px',
                  borderRadius: '9999px',
                  transition: 'all 0.15s ease',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Dark Blue Circular Avatar */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#0b2559',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  boxShadow: '0 2px 8px rgba(11, 37, 89, 0.3)',
                  letterSpacing: '0.02em'
                }}>
                  {getInitials(user.fullName)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                    {user.fullName || 'abi'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
                <ChevronDown size={14} color="#64748b" style={{ marginLeft: '2px' }} />
              </div>

              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '125%',
                  right: 0,
                  width: '260px',
                  background: '#ffffff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '16px',
                  boxShadow: '0 18px 36px rgba(15, 23, 42, 0.12)',
                  padding: '10px',
                  zIndex: 100,
                  animation: 'fadeIn 0.15s ease-out'
                }}>
                  <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{user.fullName || 'abi'}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>{user.email || 'user@insureflow.com'}</div>
                  </div>

                  <div style={{ padding: '8px 10px 4px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Switch Demo Persona
                  </div>
                  {Object.entries(DEMO_ACCOUNTS).map(([key, demo]) => {
                    const isCurrent = user?.role === demo.role;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleRoleSwitch(key)}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          background: isCurrent ? '#eff6ff' : 'transparent',
                          border: isCurrent ? '1px solid #bfdbfe' : '1px solid transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: isCurrent ? '#1d4ed8' : '#334155',
                          transition: 'all 0.15s ease',
                          marginBottom: '2px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrent) e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrent) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>{demo.name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{demo.title}</div>
                        </div>
                        {isCurrent && <Check size={14} color="#1d4ed8" strokeWidth={2.5} />}
                      </button>
                    );
                  })}

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '6px', paddingTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => { setUserDropdownOpen(false); logout(); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 10px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => onNavigate('login')}
              style={{ borderRadius: '8px' }}
            >
              Sign In
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate('register')}
              style={{ borderRadius: '8px' }}
            >
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
}


