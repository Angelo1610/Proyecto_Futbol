import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authApi from '../api/auth';
import { masterApi } from '../api/client';
import { getAccessToken, clearTokens } from '../api/client';

const AuthContext = createContext();

function decodeUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = getAccessToken();
      const userId = token ? decodeUserIdFromToken(token) : null;
      if (!userId) {
        setRestoring(false);
        return;
      }
      try {
        const data = await masterApi.get(`/api/v1/users/${userId}`);
        const restoredUser = authApi.mapUser(data);
        setUser(restoredUser);
        if (restoredUser.roles.length === 1) {
          setCurrentRole(restoredUser.roles[0]);
        }
      } catch {
        clearTokens();
      } finally {
        setRestoring(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (username, password) => {
    try {
      const foundUser = await authApi.login(username, password);
      setUser(foundUser);
      if (foundUser.roles.length === 1) {
        setCurrentRole(foundUser.roles[0]);
      } else {
        setCurrentRole(null); // Force selection screen if multiple roles
      }
      return { success: true, user: foundUser };
    } catch (err) {
      return { success: false, message: err.message || 'Credenciales incorrectas' };
    }
  };

  const register = async (payload) => {
    try {
      await authApi.register(payload);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'No se pudo completar el registro' };
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setCurrentRole(null);
  };

  const selectRole = (role) => {
    setCurrentRole(role);
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user) return { success: false, message: 'No hay usuario autenticado' };
    try {
      await authApi.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'No se pudo cambiar la contraseña' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, currentRole, restoring, login, register, logout, selectRole, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
