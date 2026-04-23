import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Hardcoded admin credentials
const ADMIN_EMAIL = 'manavv@gmail.com';
const ADMIN_PASSWORD = 'manavv';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('velocity_admin');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('velocity_admin');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const userData = { email: ADMIN_EMAIL, name: 'Manav', role: 'Admin' };
        setUser(userData);
        localStorage.setItem('velocity_admin', JSON.stringify(userData));
        resolve(userData);
      } else {
        reject(new Error('Invalid email or password'));
      }
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('velocity_admin');
  };

  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
