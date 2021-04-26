import React, { ButtonHTMLAttributes } from 'react';

import { FaPlay } from 'react-icons/fa';

import styles from './styles.module.scss';

interface StateButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  borders?: boolean;
  customStyle?: {
    className: string;
    activeClassName: string;
  };
}

const StateButton: React.FC<StateButton> = ({ isActive, borders, customStyle, children, ...rest }) => {
  return (!!customStyle ?
    <button className={isActive ? customStyle.activeClassName : customStyle.className}>
      {children}
    </button>
    :
    <button className={isActive ? styles.buttonActive : borders ? styles.buttonBordered : styles.button} {...rest} >
      {children}
      <FaPlay />
    </button>
  );
}

export default StateButton;
