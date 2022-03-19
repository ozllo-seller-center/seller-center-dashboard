import React, { useEffect, useState } from 'react';
import { FiLogOut, FiUser } from 'react-icons/fi';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLoading } from 'src/hooks/loading';
import PersonInfo from 'src/shared/types/personInfo';
import CompanyInfo from 'src/shared/types/companyInfo';

import styles from './styles.module.scss';
import { useAuth } from '../../hooks/auth';

export const ProfileButton: React.FC = () => {
  const [name, setName] = useState('');

  const { user, signOut } = useAuth();
  const { isLoading } = useLoading();
  const route = useRouter();

  // console.log(signOut);

  useEffect(() => {
    if (user) {
      if (!user.personalInfo) {
        setName('');

        return;
      }

      if (user.userType === 'f') {
        const personInfo = user.personalInfo as PersonInfo;
        setName(personInfo.firstName);

        return;
      }

      const companyInfo = user.personalInfo as CompanyInfo;
      setName(companyInfo.name);

      return;
    }

    setName('');
  }, [user]);

  return (
    <div
      className={
        !isLoading ? styles.profileContainer : styles.profileContainerDisabled
      }
    >
      <div className={styles.info}>
        {name ? (
          <span> Olá, {name} </span>
        ) : (
          !!user && <span style={{ fontSize: '0.75rem' }}> {user.email} </span>
        )}
        {/* {user ? <img src={!user.avatar_url ? 'https://www.projetodraft.com/wp-content/uploads/2019/06/ozllo_logo.jpg' : user.avatar_url} alt={user.name} /> : <FiUser size={52} color='var(--grafite)' />} */}
        {!!name && <FiUser color="var(--grafite)" />}
      </div>
      <div className={styles.profileContent}>
        <div className={styles.divider} />
        <ul className={styles.optionsMenu}>
          <Link href="/profile">
            <a className={styles.menuItem}>
              <FiUser />
              <span>Minha conta</span>
            </a>
          </Link>

          <div
            className={styles.menuItem}
            onClick={() => {
              signOut();
            }}
          >
            <FiLogOut />
            <span>Sair</span>
          </div>
        </ul>
      </div>
    </div>
  );
};

export default ProfileButton;
