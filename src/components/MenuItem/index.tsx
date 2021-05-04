import { IconProps } from '../../icons/props/iconInterface'
import React, { useCallback } from 'react';
import { IconBaseProps } from 'react-icons';
import { useRouter } from "next/router";

import styles from './styles.module.scss';

interface MenuItemProps {
  to: string;
  name: string;
  setSelected: Function;
  iconLib?: React.ComponentType<IconBaseProps>;
  iconAuth?: React.ComponentType<IconProps>;
}

const MenuButton: React.FC<MenuItemProps> = ({ to, name, iconLib: IconLib, iconAuth: IconAuth, setSelected }: MenuItemProps) => {
  const router = useRouter();

  const select = useCallback(() => {
    setSelected(to);
    router.push(to);
  }, [])

  return (
    <div
      className={router.pathname.includes(to) ? styles.menuItemContainerSelected : styles.menuItemContainer}
      onClick={select}>
      <div className={styles.menuItemContent}>
        {IconLib && <IconLib />}
        {IconAuth && <IconAuth />}
        <p>{name.toUpperCase()}</p>
      </div>
    </div>
  )
}

export default MenuButton;
