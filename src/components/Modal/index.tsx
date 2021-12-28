import React from 'react';
import { IconBaseProps } from 'react-icons';

import styles from './styles.module.scss';

interface ModalProps {
  handleVisibility: React.MouseEventHandler;
  title?: string;
  icon?: React.ComponentType<IconBaseProps>;
  cleanStyle?: boolean;
  alterStyle?: boolean;
}

const Modal: React.FC<ModalProps> = ({ handleVisibility, cleanStyle, alterStyle, title, icon: Icon, children }) => {
  return (
    <div className={styles.parent}>
      <div onClick={handleVisibility} className={styles.modalBackground} />
      <div className={styles.modalContainer} style={{ backgroundColor: !alterStyle ? 'var(--white)' : 'var(--yellow-300)' }}>
        <div className={cleanStyle ? styles.modalClearHeader : styles.modalHeader}>
          {
            Icon && <Icon />
          }
          {
            title && <span>{title}</span>
          }
          <button onClick={handleVisibility} type='button'>X</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal;
