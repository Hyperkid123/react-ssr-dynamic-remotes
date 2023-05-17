import React, { createContext, useContext, useMemo } from 'react';
import { decodeToken } from './auth';

type AuthContextValue = {
  email?: string;
  username?: string;
  token?: string;
  ready: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  ready: false,
});

const AuthProvider: React.FC<React.PropsWithChildren<{ token?: string }>> = ({ token, children }) => {
  const auth = useMemo(() => {
    if (!token) {
      return {
        ready: false,
      };
    }
    try {
      const res = {
        ...decodeToken(token),
        token,
        ready: true,
      };
      return res;
    } catch (error) {
      return { ready: false };
    }
  }, [token]);
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const auth = useContext(AuthContext);
  return auth;
};

export default AuthProvider;
