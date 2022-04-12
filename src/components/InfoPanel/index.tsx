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

const InfoPanel: React.FC<PanelProps> = ({
  children,
  title,
  icon: Icon,
  warning,
  warningMessage,
  ...rest
}) => {
  const [openTooltip, setOpenTooltip] = useState(false);
  const [toolTipYOffset, setToolTipYOffset] = useState(0);
  const [toolTipXOffset, setToolTipXOffset] = useState(0);

  return (
    <div className={styles.container} {...rest}>
      <span>{title}</span>
      <div className={styles.content}>
        {Icon && warning && (
          <Icon
            onMouseOver={e => {
              if (warning) {
                setOpenTooltip(true);
                setToolTipYOffset(e.pageY - 16);
                setToolTipXOffset(e.pageX);
              }
            }}
            onMouseOut={() => {
              setOpenTooltip(false);
            }}
          />
        )}
        <div>{children}</div>
      </div>
      {openTooltip && (
        <HoverTooltip
          closeTooltip={() => setOpenTooltip(false)}
          offsetY={toolTipYOffset}
          offsetX={toolTipXOffset}
        >
          <div className={styles.redText}>{warningMessage}</div>
        </HoverTooltip>
      )}
    </div>
  );
};

export default InfoPanel;
