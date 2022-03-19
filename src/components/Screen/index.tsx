import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/router';
import api from 'src/services/api';
import { useModalMessage } from 'src/hooks/message';
import { useLoading } from 'src/hooks/loading';
import Menu from '../Menu';

import styles from './styles.module.scss';
import { useAuth } from '../../hooks/auth';
import Header from '../Header';

const Layout: React.FC = ({ children }) => {
  const { width } = useMemo(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }

    return {
      width: undefined,
      height: undefined,
    };
  }, [process.browser]);

  const [open, setOpen] = useState(true);
  const [visible, setVisible] = useState(true);
  const { user, isRegisterCompleted, signOut, token, isAdmin } = useAuth();
  const { isLoading } = useLoading();
  const { showModalMessage, modalMessage, handleModalMessage } =
    useModalMessage();

  const [showMessage, setShowMessage] = useState(showModalMessage);

  const router = useRouter();

  const handleModalVisibility = useCallback(() => {
    handleModalMessage(false);
  }, []);

  useEffect(() => {
    setOpen(!!width && width >= 1152);
  }, [width]);

  useEffect(() => {
    async function isUserAdmin() {
      const result = await isAdmin();

      setVisible(!result);
    }

    isUserAdmin();
  }, []);

  useEffect(() => {
    setShowMessage(showModalMessage);
  }, [showModalMessage]);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }

    // isTokenValid(token).then(valid => {
    // if (valid) {
    api
      .get(`auth/token/${token}`)
      .then(response => {
        const { isValid } = response.data;

        if (!isValid) {
          signOut();
          router.push('/');
        }
      })
      .catch(() => {
        signOut();
        router.push('/');
      });

    // return;
    // }

    if (!isRegisterCompleted && !router.pathname.includes('profile')) {
      router.push('/profile');
    }
    // })
  }, [user, router, token, isRegisterCompleted, signOut]);

  const visibility = useMemo(() => {
    if (!visible) {
      return styles.closedMenu;
    }

    if (open) {
      return styles.openMenu;
    }

    return styles.closedMenu;
  }, [open, visible]);

  return (
    <>
      <Menu open={open} setOpen={setOpen} visible={visible} />
      <div className={visibility}>
        <Header open={open} setOpen={setOpen} />
        <main className={styles.container}>
          {children}
          {/* {isLoading && ( */}
          {/* )} */}
        </main>
        {/* <Footer /> */}
      </div>
      {/* {
        isLoading &&
        (<div className={styles.loadingContainer}>
          <Loader />
        </div>)
      } */}
      {/* {
        showMessage && (
          <MessageModal handleVisibility={handleModalVisibility}>
            <div className={styles.modalContent}>
              {modalMessage.type === 'success' ? <FiCheck style={{ color: 'var(--green-100)' }} /> : <FiX style={{ color: 'var(--red-100)' }} />}
              <p>{modalMessage.title}</p>
              <p>{modalMessage.message}</p>
            </div>
          </MessageModal>
        )
      } */}
    </>
  );
};

export default Layout;
