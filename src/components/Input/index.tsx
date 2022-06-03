import React, {
  InputHTMLAttributes,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  ChangeEvent,
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

  const [count, setCount] = useState(0);

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!rest.maxLength) return;
    setCount(e.target.value.length);
  };

  return (
    <div className={styles.parent}>
      <div className={containerStyle}>
        <label htmlFor={inputRef.current?.id} className={styles.inputLabel}>
          {label}
          {rest.maxLength && (
            <span className={styles.counter}>
              <span>{inputRef.current?.value.length || count}</span>
              <span>/</span>
              <span>{rest.maxLength}</span>
            </span>
          )}
        </label>
        <input
          name={name}
          onFocus={handleInputFocused}
          onBlur={handleInputBlur}
          defaultValue={defaultValue}
          ref={inputRef}
          disabled={disabled}
          onChange={(e: any) => handleChange(e)}
          {...rest}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default Input;
