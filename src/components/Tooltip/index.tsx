import React from 'react';
import { FiX } from 'react-icons/fi';

import styles from './styles.module.scss'

interface TooltipProps {
  title: string;
  className?: string;
  closeTooltip: React.MouseEventHandler<SVGElement>;
}

const Tooltip: React.FC<TooltipProps> = ({ title, closeTooltip, className, children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>{title}</span>
        <FiX onClick={closeTooltip} />
      </div>
      {children}
    </div>
  );
};

export default Tooltip;
