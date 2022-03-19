import React, {
  InputHTMLAttributes,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';

import { useField } from '@unform/core';

import { CheckboxProps } from '@material-ui/core/Checkbox';
import { Checkbox, withStyles } from '@material-ui/core';
import { FaCheck } from 'react-icons/fa';
import styles from './styles.module.scss';

interface CheckBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
}

const CustomCheckbox = withStyles({
  root: {
    padding: '0.1rem',
    width: 'fit-content',
    color: 'var(--grafite)',
    '&$checked': {
      color: 'var(--green-100)',
    },
  },
  checked: {},
})((props: CheckboxProps) => <Checkbox color="default" {...props} />);

const CheckboxInput: React.FC<CheckBoxProps> = ({
  name,
  label,
  disabled,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  const { fieldName, defaultValue, error, registerField } = useField(name);

  const [isChecked, setChecked] = useState(rest.defaultChecked);

  const handleChecked = useCallback(
    e => {
      if (inputRef.current) {
        inputRef.current.checked = !isChecked;
      }

      setChecked(!isChecked);
    },
    [inputRef, isChecked],
  );

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'checked',
    });
  }, [fieldName, registerField]);

  const containerStyle = useMemo(() => {
    if (disabled) {
      return styles.containerDisabled;
    }

    if (error) {
      return styles.containerError;
    }

    if (isFocused) {
      return styles.containerFocused;
    }

    if (isFilled) {
      return styles.containerFilled;
    }

    return styles.container;
  }, [disabled, error, isFilled, isFocused]);

  return (
    <div className={styles.parent}>
      <div className={containerStyle}>
        <label htmlFor={inputRef.current?.id}>{label}</label>
        {/* <CustomCheckbox
            inputRef={inputRef}
            defaultChecked={defaultValue as boolean}
            onClick={handleChecked}
          /> */}
        <input
          style={{ display: 'none' }}
          type="checkbox"
          ref={inputRef}
          checked={isChecked}
          onChange={e => {
            e.currentTarget.checked = !isChecked;
          }}
        />
        <button
          className={isChecked ? styles.checked : styles.unchecked}
          onClick={handleChecked}
          type="button"
        >
          <FaCheck />
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default CheckboxInput;
