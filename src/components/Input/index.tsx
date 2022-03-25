import React, {
  InputHTMLAttributes,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';

import { useField } from '@unform/core';

import styles from './styles.module.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
}

const Input: React.FC<InputProps> = ({ name, label, disabled, ...rest }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const { fieldName, defaultValue, error, registerField } = useField(
    name as string,
  );

  const handleInputFocused = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);

    setIsFilled(!!inputRef.current?.value || !!defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'value',
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
        <label htmlFor={inputRef.current?.id} className={styles.inputLabel}>
          {label}
        </label>
        <input
          // type="text"
          name={name}
          onFocus={handleInputFocused}
          onBlur={handleInputBlur}
          defaultValue={defaultValue}
          ref={inputRef}
          disabled={disabled}
          {...rest}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default Input;
