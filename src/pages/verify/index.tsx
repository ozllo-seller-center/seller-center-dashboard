import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiCheck } from 'react-icons/fi';

import { useAuth } from '../../hooks/auth';

import styles from './styles.module.scss'

const Verify: React.FC = () => {
  const [isVerifying, setVerifying] = useState(false);
  const [isVerified, setVerified] = useState(true);

  const { signIn } = useAuth();

  const router = useRouter();

  useEffect(() => {
    const {
      token
    } = router.query;
    // if (token === '') {
    //   router.push('/');
    // }

    //const user = await api.verify(token);
    // if (user) {
    //  updateUser(user);
    //  setTimeout(() => {
    //    router.push('/dashboard');
    //  }, 3000);
    //}
    //updateUser(user);
    //
  }, [])

  return (
    <div className={styles.container}>
      {
        isVerifying && (
          <div className={styles.verifying}>
            <div className={styles.dotFlashing}></div>
            <p>Estamos confirmando seu e-mail e autenticando o acesso</p>
          </div>
        )
      }
      {
        isVerified && (
          <div className={styles.verified}>
            <FiCheck />
            <h2>Conta verificada!</h2>
            <p>Iremos te redirecionar a página inicial em alguns instantes</p>
          </div>
        )
      }
    </div>
  )
}

export default Verify;
