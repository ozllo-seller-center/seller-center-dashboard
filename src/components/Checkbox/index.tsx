import React, {
  InputHTMLAttributes,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

import { useField } from '@unform/core';

import styles from './styles.module.scss';
import { CheckboxProps } from '@material-ui/core/Checkbox';
import { Checkbox, withStyles } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import { FiCheck } from 'react-icons/fi';
import { FaCheck } from 'react-icons/fa';

interface CheckBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  containerStyle?: object;
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
  containerStyle = {},
  disabled,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  const { fieldName, defaultValue, error, registerField } = useField(name);

  const [isChecked, setChecked] = useState(rest.defaultChecked);

  const handleChecked = useCallback((e) => {
    if (!!inputRef.current)
      inputRef.current.checked = !isChecked

    setChecked(!isChecked)
  }, [inputRef, isChecked])

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'checked',
    });
  }, [fieldName, registerField]);

  return (
    <div className={styles.parent}>
      <div
        className={disabled ? styles.containerDisabled : !!error ? styles.containerError : isFocused ? styles.containerFocused : isFilled ? styles.containerFilled : styles.container} >
        <label>{label}</label>
        {/* <CustomCheckbox
            inputRef={inputRef}
            defaultChecked={defaultValue as boolean}
            onClick={handleChecked}
          /> */}
        <input
          style={{ display: 'none' }}
          type='checkbox'
          ref={inputRef}
          checked={isChecked}
        />
        <button

          className={isChecked ? styles.checked : styles.unchecked}
          onClick={handleChecked}
          type='button'
        >
          <FaCheck />
        </button>
      </div>
      {error && (
        <p className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
};

export default CheckboxInput;
