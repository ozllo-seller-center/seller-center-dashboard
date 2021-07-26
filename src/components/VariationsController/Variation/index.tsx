import React, { useMemo, useRef, useState } from 'react';
import { useField } from '@unform/core';
import { FiXCircle } from 'react-icons/fi';

import Autocomplete from '../../Autocomplete';
import Input from '../../Input';
import { useEffect } from 'react';

import styles from './styles.module.scss'
import { useCallback } from 'react';
import { boolean } from 'yup';
import Checkbox from 'src/components/Checkbox';

interface DefaultVariationDTO {
  _id?: string;
  size?: number | string,
  stock?: number,
  color?: string,
  flavor?: string;
  gluten_free?: boolean,
  lactose_free?: boolean,
  voltage?: string,
}
interface VariationAttributes {
  name: string;
  label: string;
  placeholder: string;
  type: string;
  valueAt: string;
}
interface VariationProps {
  variation: any;
  index: number;
  attributes: any;
  handleDeleteVariation: Function;
  allowDelete?: boolean;
}

const Variation: React.FC<VariationProps> = ({ variation, index, attributes, allowDelete, handleDeleteVariation }) => {
  const idRef = useRef(null);
  const { registerField, fieldName, defaultValue = variation._id } = useField('_id');

  const [variationAttributes, setVariationAttributes] = useState<VariationAttributes[]>([]);

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


  useEffect(() => {
    if (!!attributes) {
      let attributeDefs: VariationAttributes[];

      const keys = Object.keys(attributes);

      attributeDefs = keys.map(key => {
        let valueAt;
        let label;
        let placeholder;

        switch (key) {
          case 'colors':
            label = 'Cor'
            placeholder = 'Escolha a cor'
            break;
          case 'sizes':
            label = 'Tamanho/medida'
            placeholder = 'Tamanho/medida'
            break;
          case 'flavors':
            label = 'Sabor'
            placeholder = 'Escolha o sabor'
            break;
          case 'voltages':
            label = 'Voltagens'
            placeholder = 'Escolha o voltagem'
            break;
          case 'gluten_free':
            label = 'Sem glútem?'
            placeholder = ''
            break;
          case 'lactose_free':
            label = 'Sem lactose?'
            placeholder = ''
            break;
          default:
            label = ''
            placeholder = ''
            break;
        }

        switch (key) {
          case 'colors':
          case 'sizes':
          case 'flavors':
          case 'voltages':
            valueAt = key.substring(0, key.length - 1)
            break;
          default:
            valueAt = key
            break;
        }

        return {
          name: key,
          type: (typeof attributes[key][0]) as string,
          valueAt,
          label,
          placeholder,
        }
      })

      setVariationAttributes(attributeDefs)
    }
  }, [attributes])

  const containerStyle = useMemo(() => {
    let className = styles.variationContainer

    if (!!width && width < 768) {
      return styles.variationContainerMobile
    }

    switch (variationAttributes.length) {
      case 3:
        return className = className.concat(' ').concat(styles.grid3)
      case 4:
        return className = className.concat(' ').concat(styles.grid4)
    }

    return className;
  }, [width, variationAttributes])

  const mobileContainerStyle = useMemo(() => {
    let className = styles.fieldsContainer

    switch (variationAttributes.length) {
      case 3:
        return className = className.concat(' ').concat(styles.gridMobile3)
      case 4:
        return className = className.concat(' ').concat(styles.gridMobile4)
    }

    return className;
  }, [width, variationAttributes])

  return (
    <>
      <div key={index} className={containerStyle}>
        <span>Variação {index + 1}</span>

        <input name='_id' style={{ display: 'none' }} ref={idRef} defaultValue={defaultValue} value={variation._id} />

        {(!!width && width < 768) ? (
          <div className={mobileContainerStyle}>
            {
              variationAttributes.map(variationAttribute => {
                switch (variationAttribute.type) {
                  case 'boolean':
                    return (
                      <Checkbox
                        key={variationAttribute.name}
                        name={variationAttribute.valueAt}
                        label={variationAttribute.label}
                        defaultValue={variation[variationAttribute.valueAt]}
                        defaultChecked={variation[variationAttribute.valueAt]}
                      />
                    )
                  case 'number':
                    return (
                      <Input
                        key={variationAttribute.name}
                        name={variationAttribute.valueAt}
                        label={variationAttribute.label}
                        placeholder={variationAttribute.placeholder}
                        autoComplete='off'
                        defaultValue={variation[variationAttribute.valueAt]}
                      />
                    )
                  default:
                    return (
                      <Autocomplete
                        key={variationAttribute.name}
                        name={variationAttribute.valueAt}
                        items={attributes[variationAttribute.valueAt]}
                        label={variationAttribute.label}
                        placeholder={variationAttribute.placeholder}
                        autoComplete='off'
                        defaultValue={variation[variationAttribute.valueAt]}
                      />
                    )
                }
              })
            }

            <Input
              name='stock'
              label={'Estoque'}
              placeholder='Quantidade em estoque'
              autoComplete='off'
              defaultValue={variation.stock}
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
            {
              variationAttributes.map(variationAttribute => {
                switch (variationAttribute.type) {
                  case 'boolean':
                    return (
                      <Checkbox
                        key={variationAttribute.name}
                        name={variationAttribute.valueAt}
                        label={variationAttribute.label}
                        placeholder={variationAttribute.placeholder}
                        defaultChecked={variation[variationAttribute.valueAt]}
                      />
                    )
                  case 'number':
                    return (
                      <Input
                        key={variationAttribute.name}
                        name={variationAttribute.valueAt}
                        label={variationAttribute.label}
                        placeholder={variationAttribute.placeholder}
                        autoComplete='off'
                        defaultValue={variation[variationAttribute.valueAt]}
                      />
                    )
                  default:
                    return (
                      <Autocomplete
                        key={variationAttribute.name}
                        name={variationAttribute.valueAt}
                        items={attributes[variationAttribute.name]}
                        label={variationAttribute.label}
                        placeholder={variationAttribute.placeholder}
                        autoComplete='off'
                        defaultValue={variation[variationAttribute.valueAt]}
                      />
                    )
                }
              })
            }

            <Input
              name='stock'
              label={'Estoque'}
              placeholder='Quantidade em estoque'
              autoComplete='off'
              defaultValue={variation.stock}
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
