import React, { CanvasHTMLAttributes, HTMLAttributes } from 'react';
import { FiChevronRight } from 'react-icons/fi';

import styles from './styles.module.scss';

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  isActive?: boolean;
}

const OrderStatusPanel: React.FC<PanelProps> = ({ children, isActive, title, onClick }) => {
  console.log(`${title} - ${isActive}`)
  return (
    <div onClick={onClick} className={isActive ? styles.containerActive : styles.container} >
      <label>{title}</label>
      <div className={styles.content}>
        {children}
      </div>
      {/* <div className={styles.link} onClick={onClick}>
        <a>Ver mais</a>
        <FiChevronRight />
      </div> */}
    </div>
  );
}

export default OrderStatusPanel;
