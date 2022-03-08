import React, { useEffect } from 'react';
import Modal from '../Modal';
import styles from './styles.module.scss';

interface ActionModalProps {
  handleVisibility: React.MouseEventHandler
  titulo: string,
  mensagem: string,
  execute:any
}

const ActionModal: React.FC<ActionModalProps> = ({
  handleVisibility, titulo, mensagem, execute,
}) => (
  <Modal handleVisibility={handleVisibility} title={titulo} cleanStyle>
    <div>
      <div className={styles.normal}>
        <div className={styles.content}>
          <div className={styles.column}>
            <strong>{mensagem}</strong>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.info}>
            <button type="button" onClick={execute}>Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  </Modal>
);

export default ActionModal;
