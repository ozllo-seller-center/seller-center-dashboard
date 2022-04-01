import React, { useCallback } from 'react';
import { IconBaseProps } from 'react-icons';
import { useRouter } from 'next/router';

import { useAuth } from 'src/hooks/auth';
import styles from './styles.module.scss';
import { IconProps } from '../../icons/props/iconInterface';

interface MenuItemProps {
  to: string;
  name: string;
  setSelected: React.Dispatch<any>;
  iconLib?: React.ComponentType<IconBaseProps>;
  iconAuth?: React.ComponentType<IconProps>;
  isExternal?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  to,
  name,
  iconLib: IconLib,
  iconAuth: IconAuth,
  setSelected,
  isExternal,
}: MenuItemProps) => {
  const { isRegisterCompleted } = useAuth();

  const router = useRouter();

  const select = useCallback(() => {
    if (isRegisterCompleted) {
      setSelected(to);

      if (isExternal) {
        window.open(to, '_blank');
        return;
      }

      router.push(to);
    }
  }, [isExternal, isRegisterCompleted, router, setSelected, to]);

  return (
    <div
      className={
        router.pathname.includes(to)
          ? styles.menuItemContainerSelected
          : styles.menuItemContainer
      }
      onClick={select}
    >
      <div className={styles.menuItemContent}>
        {IconLib && <IconLib />}
        {IconAuth && <IconAuth />}
        <p>{name.toUpperCase()}</p>
      </div>
    </div>
  );
};

export default MenuItem;
