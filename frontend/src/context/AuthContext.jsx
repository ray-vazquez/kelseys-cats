import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // NEW: track if we've checked localStorage yet

  useEffect(() => {
    const token = window.localStorage.getItem('kc_token');
    const userJson = window.localStorage.getItem('kc_user');
    if (token && userJson) {
      setUser(JSON.parse(userJson));
    }
    setLoading(false); // Done checking localStorage
  }, []);

  function loginUser(token, userInfo) {
    window.localStorage.setItem('kc_token', token);
    window.localStorage.setItem('kc_user', JSON.stringify(userInfo));
    setUser(userInfo);
  }

  function logoutUser() {
    window.localStorage.removeItem('kc_token');
    window.localStorage.removeItem('kc_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        loginUser,
        logoutUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
