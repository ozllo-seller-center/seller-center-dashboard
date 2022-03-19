import React, {
  InputHTMLAttributes,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { IconBaseProps } from 'react-icons';
import { useField } from '@unform/core';

import styles from './styles.module.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  icon: React.ComponentType<IconBaseProps>;
}

const FilterInput: React.FC<InputProps> = ({ name, icon: Icon, ...rest }) => {
  const inputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'value',
    });
  }, [fieldName, registerField]);

  const containerStyle = useMemo(() => {
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
  }, [error, isFilled, isFocused]);

  return (
    <>
      <div className={containerStyle}>
        <input
          name={name}
          onFocus={handleInputFocused}
          onBlur={handleInputBlur}
          defaultValue={defaultValue}
          ref={inputRef}
          {...rest}
        />

        <button type="submit">
          {Icon && <Icon size={26} type="submit" />}
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </>
  );
};

export default FilterInput;
