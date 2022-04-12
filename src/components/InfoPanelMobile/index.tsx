import React, { HTMLAttributes, ReactNode, useState } from 'react';
import { IconBaseProps } from 'react-icons/lib';
import { HoverTooltip } from '../Tooltip';

import styles from './styles.module.scss';

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  warning?: boolean;
  warningMessage?: ReactNode;
  icon?: React.ComponentType<IconBaseProps>;
};

const InfoPanelMobile: React.FC<PanelProps> = ({
  children,
  title,
  icon: Icon,
  warning,
  warningMessage,
  ...rest
}) => {
  return (
    <>
      <div className={styles.container} {...rest}>
        <span>{title}</span>
        <div className={styles.content}>
          {Icon && warning && <Icon />}
          <div>{children}</div>
        </div>
      </div>
      <div className={styles.redText} style={{ alignSelf: 'center' }}>
        {warningMessage}
      </div>
    </>
  );
};

export default InfoPanelMobile;
