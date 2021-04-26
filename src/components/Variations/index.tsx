import AddButton from '@components/AddButton';
import Dropdown from '@components/Dropdown';
import Input from '@components/Input';
import { FormHandles, Scope, useField } from '@unform/core';
import { Form } from '@unform/web';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';

import styles from './styles.module.scss';

type Variation = {
  type?: 'number' | 'size',
  value?: number | string,
  stock?: number,
  color?: string,
}

interface VariationsControllerProps {
  name: string;
}

interface VariationRefProps extends FormHandles {
  variations: Variation[];
}

const VariationsController: React.FC<VariationsControllerProps> = ({ name }: VariationsControllerProps) => {
  const variationsRef = useRef<VariationRefProps>(null);
  const { fieldName, registerField, defaultValue = [{}, {}, {}] } = useField(name);

  const [variations, setVariations] = useState<Variation[]>(defaultValue);

  const handleAddVariation = useCallback(() => {
    setVariations([...variations, {}])
  }, [variations]);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: variationsRef.current,
      getValue: (ref: VariationRefProps) => {
        return ref?.variations || [];
      },
      clearValue: (ref: VariationRefProps) => {
        ref.variations = [{}, {}, {}];
        setVariations([{}, {}, {}])
      },
      setValue: (ref: VariationRefProps, value) => {
        ref.variations = value;
        setVariations(value);
      },
    });
  }, [fieldName, registerField]);

  return (
    <div className={styles.controllerContainer}>
      {
        variations.map((variation, i) => {
          return (
            <Scope path={`variations[${i}]`}>
              <div className={styles.variationContainer}>
                <span>Variação {i + 1}</span>
                <Dropdown
                  name='type'
                  label='Tipo da medida'
                  options={[{ value: 'number', label: 'Medida' }, { value: 'size', label: 'Tamanho' }]} />
                <Input
                  name='size'
                  label={'Tamanho/medida'}
                  placeholder='Tamanho/medida'
                  autoComplete='off'
                />
                <Input
                  name='stock'
                  label={'Estoque'}
                  placeholder='Quantidade em estoque'
                  autoComplete='off'
                />
                <Dropdown
                  name='color'
                  label='Escolha a cor da variação'
                  options={[{ value: 'blue', label: 'Azul' }, { value: 'yellow', label: 'Amarela' }, { value: 'black', label: 'Preta' }, { value: 'pink', label: 'Rosa' }, { value: 'red', label: 'Vermelha' }, { value: 'Green', label: 'Verde' }, { value: 'other', label: 'Outra' }]} />
              </div>
            </Scope>
          )
        })
      }
      <div className={styles.addButtonContainer}>
        <AddButton icon={FaPlus} onClick={handleAddVariation} type='button'><span>Adicionar variação</span></AddButton>
      </div>
    </div>
  )
}

export default VariationsController;
function registerField(arg0: { name: any; ref: any; getValue: (ref: any) => any; clearValue: (ref: any) => void; setValue: (ref: any, value: any) => void; }) {
  throw new Error('Function not implemented.');
}

