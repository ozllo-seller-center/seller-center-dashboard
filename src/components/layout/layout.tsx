import React, { useState } from 'react'

import Footer from '../Footer';
import Menu from '../Menu';
import { Header } from '../Header';

import styles from './styles.module.scss';

const Layout: React.FC = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Menu open={open} setOpen={setOpen} />
      <div className={open ? styles.openMenu : styles.closedMenu}>
        <Header open={open} setOpen={setOpen} />
        <main className={styles.container}>
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}

export default Layout
