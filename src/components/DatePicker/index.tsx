import React, {
  InputHTMLAttributes,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';

import { useField } from '@unform/core';
import pt from 'date-fns/locale/pt-BR';

import { FiCalendar } from 'react-icons/fi';

import DatePicker from 'react-datepicker';

import ReactDatePicker from 'react-datepicker';
import styles from './styles.module.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
}

const DatePickerInput: React.FC<InputProps> = ({
  name,
  label,
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
    <div className={styles.parent}>
      <div className={containerStyle}>
        <span className={styles.inputLabel}>{label}</span>
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
            formatWeekDay={(formattedDate: string) =>
              formattedDate[0].toUpperCase() +
              formattedDate.substr(1, 2).toLowerCase()
            }
            dateFormat="dd/MM/yyyy"
            todayButton="Hoje"
            className={styles.datePicker}
            showPopperArrow={false}
            closeOnScroll
            disabledKeyboardNavigation
          />
          <FiCalendar />
        </div>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default DatePickerInput;
