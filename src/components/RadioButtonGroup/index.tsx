import { useField } from '@unform/core';
import React, { InputHTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import styles from './styles.module.scss';

type Radio = {
  name: string,
  label: string,
  value: string,
}

interface RadioButtonGroupProps {
  name: string;
  radios: Radio[];
  defaultRadio?: string;
}

interface InputRefProps extends HTMLInputElement {
  selectedRadio: string;
}

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({ radios, name, defaultRadio, ...rest }: RadioButtonGroupProps) => {
  const inputRef = useRef<InputRefProps>(null);
  const { fieldName, registerField, defaultValue = defaultRadio } = useField(name);

  const [radioValue, setRadioValue] = useState(defaultValue);
  const itemsRef = useMemo(() => Array(radios.length).fill(0).map(i => React.createRef<InputRefProps>()), [radios]);

  const handleRadioCheck = useCallback((value: string) => {
    setRadioValue(value);

    if (!!inputRef.current)
      inputRef.current.selectedRadio = value;
  }, [radioValue, inputRef])


  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      getValue: (ref: InputRefProps) => {
        return radioValue || '';
      },
      clearValue: (ref: InputRefProps) => {
        ref.selectedRadio = '';
        setRadioValue('');
      },
      setValue: (ref: InputRefProps, value) => {
        ref.selectedRadio = value;
        setRadioValue(value);
      },
    });
  }, [fieldName, registerField]);

  return (
    <>
      <div className={styles.radioContainer}>
        {
          radios.map((radio, i) => {
            return (
              <label key={radio.name} className={styles.radio}>
                <span className={styles.radioInput}>
                  <input
                    type='radio'
                    name={radio.name}
                    value={radio.value}
                    ref={itemsRef[i]}
                    className={styles.radiol}
                    onChange={() => handleRadioCheck(radio.value)}
                    checked={radioValue === radio.value} />
                  <span className={styles.radioControl}></span>
                </span>
                <span className={styles.radioLabel}>{radio.label}</span>
              </label>
            )
          })
        }
      </div>
    </>
  )
}

export default RadioButtonGroup;
