import React, {
  InputHTMLAttributes,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

import { useField } from '@unform/core';

import styles from './styles.module.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  containerStyle?: object;
}

const Input: React.FC<InputProps> = ({
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

  const handleInputFocused = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);

    setIsFilled(!!inputRef.current?.value || !!defaultValue);
  }, []);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'value',
    });
  }, [fieldName, registerField]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        className={disabled ? styles.containerDisabled : !!error ? styles.containerError : isFocused ? styles.containerFocused : isFilled ? styles.containerFilled : styles.container} >
        <div>
          <label>{label}</label>
          <input
            type="text"
            name={name}
            onFocus={handleInputFocused}
            onBlur={handleInputBlur}
            defaultValue={defaultValue}
            ref={inputRef}
            disabled={disabled}
            {...rest}
          />
        </div>
      </div>
      {error && (
        <p className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
