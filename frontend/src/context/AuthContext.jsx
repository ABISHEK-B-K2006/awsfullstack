import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = {
  POLICYHOLDER: {
    email: 'holder@insureflow.com',
    password: 'Password123!',
    role: 'ROLE_POLICYHOLDER',
    name: 'Abishek Claimant',
    title: 'Policyholder'
  },
  UNDERWRITER: {
    email: 'underwriter@insureflow.com',
    password: 'Password123!',
    role: 'ROLE_UNDERWRITER',
    name: 'Sarah Jenkins',
    title: 'Senior Underwriter'
  },
  CLAIMS_ADJUSTER: {
    email: 'adjuster@insureflow.com',
    password: 'Password123!',
    role: 'ROLE_CLAIMS_ADJUSTER',
    name: 'Marcus Vance',
    title: 'Lead Claims Adjuster'
  },
  INSURANCE_MANAGER: {
    email: 'manager@insureflow.com',
    password: 'Password123!',
    role: 'ROLE_INSURANCE_MANAGER',
    name: 'Eleanor Vance',
    title: 'Manager'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('insureflow_user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.fullName && parsed.fullName.includes('Executive Claims Director')) {
        parsed.fullName = parsed.fullName.replace('Executive Claims Director', 'Manager');
        localStorage.setItem('insureflow_user', JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login({ email, password });
      const { token, id, fullName, role } = response.data;
      const cleanFullName = fullName ? fullName.replace('Executive Claims Director', 'Manager') : fullName;
      const userData = { id, email, fullName: cleanFullName, role, token };
      localStorage.setItem('insureflow_token', token);
      localStorage.setItem('insureflow_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(data);
      const { token, id, email, fullName, role } = response.data;
      const userData = { id, email, fullName, role, token };
      localStorage.setItem('insureflow_token', token);
      localStorage.setItem('insureflow_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchDemoRole = async (roleKey) => {
    const demo = DEMO_ACCOUNTS[roleKey];
    if (demo) {
      return await login(demo.email, demo.password);
    }
  };

  const logout = () => {
    localStorage.removeItem('insureflow_token');
    localStorage.removeItem('insureflow_user');
    setUser(null);
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        switchDemoRole,
        hasRole,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
