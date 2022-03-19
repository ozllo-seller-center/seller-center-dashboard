import React from 'react';
import { FiMenu } from 'react-icons/fi';
import styles from './styles.module.scss';

interface BurgerProps {
  open: boolean;
  setOpen: React.Dispatch<any>;
}

const MenuButton: React.FC<BurgerProps> = ({ open, setOpen }: BurgerProps) => (
  <button className={styles.menuButton} onClick={() => setOpen(!open)}>
    <FiMenu />
  </button>
);

export default MenuButton;
