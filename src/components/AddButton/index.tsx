import React, {
  ButtonHTMLAttributes, useCallback, useEffect, useMemo, useState,
} from 'react';

import { IconBaseProps } from 'react-icons';

import styles from './styles.module.scss';

interface AddButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  icon?: React.ComponentType<IconBaseProps>;
  customStyle?: {
    className: string;
    activeClassName?: string;
  };
}

const AddButton: React.FC<AddButtonProps> = ({
  isActive, customStyle, icon: Icon, children, onClick, ...rest
}) => (customStyle ? (
  <button type="button" className={isActive && !!customStyle.activeClassName ? customStyle.activeClassName : customStyle.className} onClick={onClick}>
    {!!Icon && <Icon />}
    {children}
  </button>
)
  : (
    <button type="button" className={isActive ? styles.buttonActive : styles.button} {...rest} onClick={onClick}>
      {!!Icon && <Icon />}
      {children}
    </button>
  )
);

export default AddButton;
