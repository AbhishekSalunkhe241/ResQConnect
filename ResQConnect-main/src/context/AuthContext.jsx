import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore current session from backend HttpOnly cookie on application boot
  const restoreSession = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      if (response && response.user) {
        setCurrentUser(response.user);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      // 401 or network error -> unauthenticated session
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Authenticate user with backend.
   * If credentials are provided, attempts real login.
   * If demo switch or role fallback in dev mode, authenticates via backend demo switch endpoint.
   */
  const login = async (role = 'citizen', email = '', password = '') => {
    try {
      let res;
      if (email && password) {
        try {
          res = await authApi.login({ email, password });
        } catch (loginErr) {
          // If in development and login failed on a demo email, attempt demoSwitch as seamless fallback
          const isDemoEmail = [
            'rahul.sharma@example.com',
            'priya.mehta@example.com',
            'contact@helpinghands.org',
            'admin@resqconnect.org'
          ].includes(email.toLowerCase().trim());

          if (isDemoEmail && (password === 'ResQDemo@2026!' || password === 'demo12345')) {
            res = await authApi.demoSwitch(role);
          } else {
            throw loginErr;
          }
        }
      } else {
        // Authenticate via development demo endpoint
        res = await authApi.demoSwitch(role);
      }

      if (res && res.user) {
        setCurrentUser(res.user);
        return res.user;
      }
      throw new Error('Authentication response did not return a valid user profile.');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * Register a new user account with backend API.
   * Partners (Volunteers & NGOs) are automatically flagged as pending verification by backend.
   */
  const register = async ({ name, email, phone, role = 'citizen', location, password, regNumber }) => {
    try {
      const payload = {
        name: name?.trim() || 'New Member',
        email: email?.trim(),
        password: password || 'demo12345',
        phone: phone?.trim() || '',
        role: role.toLowerCase(),
        location: location || 'Panvel, Maharashtra',
        ...(role.toLowerCase() === 'ngo' && { regNumber: regNumber || '' }),
      };

      const res = await authApi.register(payload);
      if (res && res.user) {
        setCurrentUser(res.user);
        return res.user;
      }
      throw new Error('Registration did not return a valid user profile.');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  /**
   * Terminate session on backend and clear local state.
   */
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Backend logout encountered error, clearing frontend session state.', err);
    } finally {
      setCurrentUser(null);
    }
  };

  /**
   * Switch active demo persona via backend's secure dev-only /api/auth/demo-switch endpoint.
   */
  const switchRole = async (newRole) => {
    try {
      const res = await authApi.demoSwitch(newRole);
      if (res && res.user) {
        setCurrentUser(res.user);
        return res.user;
      }
    } catch (err) {
      console.error('Failed to switch demo role via backend:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        role: currentUser?.role || 'citizen',
        isVerified: currentUser?.verified ?? (currentUser?.role === 'citizen' || currentUser?.role === 'admin'),
        pendingVerification: Boolean(currentUser?.pendingVerification),
        loading,
        login,
        register,
        logout,
        switchRole,
        refreshSession: restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
