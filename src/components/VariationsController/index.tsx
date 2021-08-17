import AddButton from '../AddButton';
import { FormHandles, Scope, useField } from '@unform/core';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaPlus } from 'react-icons/fa';

import styles from './styles.module.scss';
import api from 'src/services/api';
import { useLoading } from 'src/hooks/loading';
import Variation from './Variation';
import { HTMLAttributes } from 'react';

interface VariationsControllerProps extends HTMLAttributes<HTMLDivElement> {
  handleAddVariation: Function;
  disableAdd?: boolean;
}

const VariationsController: React.FC<VariationsControllerProps> = ({ handleAddVariation, disableAdd, children }: VariationsControllerProps) => {
  // const { fieldName, registerField, defaultValue = [{}] } = useField(name);

  // useEffect(() => {
  //   registerField({
  //     name: fieldName,
  //     ref: variationsRef.current,
  //     getValue: (ref: VariationRefProps) => {
  //       return ref?.variations || [];
  //     },
  //     clearValue: (ref: VariationRefProps) => {
  //       if (!!ref)
  //         ref.variations = [{}, {}, {}];
  //       setVariations([{}, {}, {}])
  //     },
  //     setValue: (ref: VariationRefProps, value) => {
  //       if (!!ref)
  //         ref.variations = value;
  //       setVariations(value);
  //     },
  //   });
  // }, [fieldName, registerField]);

  return (
    <div className={styles.controllerContainer}>
      {children}
      {
        !disableAdd && (
          <div className={styles.addButtonContainer}>
            <AddButton icon={FaPlus} onClick={() => { handleAddVariation() }} type='button'><span>Adicionar variação</span></AddButton>
          </div>
        )
      }
    </div >
  )
}

export default VariationsController;
