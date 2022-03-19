import React from 'react';
import { IconType } from 'react-icons';

import styles from './styles.module.scss';

type PanelProps = {
  title: string;
  description: string;
  icon: IconType;
  onPanelButtonClick: React.MouseEventHandler<HTMLButtonElement>;
};

const Panel: React.FC<PanelProps> = ({
  children,
  icon: Icon,
  title,
  description,
  onPanelButtonClick,
}) => (
  <div className={styles.panelContainer}>
    <div className={styles.panelHeader}>
      <Icon />
      <span>{title}</span>
    </div>
    <div className={styles.divider} />
    <div className={styles.panelBody}>
      <span>{description}</span>
      <div className={styles.panelContent}>{children}</div>
    </div>
    <div className={styles.panelFooter}>
      <button type="button" onClick={onPanelButtonClick}>
        Ver tudo
      </button>
    </div>
  </div>
);

export default Panel;
