import React from 'react';
import { IconBaseProps } from 'react-icons';

import styles from './styles.module.scss';

interface MessageModalProps {
  handleVisibility: React.MouseEventHandler;
  title?: string;
  icon?: React.ComponentType<IconBaseProps>;
  alterStyle?: boolean;
}

const MessageModal: React.FC<MessageModalProps> = ({ handleVisibility, alterStyle, title, icon: Icon, children }) => {
  return (
    <div>
      <div onClick={handleVisibility} className={styles.modalBackground} />
      <div className={styles.modalContainer} style={{ backgroundColor: !alterStyle ? 'var(--white)' : 'var(--yellow-300)' }}>
        <div className={styles.modalHeader}>
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

export default MessageModal;
