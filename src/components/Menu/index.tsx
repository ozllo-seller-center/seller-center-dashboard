import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { FiChevronLeft, FiHome, FiPackage, FiHelpCircle } from 'react-icons/fi';
import { FaRegMoneyBillAlt } from 'react-icons/fa';
import { RiStore2Line } from 'react-icons/ri';
import { MdOutlineIntegrationInstructions } from 'react-icons/md';
import { HiOutlineSpeakerphone } from 'react-icons/hi';
import MenuItem from '../MenuItem';

import styles from './styles.module.scss';

interface MenuProps {
  open: boolean;
  setOpen: React.Dispatch<any>;
  visible: boolean;
}

const Menu: React.FC<MenuProps> = ({ open, setOpen, visible }) => {
  const { width } = useMemo(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth };
    }

    return {
      width: undefined,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [process.browser]);

  const route = useRouter();
  const [, setSelected] = useState(route.pathname);

  const visibility = useMemo(() => {
    if (!visible) {
      return styles.invisibleMenu;
    }

    if (open) {
      return styles.menuOpen;
    }

    return styles.menuClosed;
  }, [open, visible]);

  return (
    <>
      <div className={visibility}>
        <div className={styles.menuHeader}>
          <img src="/assets/logo_white.png" alt="Ozllo" />
          <FiChevronLeft color="#FFFFFF" onClick={() => setOpen(!open)} />
        </div>
        <MenuItem
          to="/dashboard"
          name="Home"
          setSelected={setSelected}
          iconLib={FiHome}
        />
        <MenuItem
          to={!!width && width < 768 ? '/sells-mobile' : '/sells'}
          name="Minhas vendas"
          setSelected={setSelected}
          iconLib={FaRegMoneyBillAlt}
        />
        <MenuItem
          to={!!width && width < 768 ? '/products-mobile' : '/products'}
          name="Produtos"
          setSelected={setSelected}
          iconLib={FiPackage}
        />
        <MenuItem
          to="/marketplaces"
          name="Marketplaces"
          setSelected={setSelected}
          iconLib={RiStore2Line}
        />
        <MenuItem
          to="/integrations"
          name="Integrações"
          setSelected={setSelected}
          iconLib={MdOutlineIntegrationInstructions}
        />
        <MenuItem
          to="/campaigns"
          name="Campanhas"
          setSelected={setSelected}
          iconLib={HiOutlineSpeakerphone}
        />
        <MenuItem
          to="/faq"
          name="FAQ"
          setSelected={setSelected}
          iconLib={FiHelpCircle}
        />
      </div>
      {!!width && width < 768 && open && (
        <div className={styles.outside} onClick={() => setOpen(!open)} />
      )}
    </>
  );
};

export default Menu;
