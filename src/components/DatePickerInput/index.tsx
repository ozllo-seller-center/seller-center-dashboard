import React, {
  InputHTMLAttributes,
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
} from 'react';

import DatePicker from 'react-datepicker';
import ReactDayPicker from 'react-datepicker';
import pt from 'date-fns/locale/pt-BR';

import { IconBaseProps } from 'react-icons';
import { FiCalendar } from 'react-icons/fi';
import { useField } from '@unform/core';

import ReactDatePicker from 'react-datepicker';

// import 'react-datepicker/dist/react-datepicker.css';
import './datepickerstyles.module.css';
import styles from './styles.module.scss';
import { addMonths, subMonths } from 'date-fns';


interface DatePickerInputProps {
  name: string;
  isRanged?: boolean;
  isStart?: boolean;
  isEnd?: boolean;
}

type DatePickerRef = ReactDayPicker & HTMLInputElement;

const Input: React.FC<DatePickerInputProps> = ({
  name,
  isRanged,
  isStart,
  isEnd,
}) => {
  const [inputDate, setInputDate] = useState(new Date() as any);
  const dateRef = useRef<ReactDatePicker>(null);

  const { fieldName, defaultValue, error, registerField } = useField(name);

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

  useEffect(() => {
    console.log(`New Date: ${JSON.stringify(dateRef.current?.props.selected)}`)
  }, [inputDate])

  return (
    <>
      <div
        className={styles.container}
      >
        {isStart && (
          <span>de</span>
        )}
        {isEnd && (
          <span>até</span>
        )}
        <DatePicker
          name={name}
          selected={inputDate}
          onChange={setInputDate}
          ref={dateRef}
          locale={pt}
          dateFormatCalendar="MMMM yyyy"
          formatWeekDay={formattedDate => { return formattedDate[0].toUpperCase() + formattedDate.substr(1, 2).toLowerCase() }}
          dateFormat='dd/MM/yyyy'
          todayButton='Hoje'
          selectsRange={isRanged}
          selectsStart={isStart}
          selectsEnd={isEnd}
          className={styles.datePicker}
          showPopperArrow={false}
          closeOnScroll={true}
          disabledKeyboardNavigation={true}
        />
        <FiCalendar />
      </div>
    </>
  );
};

export default Input;
