import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { HTMLAttributes } from 'react';

import { useField } from '@unform/core';

import ReactInputMask, { Props as InputProps } from 'react-input-mask';
import styles from './styles.module.scss';

interface MaskInputProps extends Omit<InputProps, 'ref'> {
  name: string;
  label?: string;
  // mask: string;
}

interface InputMaskRef extends ReactInputMask {
  value: any;
}

const MaskedInput: React.FC<MaskInputProps> = ({ name, label, ...rest }) => {
  const ref = useRef<InputMaskRef>(null);

  const { fieldName, defaultValue, error, registerField } = useField(name);

  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(!!defaultValue);

  // const [inputMaks, setInputMask] = useState(mask);

  const handleInputFocused = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);

    if (ref.current) {
      setIsFilled(!!ref.current?.value);
    }
  }, [ref]);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: ref.current,
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
        <div>
          {label ? (
            <>
              <span>{label}</span>
              <ReactInputMask
                onFocus={handleInputFocused}
                onBlur={handleInputBlur}
                ref={ref}
                {...rest}
                defaultValue={defaultValue}
              />
            </>
          ) : (
            <ReactInputMask
              onFocus={handleInputFocused}
              onBlur={handleInputBlur}
              ref={ref}
              {...rest}
              defaultValue={defaultValue}
            />
          )}
        </div>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </>
  );
};

export default MaskedInput;
