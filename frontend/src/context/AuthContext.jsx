import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = window.localStorage.getItem('kc_token');
    const userJson = window.localStorage.getItem('kc_user');
    if (token && userJson) {
      setUser(JSON.parse(userJson));
    }
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
