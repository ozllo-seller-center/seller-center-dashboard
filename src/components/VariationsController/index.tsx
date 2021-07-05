import AddButton from '../AddButton';
import { FormHandles, Scope, useField } from '@unform/core';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaPlus } from 'react-icons/fa';

import styles from './styles.module.scss';
import api from 'src/services/api';
import { useLoading } from 'src/hooks/loading';
import Variation from './Variation';

export type VariationDTO = {
  _id?: string;
  size?: number | string,
  stock?: number,
  color?: string,
}

interface VariationsControllerProps {
  name: string;
  variations: VariationDTO[];
  handleAddVariation: Function;
  handleDeleteVariation(deletedIndex: number): void;
}

interface VariationRefProps extends FormHandles {
  variations: VariationDTO[];
}

const VariationsController: React.FC<VariationsControllerProps> = ({ name, handleAddVariation, handleDeleteVariation, variations }: VariationsControllerProps) => {
  // const { fieldName, registerField, defaultValue = [{}] } = useField(name);

  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(true)

    api.get('/size/all').then(response => {
      setSizes(response.data)
    }).catch((err) => {
      console.log(err);
    })

    api.get('/color/all').then(response => {
      setColors(response.data)
      setLoading(false)
    }).catch((err) => {
      console.log(err)
      setLoading(false)
    })
  }, [])

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
      {
        variations.map((variation, i) => {
          return (
            <Scope key={i} path={`variations[${i}]`}>
              <Variation
                variation={variation}
                index={i}
                handleDeleteVariation={() => handleDeleteVariation(i)}
                colors={colors}
                sizes={sizes}
                styles={styles}
                allowDelete={i > 0}
              />
            </Scope>
          )
        })
      }
      <div className={styles.addButtonContainer}>
        <AddButton icon={FaPlus} onClick={() => { handleAddVariation() }} type='button'><span>Adicionar variação</span></AddButton>
      </div>
    </div >
  )
}

export default VariationsController;
