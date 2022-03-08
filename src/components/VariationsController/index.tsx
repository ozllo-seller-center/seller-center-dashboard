import React from 'react';
import { FaPlus } from 'react-icons/fa';

import { HTMLAttributes } from 'react';
import styles from './styles.module.scss';
import AddButton from '../AddButton';

interface VariationsControllerProps extends HTMLAttributes<HTMLDivElement> {
  handleAddVariation: Function;
  disableAdd?: boolean;
}

const VariationsController: React.FC<VariationsControllerProps> = ({ handleAddVariation, disableAdd, children }: VariationsControllerProps) => (
  <div className={styles.controllerContainer}>
    {children}
    {
        !disableAdd && (
          <div className={styles.addButtonContainer}>
            <AddButton icon={FaPlus} onClick={() => { handleAddVariation(); }} type="button"><span>Adicionar variação</span></AddButton>
          </div>
        )
      }
  </div>
);

export default VariationsController;
