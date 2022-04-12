import React, { HTMLAttributes } from 'react';

import styles from './styles.module.scss';

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  isActive?: boolean;
  altAlign?: boolean;
};

const OrderStatusPanel: React.FC<PanelProps> = ({
  children,
  isActive,
  altAlign,
  title,
  onClick,
  ...rest
}) => (
  <div
    onClick={onClick}
    className={isActive ? styles.containerActive : styles.container}
    {...rest}
  >
    <span
      className={styles.title}
      style={altAlign ? { marginLeft: 'auto' } : {}}
    >
      {title}
    </span>
    <div
      className={styles.content}
      style={altAlign ? { marginLeft: 'auto' } : {}}
    >
      {children}
    </div>
    {/* <div className={styles.link} onClick={onClick}>
        <a>Ver mais</a>
        <FiChevronRight />
      </div> */}
  </div>
);

export default OrderStatusPanel;
