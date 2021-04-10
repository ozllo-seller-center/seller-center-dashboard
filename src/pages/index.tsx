import React, { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router'
import { FiLogIn, FiUser, FiLock, FiAlertTriangle } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';

import { useAuth } from '@hooks/auth';
import getValidationErrors from '@utils/getValidationErrors';

import styles from './signin.module.scss';

import Input from '@components/LoginInput';
import Button from '@components/LoginButton';

interface SignInFormData {
  username: string;
  password: string;
}

const SignIn: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const [error, setError] = useState('');

  const { user, signIn } = useAuth();

  const route = useRouter();

  if (user) {
    route.push('/dashboard');
  }

  const handleSubmit = useCallback(
    async (data: SignInFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          username: Yup.string().required('Usuário obrigatório'),
          password: Yup.string().required('Senha obrigatória'),
        });

        await schema.validate(data, { abortEarly: false });

        await signIn({
          username: data.username,
          password: data.password,
        });

        route.push('/dashboard');
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

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
          <Image src='/assets/logo.png' alt="Ozllo" width={375} height={85} />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Faça seu Logon</h1>

            <Input
              name="username"
              icon={FiUser}
              placeholder="Nome de Usuário"
              autoComplete="off"
            />

            <Input
              name="password"
              icon={FiLock}
              type="password"
              placeholder="Senha"
            />

            <Button type="submit">Entrar</Button>

            {
              error && (
                <div className={styles.errorContainer}>
                  <FiAlertTriangle />
                  <span className={styles.errorMessage}> {error} </span>
                </div>
              )
            }

            {/* <Link to="/forgot-password">Esqueci minha senha</Link> */}
            <Link href="/forgot-password">
              <a>Esqueci minha senha</a>
            </Link>
          </Form>

          <a href="/signup">
            <FiLogIn />
            Criar conta
          </a>
        </div>
      </div>
      <div className={styles.background} />
    </div>
  );
};

export default SignIn;
