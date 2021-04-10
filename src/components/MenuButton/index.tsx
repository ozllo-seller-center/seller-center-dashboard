import React from 'react';
import { FiMenu } from 'react-icons/fi';
import styles from './styles.module.scss';

interface BurgerProps {
    open: boolean;
    setOpen: Function;
}

const MenuButton:React.FC<BurgerProps> = ({open, setOpen}: BurgerProps) => {
    return (
        <button className={styles.menuButton} onClick={() => setOpen(!open)}>
          <FiMenu size={40} />
        </button>
    )
}

export default MenuButton;
