import { useField } from '@unform/core';
import React, {
  SelectHTMLAttributes, useCallback, useEffect, useRef, useState,
} from 'react';

import styles from './styles.module.scss';

interface DropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  name: string
  label: string;
  options: Array<{ value: string, label: string }>;
}

interface DropdownRefProps extends HTMLSelectElement {
  selectedOption: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label, name, options, ...rest
}) => {
  const selectRef = useRef<DropdownRefProps>(null);
  const { fieldName, registerField, defaultValue = '' } = useField(name);

  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: selectRef.current,
      getValue: (ref: DropdownRefProps) => ref.selectedOption || '',
      clearValue: (ref: DropdownRefProps) => {
        ref.selectedOption = '';
        setValue('');
      },
      setValue: (ref: DropdownRefProps, v) => {
        ref.selectedOption = v;
        setValue(v);
      },
    });
  }, [fieldName, registerField]);

  const handleOnChange = useCallback((e) => {
    if (selectRef.current) { selectRef.current.selectedOption = e.target.value; }

    setValue(e.target.value);
  }, [value]);

  return (
    <div className={styles.selectBlock}>
      <select value={value} onChange={handleOnChange} id={name} ref={selectRef} {...rest}>
        <option value="" disabled hidden>{label}</option>
        {
          options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)
        }
      </select>
    </div>
  );
};

export default Dropdown;
