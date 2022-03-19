import { TextField, TextFieldProps } from '@material-ui/core';
import { useField } from '@unform/core';
import React, { useRef } from 'react';
import Input, { InputProps } from 'react-select/src/components/Input';

type CustomTextfieldProps = TextFieldProps & {
  name: string;
};

const Textfield: React.FC<CustomTextfieldProps> = ({ name, ...rest }) => {
  const inputRef = useRef<InputProps>(null);

  const { fieldName, defaultValue, error, registerField } = useField(name);

  return <TextField name={name} inputRef={inputRef} {...rest} />;
};

export default Textfield;
