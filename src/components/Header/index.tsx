import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import MenuButton from '../MenuButton';
import ProfileButton from '../ProfileButton';

import styles from './styles.module.scss';

interface HeaderProps {
  open: boolean;
  setOpen: Function;
}

export const Header: React.FC<HeaderProps> = ({ open, setOpen }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const router = useRouter();

  console.log(router.pathname);

  useEffect(() => {
    switch (router.pathname) {
      case '/':
      case '/dashboard':
        setTitle('Bem-vindo(a)');
        setDescription('Essa é a sua área de controle de vendas da Ozllo');
        break;
      case '/sells':
        setTitle('Vendas');
        setDescription('Confira o resumo das suas vendas');
        break;
      case '/orders':
      case '/orders/sent':
      case '/orders/products':
        setTitle('Pedidos');
        setDescription('Confirao resumo dos seus pedidos');
        break;
    }
  }, [router, title])

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        {!open && <MenuButton open={open} setOpen={setOpen} />}
        <nav>
          <h2>{title}</h2>
          <span>{description}</span>

          <ProfileButton />
        </nav>
      </div>
    </header>
  );
}
