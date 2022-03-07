import React from 'react';
import { FiPlusCircle } from 'react-icons/fi';
import { useRouter } from 'next/router';

import styles from './styles.module.scss';

interface PanelItemProps {
  title: string;
  value: string;
  valueColor: string;
}

const MenuButton: React.FC<PanelItemProps> = ({ title, value, valueColor }: PanelItemProps) => {
  const router = useRouter();

  return (
    <div className={styles.panelItemContainer}>
      <p className={styles.title}>{title}</p>
      <span className={styles[`${valueColor}`]}>{value}</span>
      <button type="button"><FiPlusCircle /></button>
    </div>
  );
};

export default MenuButton;
