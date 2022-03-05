import React, { ButtonHTMLAttributes } from 'react';

import { IconBaseProps } from 'react-icons';

import styles from './styles.module.scss';

interface Button extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  icon?: React.ComponentType<IconBaseProps>;
  customStyle?: {
    className: string;
    activeClassName: string;
  };
}

const Button: React.FC<Button> = ({
  isActive, customStyle, icon: Icon, children, ...rest
}) => (customStyle ? (
  <button className={isActive ? customStyle.activeClassName : customStyle.className} {...rest}>
    {!!Icon && <Icon />}
    {children}
  </button>
)
  : (
    <button className={isActive ? styles.buttonActive : styles.button} {...rest}>
      {!!Icon && <Icon />}
      {children}
    </button>
  )
);

export default Button;
