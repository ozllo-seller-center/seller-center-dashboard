import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Form } from '@unform/web'
import { FormHandles } from '@unform/core'
import * as Yup from 'yup'

import styles from './styles.module.scss'
import api from 'src/services/api'
import { useAuth } from 'src/hooks/auth'
import { useModalMessage } from 'src/hooks/message'
import { OrderInvoice, OrderParent } from 'src/shared/types/order'

import { isoDateHub2b } from 'src/utils/util'
import Input from '../Input'
import { useLoading } from 'src/hooks/loading'
import { Loader } from '../Loader'
import { FiCheck } from 'react-icons/fi'
import DatePickerInput from '../DatePicker'
import getValidationErrors from 'src/utils/getValidationErrors'
import { useRouter } from 'next/router'

interface TrackingModalContentProps {
  item: OrderParent
  closeModal: Function
  onTrackSent?: Function
}

const TrackingModalContent: React.FC<TrackingModalContentProps> = ({ item, onTrackSent, closeModal }) => {
  const formRef = useRef<FormHandles>(null)

  const [isSuccess, setSuccess] = useState(false)

  const { user, token, updateUser } = useAuth()
  const router = useRouter()

  const { handleModalMessage } = useModalMessage()
  const { isLoading, setLoading } = useLoading()

  useEffect(() => {
    setLoading(true)

    api.get('/account/detail').then(response => {
      updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: response.data.shopInfo._id, userId: response.data.shopInfo.userId } })
      setLoading(false)
    }).catch(err => {
      setLoading(false)
      router.push('/')
    })
  }, [])

  const handleSubmit = useCallback(async (data) => {
    setSuccess(false)

    setLoading(true)

    const schema = Yup.object().shape({
      code: Yup.string().required('Campo obrigatório').min(8, "Deve conter pelo menos 8 caracteres"),
      url: Yup.string().url('Deve ser uma URL (Ex.: http://site.com.br/)').required('Campo obrigatório'),
      shippingProvider: Yup.string().required('Campo obrigatório'),
      shippingService: Yup.string().required('Campo obrigatório'),
      shippingDate: Yup.date().required('Campo obrigatório'),
    })

    try {
      await schema.validate(data, { abortEarly: false })

      const invoice: OrderInvoice = {
        ...data,
        shippingDate: isoDateHub2b(data.shippingDate.toISOString()),
      }

      api.post(`/order/${item.order.reference.id}/tracking`, invoice, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        }
      }).then(reponse => {
        setLoading(false)

        setSuccess(true)

        if (onTrackSent)
          onTrackSent()
      }).catch(err => {
        setLoading(false)

        handleModalMessage(true, { title: 'Erro', message: ['Erro ao enviar rastreio'], type: 'error' })
      })
    } catch (err) {
      setLoading(false)

      if (err instanceof Yup.ValidationError) {
        const errors = getValidationErrors(err);

        formRef.current?.setErrors(errors);

        return;
      }

      console.log(err)
    }
  }, [])

  return (
    <div>
      {!isSuccess ? (
        <Form
          ref={formRef}
          onSubmit={handleSubmit}
          className={styles.trackingContent}
        >
          <span className={styles.title}>Dados do Rastreio</span>
          <div className={styles.doubleInputContainer}>
            {/* <MaskedInput
              name='shippingDate'
              label='Data de postagem (dd/mm/aaaa)'
              placeholder='Data de postagem (Ex.: 01/01/2000)'
              autoComplete='off'
              mask={'99/99/9999'}
              maskChar={'#'}
            /> */}
            <DatePickerInput
              name='shippingDate'
              label='Data de postagem'
            />
          </div>
          <div className={styles.doubleInputContainer}>
            <Input
              name='code'
              label='Código'
              placeholder='Código de rastreio'
              autoComplete='off'
            />
            <Input
              name='url'
              label='Link'
              placeholder='Link do rastreio'
              autoComplete='off'
            />
          </div>
          <div className={styles.doubleInputContainer}>
            <Input
              name='shippingProvider'
              label='Trasnportadora'
              placeholder='Transportadora'
              autoComplete='off'
            />
            <Input
              name='shippingService'
              label='Serviço'
              placeholder='Serviço'
              autoComplete='off'
            />
          </div>

          <button type='submit' className={styles.button}>Confirmar</button>
        </Form>
      ) : (
        <div className={styles.sucessParent}>
          <FiCheck />
          <span>Rastreio registrado com sucesso!</span>
        </div>
      )}
      {
        isLoading && (
          <div className={styles.loadingContainer}>
            <Loader />
          </div>
        )
      }
    </div >
  )
}

export default TrackingModalContent
