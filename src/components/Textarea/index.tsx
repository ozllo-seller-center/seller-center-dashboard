import React, {
  InputHTMLAttributes,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
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
  const {
    fieldName, defaultValue, error, registerField,
  } = useField(name);

  const handleInputFocused = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);

    setIsFilled(!!inputRef.current?.value);
  }, []);

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
      <div
        className={containerStyle}
      >
        <label className={styles.inputLabel}>{label}</label>
        <textarea
          name={name}
          onFocus={handleInputFocused}
          onBlur={handleInputBlur}
          defaultValue={defaultValue}
          ref={inputRef}
          disabled={disabled}
          {...rest}
        />
      </div>
      {error && (
        <p className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
};

export default TextArea;
