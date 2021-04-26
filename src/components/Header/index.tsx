import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import MenuButton from '../MenuButton';
import ProfileButton from '../ProfileButton';

import styles from './styles.module.scss';

interface HeaderProps {
  open: boolean;
  setOpen: Function;
}

enum OnPage {
  Dashboard,
  Sells,
  Orders,
  Products,
  NewProduct
}

export const Header: React.FC<HeaderProps> = ({ open, setOpen }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState<React.ReactNode>();

  const router = useRouter();

  const onPage = useCallback((pathname: string): OnPage => {

    if (pathname === '/' || pathname.includes('dashboard'))
      return OnPage.Dashboard

    if (pathname.includes('sells'))
      return OnPage.Sells

    if (pathname.includes('orders'))
      return OnPage.Orders

    if (pathname.includes('create/product')) {
      console.log(pathname)
      return OnPage.NewProduct
    }

    return OnPage.Products
  }, [title, description]);

  useEffect(() => {
    switch (onPage(router.pathname)) {
      case OnPage.Dashboard:
        setTitle('Bem-vindo(a)');
        setDescription(<span>Essa é a sua área de controle de vendas da Ozllo</span>);
        break;
      case OnPage.Sells:
        setTitle('Vendas');
        setDescription(<span>Confira o resumo das suas vendas</span>);
        break;
      case OnPage.Orders:
        setTitle('Pedidos');
        setDescription(<span>Confira o resumo dos seus pedidos</span>);
        break;
      case OnPage.Products:
        setTitle('Produtos');
        setDescription(<span>Adicione produtos manualmente ou através de um planilha</span>);
        break;
      case OnPage.NewProduct:
        setTitle('Cadastrar novo Produto')
        setDescription(<span>Preencha <b>todos</b> os campos</span>);
        break;
    }
  }, [router, title])

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        {!open && <MenuButton open={open} setOpen={setOpen} />}
        <nav>
          <h2>{title}</h2>
          {description}

          <ProfileButton />
        </nav>
      </div>
    </header>
  );
}
