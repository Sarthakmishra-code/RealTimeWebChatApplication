import { createContext, useContext, useState, useEffect } from "react";
import { connectSocket, disconnectSocket } from "../services/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user) {
      const socket = connectSocket(user._id?.toString());
      socket.on("onlineUsers", (users) =>
        setOnlineUsers(users.map((id) => id.toString()))
      );
      return () => {
        socket.off("onlineUsers");
        disconnectSocket();
      };
    }
  }, [user]);

  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    disconnectSocket();
    setUser(null);
    setOnlineUsers([]);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, onlineUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};