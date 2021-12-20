import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';

import { Sell } from 'src/pages/sells';

import styles from './styles.module.scss';
import NfeDropzone from '../NfeDropzone';
import api from 'src/services/api';
import { useAuth } from 'src/hooks/auth';
import { useModalMessage } from 'src/hooks/message';

interface NfeModalContentProps {
  item: Sell;
  closeModal: Function;
}

const NfeModalContent: React.FC<NfeModalContentProps> = ({ item, closeModal }) => {
  const formRef = useRef<FormHandles>(null)

  const [nfeFile, setNfeFile] = useState<File>()
  const [canConfirm, setCanConfirm] = useState(false)

  const { user, token } = useAuth();

  const { handleModalMessage } = useModalMessage();

  useEffect(() => {
    if (formRef.current)
      formRef.current.setData({ nfe: item.nfe_url })
  }, []);

  const handleSubmit = useCallback(() => {
    if (nfeFile) {
      var dataContainer = new FormData();

      dataContainer.append("images", nfeFile, nfeFile.name)

      api.patch(`/order/${item.id}`, {
        header: {
          authorization: token,
          shop_id: user.shopInfo._id,
        }
      }).then(reponse => {
        closeModal()
      }).catch(err => {
        handleModalMessage(true, { title: 'Erro', message: ['Erro ao enviar arquivo NF-e'], type: 'error' })
      })
    }
  }, [nfeFile])

  return (
    <div>
      <Form
        onSubmit={() => { }}
        className={styles.nfeContent}
      >
        <span>{!item.nfe_url ? 'Anexe uma NF-e a sua venda' : 'Esta venda já possuí uma NF-e anexada'}</span>
        <NfeDropzone
          name='nfe'
          onFileUploaded={(files: File[]) => {
            item.nfe_url = URL.createObjectURL(files[0])
            setNfeFile(files[0])

            setCanConfirm(true)
          }}
        />

        {
          canConfirm && (
            <button type='submit' className={styles.button}>Confirmar</button>
          )
        }
      </Form>
    </div>
  )
}

export default NfeModalContent;
