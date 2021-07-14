import React, { useMemo, useRef } from 'react';
import { useField } from '@unform/core';
import { FiXCircle } from 'react-icons/fi';

import { VariationDTO } from '..';

import Autocomplete from '../../Autocomplete';
import Input from '../../Input';
import { useEffect } from 'react';

import styles from './styles.module.scss'
interface VariationProps {
  variation: VariationDTO;
  index: number;
  sizes: string[];
  colors: string[];
  handleDeleteVariation: Function;
  allowDelete?: boolean;
}

const Variation: React.FC<VariationProps> = ({ variation, index, sizes, colors, allowDelete, handleDeleteVariation }) => {
  const idRef = useRef(null);
  const { registerField, fieldName, defaultValue = variation._id } = useField('_id');

  const { width } = useMemo(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight }
    }

    return {
      width: undefined,
      height: undefined,
    }
  }, [process.browser]);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: idRef.current,
      path: 'value',
    });
  }, [registerField, fieldName])

  return (
    <>
      <div key={index} className={(!!width && width < 768) ? styles.variationContainerMobile : styles.variationContainer}>
        <span>Variação {index + 1}</span>

        <input name='_id' style={{ display: 'none' }} ref={idRef} defaultValue={defaultValue} value={variation._id} />

        {(!!width && width < 768) ? (
          <div className={styles.fieldsContainer}>
            <Autocomplete
              name={'size'}
              items={sizes}
              label='Tamanho/medida'
              placeholder='Tamanho/medida'
              autoComplete='off'
              defaultValue={variation.size}
            />
            <Input
              name='stock'
              label={'Estoque'}
              placeholder='Quantidade em estoque'
              autoComplete='off'
              defaultValue={variation.stock}
            />
            <Autocomplete
              name={'color'}
              items={colors}
              label='Cor'
              placeholder='Escolha a cor'
              autoComplete='off'
              defaultValue={variation.color}
            />
            {
              allowDelete && (
                <button
                  type='button'
                  onClick={() => {
                    handleDeleteVariation(index)
                  }}
                >
                  <FiXCircle />
                </button>
              )
            }
          </div>
        ) : (
          <>
            <Autocomplete
              name={'size'}
              items={sizes}
              label='Tamanho/medida'
              placeholder='Tamanho/medida'
              autoComplete='off'
              defaultValue={variation.size}
            />
            <Input
              name='stock'
              label={'Estoque'}
              placeholder='Quantidade em estoque'
              autoComplete='off'
              defaultValue={variation.stock}
            />
            <Autocomplete
              name={'color'}
              items={colors}
              label='Cor'
              placeholder='Escolha a cor'
              autoComplete='off'
              defaultValue={variation.color}
            />
            {
              allowDelete && (
                <button
                  type='button'
                  onClick={() => {
                    handleDeleteVariation(index)
                  }}
                >
                  <FiXCircle />
                </button>
              )
            }
          </>
        )}
      </div>
    </>
  )
}

export default Variation;
