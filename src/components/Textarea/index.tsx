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

import { TextareaHTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label: string;
  containerStyle?: object;
}

const TextArea: React.FC<TextAreaProps> = ({
  name,
  label,
  disabled,
  ...rest
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const { fieldName, defaultValue, error, registerField } = useField(name);

  const handleInputFocused = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);

    setIsFilled(!!inputRef.current?.value);
  }, []);

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
        <label className={styles.inputLabel}>
          {label}
          {rest.maxLength && (
            <span className={styles.counter}>
              <span> {inputRef.current?.value.length || count}</span>
              <span>/</span>
              <span>{rest.maxLength}</span>
            </span>
          )}
        </label>
        <textarea
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

export default TextArea;
