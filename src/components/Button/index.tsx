import React, { ButtonHTMLAttributes } from 'react';

import styles from './styles.module.scss';

interface Button extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

const Button: React.FC<Button> = ({ isActive, children, ...rest }) => {
  return (
    <button className={isActive ? styles.buttonActive : styles.button} {...rest} >
      {children}
    </button>
  );
}

export default Button;
