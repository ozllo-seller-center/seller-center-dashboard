import { useField } from '@unform/core';
import React, { InputHTMLAttributes, useCallback, useEffect, useRef, useState } from 'react';
import InputMask, { ReactInputMask } from 'react-input-mask';

import DatePicker from 'react-datepicker';
import pt from 'date-fns/locale/pt-BR';

import '../DatePickerInput/datepickerstyles.module.css';
import styles from './styles.module.scss';
import ReactDatePicker from 'react-datepicker';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  containerStyle?: object;
}

interface InputRefProps extends InputHTMLAttributes<HTMLInputElement> {
  inputRef?: React.RefObject<any>;
  name: string;
  defaultValue?: any;
  setIsFocused: Function;
  setIsFilled: Function;
}

const InputDefault: React.FC<InputRefProps> = ({ inputRef, name, placeholder, disabled, defaultValue, setIsFocused, setIsFilled, ...rest }) => {
  const handleInputFocused = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);

    setIsFilled(inputRef?.current.value);
  }, []);

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
  )
}

const Input: React.FC<InputProps> = ({
  name,
  disabled,
  placeholder,
  containerStyle = {},
  ...rest
}) => {
  const dateRef = useRef<ReactDatePicker>(null);
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

  return (
    <div style={containerStyle}>
      <div
        className={disabled ? styles.containerDisabled : !!error ? styles.containerError : isFocused ? styles.containerFocused : isFilled ? styles.containerFilled : styles.container} >
        <InputDefault
          inputRef={inputRef}
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          setIsFilled={setIsFilled}
          setIsFocused={setIsFocused}
          disabled={disabled}
          {...rest} />
      </div>
      {error && (
        <p className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
