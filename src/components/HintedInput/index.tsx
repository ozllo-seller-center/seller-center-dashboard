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
  hint?: React.ReactNode;
}

const HintedInput: React.FC<InputProps> = ({
  name,
  label,
  disabled,
  hint,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const {
    fieldName, defaultValue, error, registerField,
  } = useField(name);

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
    if (disabled) { return styles.containerDisabled; }

    if (error) { return styles.containerError; }

    if (isFocused) { return styles.containerFocused; }

    if (isFilled) { return styles.containerFilled; }

    return styles.container;
  }, [disabled, error, isFilled, isFocused]);

  return (
    <div className={styles.parent}>
      <div className={containerStyle}>
        <span className={styles.inputLabel}>{label}</span>
        <div className={styles.hintedContainer}>
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
          {hint}
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

export default HintedInput;
