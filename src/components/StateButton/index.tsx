import React, { ButtonHTMLAttributes, useMemo } from 'react';

import { FaPlay } from 'react-icons/fa';

import styles from './styles.module.scss';

interface StateButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  borders?: boolean;
  pointer?: boolean;
  customStyle?: {
    className: string;
    activeClassName: string;
  };
}

const StateButton: React.FC<StateButton> = ({
  isActive, pointer, borders, customStyle, children, ...rest
}) => {
  const buttonStyle = useMemo(() => {
    if (isActive) { return styles.buttonActive; }

    if (borders) { return styles.buttonBordered; }

    return styles.button;
  }, [borders, isActive]);

  return (customStyle ? (
    <button className={isActive ? customStyle.activeClassName : customStyle.className}>
      {children}
    </button>
  )
    : (
      <button className={buttonStyle} {...rest}>
        {children}
        {pointer && (<FaPlay />)}
      </button>
    )
  );
};

export default StateButton;
