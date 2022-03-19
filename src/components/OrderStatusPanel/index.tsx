import React, { HTMLAttributes } from 'react';

import styles from './styles.module.scss';

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  isActive?: boolean;
};

const OrderStatusPanel: React.FC<PanelProps> = ({
  children,
  isActive,
  title,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={isActive ? styles.containerActive : styles.container}
  >
    <span>{title}</span>
    <div className={styles.content}>{children}</div>
    {/* <div className={styles.link} onClick={onClick}>
        <a>Ver mais</a>
        <FiChevronRight />
      </div> */}
  </div>
);

export default OrderStatusPanel;
