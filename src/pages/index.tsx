import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';

import {
  FiUser, FiLock, FiAlertTriangle, FiLogIn,
} from 'react-icons/fi';

import InactiveUserError from 'src/shared/errors/InactiveUserError';
import { useAuth } from '../hooks/auth';
import getValidationErrors from '../utils/getValidationErrors';

import styles from './signin.module.scss';

import Input from '../components/LoginInput';
import Button from '../components/LoginButton';

interface SignInFormData {
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(false);

  const {
    user, signIn, isAdmin,
  } = useAuth();

  const route = useRouter();

  useEffect(() => {
    if (user) {
      route.push('/dashboard');
    }
  }, []);

  const handleSubmit = useCallback(
    async (data: SignInFormData) => {
      setLoading(true);

      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          email: Yup.string().required('E-mail obrigatório'),
          password: Yup.string().required('Senha obrigatória'),
        });

        await schema.validate(data, { abortEarly: false });

        await signIn({
          email: data.email,
          password: data.password,
        });

        setLoading(false);
        const userIsAdmin = await isAdmin();

        if (userIsAdmin) {
          route.push('/admin');
          return;
        }

        route.push('/dashboard');
      } catch (err: any) {
        setLoading(false);

        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

          return;
        }

        if (err instanceof InactiveUserError) {
          setError(err.getMessage());

          return;
        }

        if (err.response) {
          if (err.response.status >= 400 && err.response.status <= 500) {
            setError('Usuáro ou senha inválido');
          }

          return;
        }

        setError('Ocorreu um erro ao fazer login, cheque as credenciais.');
      }
    },
    [signIn, route],
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.AnimationContainer}>
          <img src="/assets/logo_white.png" alt="Ozllo" />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h3 className={styles.title}>Bem-vindo(a) à Plataforma Ozllo</h3>
            <span className={styles.subtitle}>Faça seu login com seu usuário e senha</span>
            {/* <h1>Faça seu Logon</h1> */}

            <Input
              name="email"
              icon={FiUser}
              placeholder="Insira seu email"
              autoComplete="off"
            />

            <Input
              name="password"
              icon={FiLock}
              type="password"
              placeholder="Digite sua senha"
            />

            <Button type="submit" className={styles.buttonStyle}>
              {
                !isLoading
                  ? <span>Entrar</span>
                  : <div className={styles.dotFlashing} />
              }
            </Button>

            <Link href="/forgot-password">
              <a>Esqueci minha senha</a>
            </Link>

            {/* <Link to="/forgot-password">Esqueci minha senha</Link> */}
          </Form>

          {
            error && (
              <div className={styles.errorContainer}>
                <FiAlertTriangle />
                <span className={styles.errorMessage}>
                  {' '}
                  {error}
                  {' '}
                </span>
              </div>
            )
          }

          <Link href="/signup">
            <a>
              <FiLogIn />
              Criar conta
            </a>
          </Link>
        </div>
      </div>
      <div className={styles.background} />
    </div>
  );
};

export default SignIn;
