import React, { createContext, useCallback, useState, useContext, useMemo } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  address?: string,
  birthday?: Date,
  block?: string,
  category: string,
  city?: string,
  commission: number,
  complement?: string,
  cpf: string,
  number?: number,
  phone: string,
  rg: string,
  store: {
    address?: string,
    block?: string,
    city?: string,
    cnpj: string,
    complement?: string,
    number?: number,
  }
}

interface AuthState {
  token: string;
  user: User;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
  updateUser(user: User): void;
  isRegisterCompleted: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('@SellerCenter:token');
      const user = localStorage.getItem('@SellerCenter:user');

      if (token && user) {
        api.defaults.headers.authorization = `Bearer ${token}`;

        return { token, user: JSON.parse(user) };
      }
    }

    return {} as AuthState;
  });

  const signIn = useCallback(async ({ email, password }) => {

    if (email === 'admin@ozllo.com' && password === 'admin') {
      const admin: User = { id: 'admin', name: 'Ozllo', email: 'admin@ozllo.com', avatar_url: 'https://www.projetodraft.com/wp-content/uploads/2019/06/ozllo_logo.jpg' };

      localStorage.setItem('@SellerCenter:token', 'token');
      localStorage.setItem('@SellerCenter:user', JSON.stringify(admin));

      api.defaults.headers.authorization = `Bearer ${'token'}`;

      setData({ token: 'token', user: admin });

      return;
    }

    const response = await api.post('sessions', { email, password });

    const { token, user } = response.data;

    localStorage.setItem('@SellerCenter:token', token);
    localStorage.setItem('@SellerCenter:user', JSON.stringify(user));

    api.defaults.headers.authorization = `Bearer ${token}`;

    setData({ token, user });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@SellerCenter:token');
    localStorage.removeItem('@SellerCenter:user');

    setData({} as AuthState);
  }, []);

  const updateUser = useCallback(
    (user: User) => {
      localStorage.setItem('@SellerCenter:user', JSON.stringify(user));

      setData({
        token: data.token,
        user: {
          ...data.user,
          ...user,
        },
      });
    },
    [setData, data.token, data.user],
  );

  const isRegisterCompleted = useMemo(() => {
    return true;

    // if (!!data.user) {
    //   return !!data.user.avatar_url && !!data.user.cpf && !!data.user.rg && !!data.user.phone && !!data.user.category
    // }

    // return false
  }, [data]);

  return (
    <AuthContext.Provider
      value={{ user: data.user, signIn, signOut, updateUser, isRegisterCompleted }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export { AuthProvider, useAuth };
