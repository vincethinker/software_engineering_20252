import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("livrecafe_user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("livrecafe_user", JSON.stringify(userData));
    localStorage.setItem("livrecafe_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("livrecafe_user");
    localStorage.removeItem("livrecafe_token");
    setUser(null);
  };

  const isLoggedIn = Boolean(user);

  const updateUser = (newUserData) => {
    localStorage.setItem("livrecafe_user", JSON.stringify(newUserData));
    setUser(newUserData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}