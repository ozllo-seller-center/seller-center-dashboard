import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Form } from '@unform/web'
import { FormHandles } from '@unform/core'
import * as Yup from 'yup'

import styles from './styles.module.scss'
import NfeDropzone from '../NfeDropzone'
import api from 'src/services/api'
import { useAuth } from 'src/hooks/auth'
import { useModalMessage } from 'src/hooks/message'
import { OrderNFe, OrderParent } from 'src/shared/types/order'

import xml2js from 'xml2js'
import { isoDateHub2b } from 'src/utils/util'
import Input from '../Input'
import { useLoading } from 'src/hooks/loading'
import { Loader } from '../Loader'
import { FiCheck } from 'react-icons/fi'
import getValidationErrors from 'src/utils/getValidationErrors'
import { useRouter } from 'next/router'
import { MdOutlineFitnessCenter } from 'react-icons/md'

interface NfeModalContentProps {
  item: OrderParent
  closeModal: Function
  onNfeSent?: Function
}

const NfeModalContent: React.FC<NfeModalContentProps> = ({ item, onNfeSent, closeModal }) => {
  const formRef = useRef<FormHandles>(null)

  const [nfeFile, setNfeFile] = useState<File>()
  const [nfeData, setNfeData] = useState<OrderNFe>()

  const [isSuccess, setSuccess] = useState(false)

  const { user, token, updateUser } = useAuth()
  const router = useRouter()

  const { handleModalMessage } = useModalMessage()
  const { isLoading, setLoading } = useLoading()

  useEffect(() => {
    api.get('/account/detail').then(response => {
      updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: response.data.shopInfo._id, userId: response.data.shopInfo.userId } })
    }).catch(err => {
      router.push('/')
    })
  }, [])


  const handleSubmit = useCallback(async (data) => {
    // var dataContainer = new FormData()

    // const blob = new Blob([nfeFile], { type: 'text/xml' })

    // dataContainer.append("xml", blob, nfeFile.name)

    const schema = Yup.object().shape({
      key: Yup.string().required('Campo obrigatório').min(44, "Deve conter 44 caracteres"),
      series: Yup.string().required('Campo obrigatório'),
      cfop: Yup.string().required('Campo obrigatório').min(4, 'Deve conter 4 caracteres'),
      number: Yup.string().required('Campo obrigatório')
    })

    try {
      await schema.validate(data, { abortEarly: false })

      delete data.nfe

      const nfe = {
        ...data,
        issuedDate: (!nfeData) ? isoDateHub2b(new Date().toISOString()) : nfeData.issueDate,
      }

      api.post(`/order/${item.order.reference.id}/invoice`, nfe, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        }
      }).then(reponse => {
        setLoading(false)

        setSuccess(true)

        if (onNfeSent)
          onNfeSent()
      }).catch(err => {
        setLoading(false)
        setSuccess(false)

        handleModalMessage(true, { title: 'Erro', message: ['Erro ao enviar NF-e'], type: 'error' })
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
  }, [nfeData])

  return (
    <div>
      {!isSuccess ? (
        <Form
          ref={formRef}
          onSubmit={handleSubmit}
          className={styles.nfeContent}
        >
          {/* <span>{(item.order.orderNotes.length == 0 || !item.order.orderNotes[0].message) ? 'Anexe uma NF-e a sua venda' : 'Esta venda já possuí uma NF-e anexada'}</span> */}
          <span className={styles.title}>Dados da NF-e</span>
          <div className={styles.doubleInputContainer}>
            <Input
              name='key'
              label='Chave'
              placeholder='Chave da NF-e'
              maxLength={44}
              autoComplete='off'
            />
            <Input
              name='series'
              label='Versão'
              placeholder='Versão da NF-e'
              autoComplete='off'
            />
          </div>
          <div className={styles.doubleInputContainer}>
            <Input
              name='cfop'
              label='CFOP'
              placeholder='CFOP'
              autoComplete='off'
              maxLength={4}
            />
            <Input
              name='number'
              label='Número'
              placeholder='Número da NF'
              autoComplete='off'
            />
          </div>
          <div className={styles.divider} />
          <span className={styles.nfeTip}>Anexe a NF-e abaixo para preencher os campos automaticamente</span>
          <NfeDropzone
            name='nfe'
            onFileUploaded={async (file: File) => {
              setLoading(true)

              let xml

              xml = await file.text().then((data) => { return data })

              let nfeFromFile = {} as OrderNFe

              var parser = new xml2js.Parser()

              const res = await parser.parseStringPromise(xml).then((result: any) => {

                const read = result['nfeProc']

                nfeFromFile.key = read.protNFe[0].infProt[0].chNFe
                nfeFromFile.series = read.NFe[0].infNFe[0].$.versao
                nfeFromFile.cfop = read.NFe[0].infNFe[0].det[0].prod[0].CFOP[0]
                nfeFromFile.number = read.NFe[0].infNFe[0].ide[0].cNF[0]
                nfeFromFile.issueDate = isoDateHub2b(read.NFe[0].infNFe[0].ide[0].dhEmi[0])

                return true
              }).catch(function (err) {
                // Failed

                console.log(err)

                return false
              });

              if (nfeFromFile) {
                setNfeFile(file)
                setNfeData(nfeFromFile)


                formRef.current?.setData(nfeFromFile)

                // setCanConfirm(true)

                setLoading(false)
                return true
              }

              setLoading(false)
              return false
            }}
          />

          <button type='submit' className={styles.button}>Confirmar</button>
        </Form>
      ) : (
        <div className={styles.sucessParent}>
          <FiCheck />
          <span>NF-e enviada com sucesso!</span>
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

export default NfeModalContent
