import { useField } from '@unform/core';
import React, {
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// import '../DatePickerInput/datepickerstyles.module.css';
import ReactDatePicker from 'react-datepicker';
import styles from './styles.module.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
}

interface InputRefProps extends InputHTMLAttributes<HTMLInputElement> {
  inputRef?: React.RefObject<any>;
  name: string;
  defaultValue?: any;
  setIsFocused: React.Dispatch<any>;
  setIsFilled: React.Dispatch<any>;
}

const InputDefault: React.FC<InputRefProps> = ({
  inputRef,
  name,
  placeholder,
  disabled,
  defaultValue,
  setIsFocused,
  setIsFilled,
  ...rest
}) => {
  const handleInputFocused = useCallback(() => {
    setIsFocused(true);
  }, [setIsFocused]);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);

    setIsFilled(inputRef?.current.value);
  }, [inputRef, setIsFilled, setIsFocused]);

  return (
    <input
      // type="text"
      name={name}
      placeholder={placeholder}
      onFocus={handleInputFocused}
      onBlur={handleInputBlur}
      defaultValue={defaultValue}
      ref={inputRef}
      disabled={disabled}
      {...rest}
    />
  );
};

const Input: React.FC<InputProps> = ({
  name,
  disabled,
  placeholder,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { fieldName, defaultValue, error, registerField } = useField(name);

  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(!!defaultValue);

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
    <div>
      <div className={containerStyle}>
        <InputDefault
          inputRef={inputRef}
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          setIsFilled={setIsFilled}
          setIsFocused={setIsFocused}
          disabled={disabled}
          {...rest}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default Input;
