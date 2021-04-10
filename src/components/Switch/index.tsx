import React from 'react';

import styles from './styles.module.scss';

type SwitchProps = {
  isOn: boolean;
  handleToggle: React.MouseEventHandler<HTMLInputElement> | undefined;
  onColor: string;
  offColor: string;
}

const Switch = ({ isOn, handleToggle, onColor, offColor }: SwitchProps) => {
  return (
    <>
      <input
        checked={isOn}
        onClick={handleToggle}
        className={styles.react_switch_checkbox}
        id={styles.react_switch_new}
        type="checkbox"
      />
      <label
        style={{ background: isOn ? onColor : offColor }}
        className={styles.react_switch_label}
        htmlFor={styles.react_switch_new}
      >
        <span className={styles.react_switch_button} />
      </label>
      {/* <label>{text}</label> */}
    </>
  );
};

export default Switch;
