import React, {
  InputHTMLAttributes,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

import { useField } from '@unform/core';
import DatePicker from 'react-datepicker';
import pt from 'date-fns/locale/pt-BR';

import { FiCalendar } from 'react-icons/fi';

import styles from './styles.module.scss';
import ReactDatePicker from 'react-datepicker';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  containerStyle?: object;
}

const DatePickerInput: React.FC<InputProps> = ({
  name,
  label,
  containerStyle = {},
  disabled,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const { fieldName, defaultValue, error, registerField } = useField(name);

  const [inputDate, setInputDate] = useState(new Date() as any);
  const dateRef = useRef<ReactDatePicker>(null);

  const handleInputFocused = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);

    setIsFilled(!!inputRef.current?.value || !!defaultValue);
  }, []);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: dateRef.current,
      path: 'props.selected',
      clearValue: (ref: any) => {
        ref.clear();
      },
    });
  }, [fieldName, registerField]);

  return (
    <div className={styles.parent}>
      <div
        className={disabled ? styles.containerDisabled : !!error ? styles.containerError : isFocused ? styles.containerFocused : isFilled ? styles.containerFilled : styles.container} >
        <label className={styles.inputLabel}>{label}</label>
        <div>
          <DatePicker
            name={name}
            selected={inputDate}
            onChange={setInputDate}
            onFocus={handleInputFocused}
            onBlur={handleInputBlur}
            ref={dateRef}
            locale={pt}
            dateFormatCalendar="MMMM yyyy"
            formatWeekDay={(formattedDate: string) => { return formattedDate[0].toUpperCase() + formattedDate.substr(1, 2).toLowerCase() }}
            dateFormat='dd/MM/yyyy'
            todayButton='Hoje'
            className={styles.datePicker}
            showPopperArrow={false}
            closeOnScroll={true}
            disabledKeyboardNavigation={true}
          />
          <FiCalendar />
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

export default DatePickerInput;
