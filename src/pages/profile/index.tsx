import React, { useCallback, useRef, ChangeEvent, useState, useMemo } from 'react'

import { FormHandles, Scope } from '@unform/core'
import { Form } from '@unform/web'
import * as Yup from 'yup'
import { cnpj as cnpjValidator } from 'cpf-cnpj-validator'

import { useAuth } from '../../hooks/auth'

import api from '../../services/api'

import getValidationErrors from '../../utils/getValidationErrors'

import styles from './styles.module.scss'

import Input from '../../components/InputLabeless'
import Button from '../../components/PrimaryButton'
import { format } from 'date-fns'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useLoading } from 'src/hooks/loading'
import { Loader } from 'src/components/Loader'
import Autocomplete from 'src/components/Autocomplete'
import { CompanyInfo, PersonInfo } from 'src/shared/types/personalInfo'
import UserTypeButton from 'src/components/UserTypeButton'
import { FaUserTie, FaStore } from 'react-icons/fa'
import { useModalMessage } from 'src/hooks/message'
import { AppError, findError, getErrorField } from 'src/shared/errors/api/errors'
import MessageModal from 'src/components/MessageModal'
import { FiCheck, FiX } from 'react-icons/fi'
import MaskedInput from 'src/components/MaskedInput'
import { Bank } from 'src/shared/types/bank'
import { isTokenValid } from 'src/utils/util'

interface PersonalInfoDTO {
  isPF: boolean,
  firstName: string,
  lastName: string,
  cpf: string,
  // birthday?: string,
  day: number,
  month: number,
  year: number,
}

type ProfileFormData = {
  personalInfo: PersonalInfoDTO | CompanyInfo,

  address: {
    cep: string,
    address: string,
    number: number,
    complement: string,
    district: string,
    city: string,
  }

  email: string,
  // phone?: string,

  // commission: number,
  // role: string,

  bankInfo: {
    bank: string,
    name: string,
    account: string,
    agency: string,
    pix?: string,
  }

  contact: {
    phone?: string,
    url?: string,
  }

  shopInfo: {
    _id: string,
    name: string,
    cnpj: string,

    // address: string,
    // district: string,
    // city: string,
    // complement: string,
    // number: number,
  }
}

const ddRegex = /^\([1-9]{2}\)/
const phoneRegex = /(?:[2-8]|9[1-9])/
const endPhoneRegex = /[0-9]{3}\-[0-9]{4}$/

const completephoneRegex = /^\([1-9]{2}\)(?:[2-8]|9[1-9])[0-9]{3}\-[0-9]{4}$/

const letterRegex = /[a-zA-Z]/g

const TYPE_INDEX = -1
const PERSONAL_INDEX = 0
const ADDRESS_INDEX = 1
const CONTACT_INDEX = 2
const SELLER_INDEX = 3
const STORE_INDEX = 4

const Profile: React.FC = () => {
  const { user, updateUser, token, signOut } = useAuth()
  const { isLoading, setLoading } = useLoading()

  const { showModalMessage: showMessage, modalMessage, handleModalMessage } = useModalMessage()

  const [flowIntent, setFlowIntent] = useState(true)
  const [flowStep, setFlowStep] = useState(-1)
  const [flowPrevious, setFlowPrevious] = useState(0)
  const [isStepCompleted, setStepCompleted] = useState(false)
  const [isChanged, setChanged] = useState(false)

  const [typeClassName, setTypeClassName] = useState(styles.flowUnset)
  const [personalClassName, setPersonalClassName] = useState(styles.flowUnset)
  const [addressClassName, setAddressClassName] = useState(styles.flowUnset)
  const [contactClassName, setContactClassName] = useState(styles.flowUnset)
  const [sellerClassName, setSellerClassName] = useState(styles.flowUnset)
  const [shopClassName, setShopClassName] = useState(styles.flowUnset)

  const [banks, setBanks] = useState<Bank[]>([])

  const formRef = useRef<FormHandles>(null)

  const router = useRouter()

  useEffect(() => {
    if (flowStep === -1) {
      setFlowStep(!!user && !!user.personalInfo ? 0 : -1)
    }

    // isTokenValid(token).then(valid => {
    // if (valid) {
    api.get(`auth/token/${token}`).then(response => {
      const { isValid } = response.data

      if (!isValid) {
        signOut()
        router.push('/')
        return
      }

    }).catch((error) => {
      signOut()
      router.push('/')
      return
    })

    // return
    // }
    // })
  }, [user, token])

  const userData = useMemo(() => {
    const userDTO = { ...user } as any
    if (!!userDTO.personalInfo && !!userDTO.personalInfo['cpf']) {
      var parts = !!userDTO.personalInfo.birthday ? userDTO.personalInfo.birthday.split("-") : []
      const dateRaw = !!userDTO.personalInfo.birthday ? new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)) : undefined

      return {
        ...userDTO,
        personalInfo: {
          ...userDTO.personalInfo,
          day: !!dateRaw ? dateRaw.getDate() : '',
          month: !!dateRaw ? dateRaw.getMonth() + 1 : '',
          year: !!dateRaw ? dateRaw.getFullYear() : '',
        }
      }
    }

    return { ...user }
  }, [user])

  useEffect(() => {
    setLoading(true)
    api.get('/account/detail').then(response => {
      updateUser({ ...user, ...response.data, userType: !!response.data.personalInfo['cpf'] ? 'f' : !!response.data.personalInfo['cnpj'] ? 'j' : '' })

      const userInfo = { ...response.data }

      if (!!userInfo.personalInfo['cpf']) {

        var parts = !!userInfo.personalInfo.birthday ? userInfo.personalInfo.birthday.split("-") : []
        const dateRaw = !!userInfo.personalInfo.birthday ? new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)) : undefined

        formRef.current?.setData({
          ...user, ...userInfo, personalInfo: {
            ...userInfo.personalInfo,
            day: !!dateRaw ? dateRaw.getDate() : '',
            month: !!dateRaw ? dateRaw.getMonth() + 1 : '',
            year: !!dateRaw ? dateRaw.getFullYear() : '',
          }
        } as ProfileFormData)

        console.log(`Loading false? ${isLoading}`)

        setLoading(false)

        return
      }

      formRef.current?.setData({ ...user, ...userInfo })

      setLoading(false)
    }).catch(err => {
      console.log(err)

      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!!user) {
      api.get('/bank/all').then(response => {
        setBanks(response.data.map((bank: any) => {
          return { code: bank.value, name: bank.name }
        }))
      }).catch(err => {
        console.log(err)
      })
    }
  }, [user])

  useEffect(() => {
    if (flowStep === TYPE_INDEX) {
      if (flowPrevious < flowStep) {
        setTypeClassName(styles.flowAppearFromRight)
        return
      }

      if (flowPrevious > flowStep) {
        setTypeClassName(styles.flowAppearFromLeft)
        return
      }

      setTypeClassName(styles.flow)
      return
    }

    setTypeClassName(styles.flowUnset)
  }, [TYPE_INDEX, flowStep, flowPrevious])

  useEffect(() => {
    if (flowStep === PERSONAL_INDEX) {
      if (flowPrevious < flowStep) {
        setPersonalClassName(styles.flowAppearFromRight)
        return
      }

      if (flowPrevious > flowStep) {
        setPersonalClassName(styles.flowAppearFromLeft)
        return
      }

      setPersonalClassName(styles.flow)
      return
    }

    setPersonalClassName(styles.flowUnset)
  }, [PERSONAL_INDEX, flowStep, flowPrevious])

  useEffect(() => {
    if (flowStep === ADDRESS_INDEX) {
      if (flowPrevious < flowStep) {
        setAddressClassName(styles.flowAppearFromRight)
        return
      }

      if (flowPrevious > flowStep) {
        setAddressClassName(styles.flowAppearFromLeft)
        return
      }

      setAddressClassName(styles.flow)
      return
    }

    setAddressClassName(styles.flowUnset)
  }, [ADDRESS_INDEX, flowStep, flowPrevious])

  useEffect(() => {
    if (flowStep === CONTACT_INDEX) {
      if (flowPrevious < flowStep) {
        setContactClassName(styles.flowAppearFromRight)
        return
      }

      if (flowPrevious > flowStep) {
        setContactClassName(styles.flowAppearFromLeft)
        return
      }

      setContactClassName(styles.flow)
      return
    }

    setContactClassName(styles.flowUnset)
  }, [CONTACT_INDEX, flowStep, flowPrevious])

  useEffect(() => {
    if (flowStep === SELLER_INDEX) {
      if (flowPrevious < flowStep) {
        setSellerClassName(styles.flowAppearFromRight)
        return
      }

      if (flowPrevious > flowStep) {
        setSellerClassName(styles.flowAppearFromLeft)
        return
      }

      setSellerClassName(styles.flow)
      return
    }

    setSellerClassName(styles.flowUnset)
  }, [SELLER_INDEX, flowStep, flowPrevious])

  useEffect(() => {
    if (flowStep === STORE_INDEX) {
      if (flowPrevious < flowStep) {
        setShopClassName(styles.flowAppearFromRight)
        return
      }

      if (flowPrevious > flowStep) {
        setShopClassName(styles.flowAppearFromLeft)
        return
      }

      setShopClassName(styles.flow)
      return
    }

    setShopClassName(styles.flowUnset)
  }, [STORE_INDEX, flowStep, flowPrevious])

  const yupValidationSchema = useMemo((): object => {

    switch (flowStep) {
      case PERSONAL_INDEX:
        if (!!user && user.userType === 'j')
          return {
            personalInfo: Yup.object().shape({
              name: Yup.string().required('Nome obrigatório'),
              razaoSocial: Yup.string().required('Razão Social obrigatório'),
              cnpj: Yup.string().required('CNPJ obrigatório').min(14, 'CNPJ deve ter 14 digitos'),
            })
          }

        return {
          personalInfo: Yup.object().shape({
            firstName: Yup.string().required('Nome obrigatório').min(2, 'Mínimo de 2 caracteres'),
            lastName: Yup.string().required('Sobrenome obrigatório').min(2, 'Mínimo de 2 caracteres'),
            cpf: Yup.string().required('CPF obrigatório').min(11, 'O CPF deve ter 11 digitos'),
            // birthday: Yup.date(),
            year: Yup.number().min(1900, 'O ano mínimo aceito é 1900').max(2021, 'O ano não pode ser maior que o ano atual').required('').typeError(''),
            month: Yup.number().min(1, 'Mês validos vão de 1-12').max(12, 'Mês validos vão de 1-12').required('').typeError(''),
            day: Yup.number().min(1, 'Dia válidos vão de 1-31').max(31, 'Dia válidos vão de 1-31').required('Data de nascimento obrigatória').typeError(''),
          })

          //phone: Yup.string().required('Celular obrigatório').min(11, 'O telefone/celular deve ter os 11 digitos'),
        }
      case ADDRESS_INDEX:
        return {
          address: Yup.object().shape({
            cep: Yup.string().required('CEP deve ser preenchido').min(7, 'CEP deve ter pelo menos 7 digitos').max(9, 'CEP não pode passar de 9 digitos'),
            address: Yup.string().required('Endereço deve ser preenchido').min(2, 'Mínimo de 2 caracteres'),
            number: Yup.string().required('Número obrigaório'), //.typeError('Número obrigatório')
            complement: Yup.string(),
            district: Yup.string().required('Bairro obrigaório').min(2, 'Mínimo de 2 caracteres'),
            city: Yup.string().required('Cidade obrigaória').min(2, 'Mínimo de 2 caracteres'),
          })
        }
      case CONTACT_INDEX:
        if (!!user.personalInfo && user.userType === 'f')
          return {
            contact: Yup.object().shape({
              phone: Yup.string().min(12, 'O telefone/celular deve ter pelo menos 10 digitos').required('O telefone/celular deve ser preenchido'),
            })
          }

        return {
          contact: Yup.object().shape({
            phone: Yup.string().min(10, 'O telefone/celular deve ter pelo menos 10 digitos').required('O telefone/celular deve ser preenchido'),
            url: Yup.string().url('A URL deve seguir o padrão: http://<url>.<domínio(s)> ou https://<url>.<domínio(s)>'),
          })
        }
      case SELLER_INDEX:
        return {
          bankInfo: Yup.object().shape({
            bank: Yup.string().min(3, 'O banco deve ter pelo menos 3 digitos').required(''),
            name: Yup.string().required('Banco obrigatório'),
            account: Yup.string().min(2, 'A conta deve ter pelo menos 2 caracteres').required('Conta obrigatório'),
            agency: Yup.string().min(4, 'A agência deve ter pelo menos 4 digitos').required('Agência obrigatório'),
            pix: Yup.string(),
          })
        }
      case STORE_INDEX:
        return {
          shopInfo: Yup.object().shape({
            name: Yup.string().required('Nome obrigatório').min(2, 'Mínimo de 2 caracteres'),
          })
        }
    }

    return {}
  }, [flowStep, user])

  useEffect(() => {
    if (isStepCompleted) {
      setChanged(false)

      setFlowPrevious(flowStep >= 0 ? flowStep : 0)

      if (flowIntent === true && flowStep + 1 <= STORE_INDEX) {
        setFlowStep(flowStep + 1)
      }

      if (flowIntent === false && flowStep > PERSONAL_INDEX) {
        setFlowStep(flowStep - 1)
      }

      if (flowIntent === true && flowStep === STORE_INDEX) {
        router.push('/dashboard')
      }
    }
  }, [isStepCompleted, flowIntent])

  const handlePersonType = useCallback((personType: string) => {
    if (personType === 'j') {
      updateUser({
        ...user,
        userType: 'j'
      })
    } else {
      updateUser({
        ...user,
        userType: 'f'
      })
    }

    setFlowStep(flowStep + 1)

    return
  }, [flowStep])

  const handleSubmit = useCallback(
    async (data: ProfileFormData) => {
      setStepCompleted(false)
      setLoading(true)

      if (!!data.contact.phone)
        data.contact.phone = data.contact.phone.replaceAll('_', '')

      data.bankInfo.agency = data.bankInfo.agency.replaceAll('_', '').replace('-', '')
      data.bankInfo.account = data.bankInfo.account.replaceAll('_', '').replace('-', '')

      if (user.userType !== 'f') {
        data.personalInfo = data.personalInfo as CompanyInfo

        data.personalInfo.cnpj = data.personalInfo.cnpj.replaceAll('_', '').replaceAll('.', '').replace('/', '').replace('-', '')

      } else {
        data.personalInfo = data.personalInfo as PersonalInfoDTO

        data.personalInfo.cpf = data.personalInfo.cpf.replaceAll('_', '').replaceAll('.', '').replace('-', '')
      }

      try {
        formRef.current?.setErrors({})
        // setStepCompleted(false)

        const schema = Yup.object().shape({ ...yupValidationSchema })

        await schema.validate(data, { abortEarly: false })

        if (!isChanged) {
          setStepCompleted(true)
          setLoading(false)

          return
        }

        switch (flowStep) {
          case PERSONAL_INDEX:
            var personalInfo

            if (user.userType === 'f') {
              const {
                firstName,
                lastName,
                cpf,
                day,
                month,
                year,
              } = data.personalInfo as PersonalInfoDTO

              personalInfo = {
                isPF: true,
                firstName,
                lastName,
                cpf,
                birthday: format(new Date(year, (month - 1), day), 'dd-MM-yyyy')
                // birthday: !!birthday ? format(new Date(birthday), 'dd-MM-yyyy') : null,
              } as PersonInfo

              await api.post('/account/personalInfo', personalInfo).then(response => {

                const updatedUser = { ...user, personalInfo: { ...response.data } }

                updateUser(updatedUser)

                setStepCompleted(true)
              }).catch(err => {

                setStepCompleted(false)

                err.response.data.errors.forEach((error: AppError) => {
                  const apiError = findError(error.errorCode)
                  const errorField = getErrorField(error.errorCode)

                  if (!!errorField) {

                    if (errorField.errorField === 'personalInfo.birthday') {
                      formRef.current?.setFieldError('personalInfo.day', 'Informe uma data de nascimento válida')
                      formRef.current?.setFieldError('personalInfo.month', ' ')
                      formRef.current?.setFieldError('personalInfo.year', ' ')
                      return
                    }

                    formRef.current?.setFieldError(errorField.errorField, !!apiError.example ? apiError.example.join('\n') : 'Erro indefinido')
                    handleModalMessage(true, { title: !!apiError.description ? apiError.description : 'Erro', message: !!apiError.example ? apiError.example : ['Erro indefinido'], type: 'error' })
                  } else {
                    handleModalMessage(true, { title: 'Erro', message: ['Ocorreu um erro inesperado'], type: 'error' })
                  }

                })

              })

            } else {
              const {
                name,
                razaoSocial,
                cnpj, } = data.personalInfo as CompanyInfo

              personalInfo = {
                isPJ: true,
                name,
                razaoSocial,
                cnpj: cnpjValidator.format(cnpj),
              }

              await api.post('/account/personalInfo', personalInfo).then(response => {
                const updatedUser = { ...user, personalInfo: { ...response.data } }

                updateUser(updatedUser)
                setStepCompleted(true)
              }).catch(err => {
                console.log(err.response.data)

                setStepCompleted(false)

                err.response.data.errors.forEach((error: AppError) => {
                  const apiError = findError(error.errorCode)
                  const errorField = getErrorField(error.errorCode)

                  if (!!errorField) {
                    formRef.current?.setFieldError(errorField.errorField, !!apiError.example ? apiError.example.join('\n') : 'Erro indefinido')
                    handleModalMessage(true, { title: !!apiError.description ? apiError.description : 'Erro', message: !!apiError.example ? apiError.example : ['Erro indefinido'], type: 'error' })
                  } else {
                    handleModalMessage(true, { title: 'Erro', message: ['Ocorreu um erro inesperado'], type: 'error' })
                  }

                })

              })
            }

            break
          case ADDRESS_INDEX:
            const {
              cep,
              address,
              city,
              complement,
              district,
              number,
            } = data.address

            // var cepFormatted = cep.replaceAll("-", "")
            // cepFormatted = cepFormatted.slice(0, 5) + "-" + cepFormatted.slice(5, cep.length)

            if (!!complement) {
              if (complement.length < 4) {
                setStepCompleted(false)
                setLoading(false)
                formRef?.current?.setFieldError('address.complement', 'Mínimo de 4 caracteres')
                return
              }
            }

            const addressInfo = {
              cep,
              address,
              city,
              complement,
              district,
              number
            }

            await api.post('/account/address', addressInfo).then(response => {
              updateUser({ ...user, address: { ...response.data } })
              setStepCompleted(true)
            }).catch(err => {
              console.log(err.response.data)

              setStepCompleted(false)

              err.response.data.errors.forEach((error: AppError) => {
                const apiError = findError(error.errorCode)
                const errorField = getErrorField(error.errorCode)

                console.log(apiError)

                if (!!errorField) {
                  formRef.current?.setFieldError(errorField.errorField, !!errorField.errorBrief ? errorField.errorBrief : !!apiError.example ? apiError.example.join('\n') : 'Erro indefinido')
                  handleModalMessage(true, { title: !!apiError.description ? apiError.description : 'Erro', message: !!apiError.example ? apiError.example : ['Erro indefinido'], type: 'error' })
                } else {
                  handleModalMessage(true, { title: 'Erro', message: ['Ocorreu um erro inesperado'], type: 'error' })
                }

              })

            })

            break
          case CONTACT_INDEX:
            const {
              phone,
              url,
            } = data.contact

            const contact = {
              phone,
              url
            }

            await api.post('/account/contact', contact).then(response => {
              updateUser({ ...user, contact: { ...response.data } })
              setStepCompleted(true)
            }).catch(err => {
              console.log(err.response.data)

              setStepCompleted(false)

              err.response.data.errors.forEach((error: AppError) => {
                const apiError = findError(error.errorCode)
                const errorField = getErrorField(error.errorCode)

                console.log(apiError)

                if (!!errorField) {
                  formRef.current?.setFieldError(errorField.errorField, !!errorField.errorBrief ? errorField.errorBrief : !!apiError.example ? apiError.example.join('\n') : 'Erro indefinido')
                  handleModalMessage(true, { title: !!apiError.description ? apiError.description : 'Erro', message: !!apiError.example ? apiError.example : ['Erro indefinido'], type: 'error' })
                } else {
                  handleModalMessage(true, { title: 'Erro', message: ['Ocorreu um erro inesperado'], type: 'error' })
                }

              })

            })

            break
          case SELLER_INDEX:
            const {
              bank,
              name: bankName,
              account,
              agency,
              pix,
            } = data.bankInfo

            const bankInfo = {
              bank,
              name: bankName,
              account,
              agency,
              pix
            }

            await api.post('/account/bankInfo', bankInfo).then(response => {
              updateUser({ ...user, bankInfo: { ...response.data } })
              setStepCompleted(true)
            }).catch(err => {
              console.log(err.response.data)

              setStepCompleted(false)

              err.response.data.errors.forEach((error: AppError) => {
                const apiError = findError(error.errorCode)
                const errorField = getErrorField(error.errorCode)

                console.log(apiError)

                if (!!errorField) {
                  formRef.current?.setFieldError(errorField.errorField, !!errorField.errorBrief ? errorField.errorBrief : !!apiError.example ? apiError.example.join('\n') : 'Erro indefinido')
                  handleModalMessage(true, { title: !!apiError.description ? apiError.description : 'Erro', message: !!apiError.example ? apiError.example : ['Erro indefinido'], type: 'error' })
                } else {
                  handleModalMessage(true, { title: 'Erro', message: ['Ocorreu um erro inesperado'], type: 'error' })
                }

              })

            })

            break
          case STORE_INDEX:
            const storeName = data.shopInfo.name

            const shopInfo = { name: storeName }

            await api.post('/account/shopInfo', shopInfo).then(response => {
              updateUser({ ...user, shopInfo: { ...response.data } })
              setStepCompleted(true)
            }).catch(err => {
              console.log(err.response.data)

              setStepCompleted(false)

              err.response.data.errors.forEach((error: AppError) => {
                const apiError = findError(error.errorCode)
                const errorField = getErrorField(error.errorCode)

                console.log(apiError)

                if (!!errorField) {
                  formRef.current?.setFieldError(errorField.errorField, !!errorField.errorBrief ? errorField.errorBrief : !!apiError.example ? apiError.example.join('\n') : 'Erro indefinido')
                  handleModalMessage(true, { title: !!apiError.description ? apiError.description : 'Erro', message: !!apiError.example ? apiError.example : ['Erro indefinido'], type: 'error' })
                } else {
                  handleModalMessage(true, { title: 'Erro', message: ['Ocorreu um erro inesperado'], type: 'error' })
                }

              })

            })

            // updateUser({ ...user, shopInfo: { ...shopInfo } })

            break
        }

        setLoading(false)
      } catch (err) {

        setStepCompleted(false)
        setLoading(false)

        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err)

          formRef.current?.setErrors(errors)

          return
        }
      }
    },
    [isChanged, flowIntent],
  )

  const handleAvatarChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const data = new FormData()

        data.append('avatar', e.target.files[0])

        // api.patch('/users/avatar', data).then(response => {
        //   updateUser(response.data)

        //   // addToast({
        //   //   type: 'success',
        //   //   title: 'Avatar atualizado!',
        //   // })
        // })
      }
    },
    [updateUser],
  )

  const handleSetBankCode = useCallback((bank: string) => {
    if (!!bank) {
      setChanged(true)
      const index = banks.findIndex(b => bank === b.name)
      formRef.current?.setFieldValue('bankInfo.bank', banks[index].code)
      return
    }

    formRef.current?.setFieldValue('bankInfo.bank', '')
  }, [banks])

  const handleSetBankName = useCallback((code: string) => {
    if (!!code) {
      setChanged(true)
      const index = banks.findIndex(b => code === b.code)
      formRef.current?.setFieldValue('bankInfo.name', banks[index].name)
      return
    }

    formRef.current?.setFieldValue('bankInfo.name', '')
  }, [banks])

  const handleReturn = useCallback(() => {
    setFlowIntent(false)
    formRef.current?.submitForm()
  }, [])

  const handleAdvance = useCallback(() => {
    setFlowIntent(true)
    formRef.current?.submitForm()
  }, [])

  const handleModalVisibility = useCallback(() => {
    handleModalMessage(false)
  }, [])

  // useEffect(() => {
  //   formRef.current?.setData({ ...user })
  // }, [formRef, user])

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileContent}>
        <Form
          ref={formRef}
          initialData={{
            ...userData
          }}
          onSubmit={handleSubmit}
        >
          <div className={styles.controllerContainer}>
            <div className={styles.formsContainer}>
              <div
                className={typeClassName}
              >
                <div className={styles.typeButtonsContainer} style={{ height: '100%' }}>
                  <h3>Tipo de cadastro</h3>

                  <div className={styles.buttons}>
                    <UserTypeButton
                      title='Pessoa Física'
                      subtitle='Seu usuário será registrado como uma pessoa física'
                      icon={FaUserTie}
                      onClick={(e) => {
                        handlePersonType('f')
                      }}
                    />

                    <UserTypeButton
                      title='Pessoa Jurídica'
                      subtitle='Seu usuário será registrado como uma pessoa jurídica'
                      icon={FaStore}
                      onClick={(e) => {
                        handlePersonType('j')
                      }}
                    />
                  </div>
                </div>
              </div>
              <div
                className={personalClassName}
              >
                {
                  !!user && user.userType === 'f' ? (
                    <>
                      <h3>Seus dados pessoais</h3>

                      <Scope path={'personalInfo'}>

                        <Input
                          name='firstName'
                          placeholder='Nome'
                          autoComplete='off'
                          onChange={() => {
                            setChanged(true)
                          }}
                        />

                        <Input
                          name='lastName'
                          placeholder='Sobrenome'
                          autoComplete='off'
                          onChange={() => {
                            setChanged(true)
                          }}
                        />

                        {/* <Input
                          name='birthday'
                          placeholder='Date de Nascimento'
                          autoComplete='off'
                          isDatePicker
                          onChange={() => {
                            setChanged(true)
                          }}
                          showYearDropdown={true}
                          yearDropdownItemNumber={15}
                          scrollableYearDropdown={true}
                        // defaultValue={!!user?.personalInfo && !!user?.personalInfo.birthday ? user.personalInfo.birthday : ''}
                        /> */}

                        <div className={styles.dateField}>
                          <Input
                            name='day'
                            placeholder='Dia de nascimento'
                            autoComplete='off'
                            onChange={() => {
                              setChanged(true)
                            }}
                          // type='numeric'
                          // maxLength={2}
                          />

                          <Input
                            name='month'
                            placeholder='Mês de nascimento'
                            autoComplete='off'
                            onChange={() => {
                              setChanged(true)
                            }}
                            type='numeric'
                            maxLength={2}
                          />

                          <Input
                            name='year'
                            placeholder='Ano de nascimento'
                            autoComplete='off'
                            onChange={() => {
                              setChanged(true)
                            }}
                            type='numeric'
                            minLength={4}
                            maxLength={4}
                          />
                        </div>

                      </Scope>

                      <Scope path={'personalInfo'}>
                        {/* <Input
                          name='cpf'
                          placeholder='CPF'
                          autoComplete='off'
                          // isMasked
                          // mask={'999.999.999-99'}
                          onChange={() => {
                            setChanged(true)
                          }}
                          maxLength={11}
                        // value={!!user?.cpf ? user.cpf : ''}
                        /> */}
                        <MaskedInput
                          name='cpf'
                          placeholder='CPF'
                          mask='999.999.999-99'
                          // maskChar="_"
                          autoComplete='off'
                          onChange={() => {
                            setChanged(true)
                          }}
                        />
                      </Scope>
                    </>
                  ) : (
                    <>
                      <h3>Seus dados empresariais</h3>

                      <Scope path={'personalInfo'}>
                        <Input
                          name='name'
                          placeholder='Nome'
                          autoComplete='off'
                          onChange={() => {
                            setChanged(true)
                          }}
                        />

                        <Input
                          name='razaoSocial'
                          placeholder='Razão social'
                          autoComplete='off'
                          onChange={() => {
                            setChanged(true)
                          }}
                        />

                        <MaskedInput
                          name='cnpj'
                          placeholder='CNPJ'
                          autoComplete='off'
                          // isMasked
                          mask={'99.999.999/9999-99'}
                          onChange={() => {
                            setChanged(true)
                          }}
                        // maxLength={14}
                        // value={!!user?.cpf ? user.cpf : ''}
                        />
                      </Scope>
                    </>
                  )
                }
              </div>

              <div className={contactClassName}>
                <h3>Seus dados de contato</h3>

                <Input
                  name='email'
                  placeholder='E-mail'
                  autoComplete='off'
                  disabled
                />

                <Scope path={'contact'}>
                  <MaskedInput
                    name='phone'
                    placeholder='Telefone/celular'
                    autoComplete='off'
                    mask={'99 99999-9999'}
                    onChange={() => {
                      setChanged(true)
                    }}
                  // maxLength={11}
                  />

                  {!!user && user.userType === 'j' &&
                    <Input
                      name='url'
                      placeholder='URL Site'
                      autoComplete='off'
                    />
                  }
                </Scope>

              </div>

              <Scope path={'address'}>
                <div className={addressClassName}>
                  <h3>Seu endereço</h3>

                  <MaskedInput
                    name='cep'
                    placeholder='CEP'
                    autoComplete='off'
                    mask='99999-999'
                    onChange={() => {
                      setChanged(true)
                    }}
                  />

                  <Input
                    name='address'
                    placeholder='Endereço'
                    autoComplete='off'
                    onChange={() => {
                      setChanged(true)
                    }}
                  />

                  <div className={styles.doubleField}>
                    <Input
                      name='number'
                      placeholder='Número'
                      autoComplete='off'
                      type='number'
                      min={0}
                      onChange={() => {
                        setChanged(true)
                      }}
                    />

                    <Input
                      name='complement'
                      placeholder='Complemento'
                      autoComplete='off'
                      onChange={() => {
                        setChanged(true)
                      }}
                      maxLength={24}
                    />
                  </div>

                  <Input
                    name='district'
                    placeholder='Bairro'
                    autoComplete='off'
                    onChange={() => {
                      setChanged(true)
                    }}
                  />

                  <Input
                    name='city'
                    placeholder='Cidade'
                    autoComplete='off'
                    onChange={() => {
                      setChanged(true)
                    }}
                  />
                </div>
              </Scope>

              <Scope path={'bankInfo'}>
                <div className={sellerClassName}>
                  <h3>Seus dados de bancários</h3>

                  <div className={styles.doubleField}>
                    <Autocomplete
                      name='name'
                      placeholder='Banco'
                      items={banks.map(bank => bank.name)}
                      setSelectedItem={handleSetBankCode}
                      autoComplete='off'
                      autoCorrect='off'
                    />

                    <Autocomplete
                      name='bank'
                      placeholder='Código'
                      items={banks.map(bank => bank.code)}
                      setSelectedItem={handleSetBankName}
                      autoComplete='off'
                      type='number'
                    />
                  </div>

                  <MaskedInput
                    name='agency'
                    placeholder='Agencia'
                    autoComplete='off'
                    // isMasked
                    mask={'9999-9'}
                    maskChar={'0'}
                    alwaysShowMask
                    onChange={(e) => {
                      setChanged(true)
                      // setAgencyMask(e.target.value.length <= 4 ? '999-9' : '9999-9')
                    }}
                  // type={'number'}
                  // maxLength={5}
                  />

                  <MaskedInput
                    name='account'
                    placeholder='Conta'
                    autoComplete='off'
                    // isMasked
                    mask={'99999999-9'}
                    onChange={(e) => {
                      setChanged(true)
                    }}
                  // type={'number'}
                  // maxLength={10}
                  />

                  <Input
                    name='pix'
                    placeholder='PIX'
                    autoComplete='off'
                    // isMasked
                    // mask={'9999-9'}
                    onChange={() => {
                      setChanged(true)
                    }}
                    // type={'number'}
                    maxLength={30}
                  />

                  {/* <Input
                name='commission'
                placeholder='Taxa de Comissão'
                isMasked
                mask={'99'}
              />

              <Input
                name='role'
                placeholder='Categoria'
                autoComplete='off'
              /> */}

                </div>
              </Scope>

              <Scope path='shopInfo'>
                <div className={shopClassName}>
                  <h3>Os dados da sua loja</h3>

                  <Input
                    name='name'
                    placeholder='Nome'
                    autoComplete='off'
                    onChange={() => {
                      setChanged(true)
                    }}
                  />

                  {/* <Input
                  name='address'
                  placeholder='Endereço'
                  autoComplete='off'
                  />

                  <div className={styles.doubleField}>
                    <Input
                      name='number'
                      placeholder='Número'
                      autoComplete='off'
                      min={0}
                    />

                    <Input
                      name='complement'
                      placeholder='Complemento'
                      autoComplete='off'
                    />
                  </div>

                  <Input
                    name='block'
                    placeholder='Bairro'
                    autoComplete='off'
                  />

                  <Input
                    name='city'
                    placeholder='Cidade'
                    autoComplete='off'
                  /> */}
                </div>
              </Scope>
            </div>
          </div>
          {
            flowStep >= 0 && (
              <div className={styles.buttonsContainer}>
                <Button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault()

                    handleReturn()

                    // handleFlowStep()
                  }}
                  customStyle={{ className: styles.backButton }}
                  disabled={(flowStep === PERSONAL_INDEX || flowStep === -1)}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  customStyle={{ className: styles.nextButton }}
                  onClick={(e) => {
                    e.preventDefault()

                    handleAdvance()

                    // handleFlowStep()
                  }}
                >
                  {(flowStep !== STORE_INDEX) ? 'Avançar' : 'Confirmar'}
                </Button>
              </div>
            )
          }
        </Form>

        {/* <div className={styles.indicatorContainer}>
          <div className={styles.indicator} style={(flowStep === 0 || flowStep === -1) ? { width: '0.75rem', height: '0.75rem', opacity: 1 } : {}} />
          <div className={styles.indicator} style={(flowStep === 1) ? { width: '0.75rem', height: '0.75rem', opacity: 1 } : {}} />
          <div className={styles.indicator} style={(flowStep === 2) ? { width: '0.75rem', height: '0.75rem', opacity: 1 } : {}} />
          <div className={styles.indicator} style={(flowStep === 3) ? { width: '0.75rem', height: '0.75rem', opacity: 1 } : {}} />
        </div> */}
      </div>
      {
        isLoading && (
          <div className={styles.loadingContainer}>
            <Loader />
          </div>
        )
      }
      {
        showMessage && (
          <MessageModal handleVisibility={handleModalVisibility}>
            <div className={styles.modalContent}>
              {modalMessage.type === 'success' ? <FiCheck style={{ color: 'var(--green-100)' }} /> : <FiX style={{ color: 'var(--red-100)' }} />}
              <p>{modalMessage.title}</p>
              {modalMessage.message.map((msg, i) => <span key={i}>{msg}</span>)}
              {/* <p>{modalMessage.message}</p> */}
            </div>
          </MessageModal>
        )
      }
    </div >
  )
}

export default Profile
