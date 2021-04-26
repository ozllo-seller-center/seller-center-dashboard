import DatePickerInput from '@components/DatePickerInput';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import React, { HTMLAttributes, useCallback, useRef, useState } from 'react';
import { IconType } from 'react-icons';

import styles from './styles.module.scss';

type DatePickerProps = HTMLAttributes<HTMLDivElement> & {
  setFromDateFilter: Function;
  setToDateFilter: Function;
  formRef: React.RefObject<FormHandles>;
  visibility: boolean;
  setVisibility: Function;
}

interface DatePickerFormData {
  fromDate: Date;
  toDate: Date;
}

const DatePickerPopup: React.FC<DatePickerProps> = ({ formRef, setFromDateFilter, setToDateFilter, visibility, setVisibility, style, children }) => {

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [error, setError] = useState('');

  const handleDatePicker = useCallback(
    async (data: DatePickerFormData) => {
      data.fromDate.setHours(23, 59, 59, 999);

      setFromDateFilter(data.fromDate);
      setToDateFilter(data.toDate);

      setVisibility(false);
    }, [setToDateFilter, setFromDateFilter]
  )

  const handleCancel = useCallback(() => {
    setVisibility(false);
  }, []);

  return (
    <div className={visibility ? styles.popupContainer : styles.popupContainerHide} style={style}>
      <Form ref={formRef} onSubmit={handleDatePicker}>
        <DatePickerInput
          name="fromDate"
          // setState={setStartDate}
          isStart
        />
        <DatePickerInput
          name="toDate"
          // setState={setEndDate}
          isEnd
        />

        <button type="submit">Ok</button>
        <span onClick={handleCancel}>Cancelar</span>
      </Form>
    </div>
  );
}

export default DatePickerPopup;
