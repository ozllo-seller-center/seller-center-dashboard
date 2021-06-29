import React, { useCallback, useRef, ChangeEvent, useState, useMemo } from 'react';

import { FormHandles, Scope } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { cnpj as cnpjValidator, cpf } from 'cpf-cnpj-validator';
import { InactiveUserError } from 'src/shared/errors/InactiveUserError';

import { useAuth } from '../../hooks/auth';

import api from '../../services/api';

import getValidationErrors from '../../utils/getValidationErrors';

import styles from './styles.module.scss';

import Input from '../../components/InputLabeless';
import Button from '../../components/PrimaryButton';
import AvatarInput from '../../components/AvatarInput';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLoading } from 'src/hooks/loading';
import { Loader } from 'src/components/Loader';
import Autocomplete from 'src/components/Autocomplete';
import { banks } from 'src/shared/consts/banks';
import { CompanyInfo, PersonInfo } from 'src/shared/types/personalInfo';
import UserTypeButton from 'src/components/UserTypeButton';
import { FaUserTie, FaStore } from 'react-icons/fa';
import { useModalMessage } from 'src/hooks/message';
import { AppError, findError, getErrorField } from 'src/shared/errors/api/errors';
import MessageModal from 'src/components/MessageModal';
import { FiCheck, FiX } from 'react-icons/fi';

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

const TYPE_INDEX = -1;
const PERSONAL_INDEX = 0;
const ADDRESS_INDEX = 1;
const CONTACT_INDEX = 2;
const SELLER_INDEX = 3;
const STORE_INDEX = 4;

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { isLoading, setLoading } = useLoading();

  const { showModalMessage: showMessage, modalMessage, handleModalMessage } = useModalMessage();

  const [flowIntent, setFlowIntent] = useState(true);
  const [flowStep, setFlowStep] = useState(-1);
  const [flowPrevious, setFlowPrevious] = useState(0);
  const [isStepCompleted, setStepCompleted] = useState(false);
  const [isChanged, setChanged] = useState(false);

  const [typeClassName, setTypeClassName] = useState(styles.flowUnset);
  const [personalClassName, setPersonalClassName] = useState(styles.flowUnset);
  const [addressClassName, setAddressClassName] = useState(styles.flowUnset);
  const [contactClassName, setContactClassName] = useState(styles.flowUnset);
  const [sellerClassName, setSellerClassName] = useState(styles.flowUnset);
  const [shopClassName, setShopClassName] = useState(styles.flowUnset);


  const formRef = useRef<FormHandles>(null);

  const router = useRouter();

  useEffect(() => {
    if (flowStep === -1) {
      setFlowStep(!!user && !!user.personalInfo ? 0 : -1);
    }
  }, [user])

  useEffect(() => {
    setLoading(true);
    api.get('/account/detail').then(response => {
      updateUser({ ...user, ...response.data, userType: !!response.data.personalInfo['cpf'] ? 'f' : !!response.data.personalInfo['cnpj'] ? 'j' : '' })

      if (user.userType === 'f') {
        var parts = !!response.data.personalInfo.birthday ? response.data.personalInfo.birthday.split("-") : [];
        const dateRaw = !!response.data.personalInfo.birthday ? new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)) : undefined;

        formRef.current?.setData({
          ...user, ...response.data, personalInfo: {
            ...response.data.personalInfo,
            day: !!dateRaw ? dateRaw.getDate() : '',
            month: !!dateRaw ? dateRaw.getMonth() + 1 : '',
            year: !!dateRaw ? dateRaw.getFullYear() : '',
          }
        } as ProfileFormData);

        setLoading(false);

        return;
      }

      formRef.current?.setData({ ...user, ...response.data });

      setLoading(false);
    }).catch(err => {
      console.log(err)

      setLoading(false);
    });
  }, [])

  useEffect(() => {
    if (flowStep === TYPE_INDEX) {
      if (flowPrevious < flowStep) {
        setTypeClassName(styles.flowAppearFromRight)
        return;
      }

      if (flowPrevious > flowStep) {
        setTypeClassName(styles.flowAppearFromLeft)
        return;
      }

      setTypeClassName(styles.flow)
      return;
    }

    setTypeClassName(styles.flowUnset)
  }, [TYPE_INDEX, flowStep, flowPrevious])

  useEffect(() => {
    if (flowStep === PERSONAL_INDEX) {
      if (flowPrevious < flowStep) {
        setPersonalClassName(styles.flowAppearFromRight)
        return;
      }

      if (flowPrevious > flowStep) {
        setPersonalClassName(styles.flowAppearFromLeft)
        return;
      }

      setPersonalClassName(styles.flow)
      return;
    }

    setPersonalClassName(styles.flowUnset)
  }, [PERSONAL_INDEX, flowStep, flowPrevious])

  useEffect(() => {
    if (flowStep === ADDRESS_INDEX) {
      if (flowPrevious < flowStep) {
        setAddressClassName(styles.flowAppearFromRight)
        return;
      }

      if (flowPrevious > flowStep) {
        setAddressClassName(styles.flowAppearFromLeft)
        return;
      }

      setAddressClassName(styles.flow)
      return;
    }

    setAddressClassName(styles.flowUnset)
  }, [ADDRESS_INDEX, flowStep, flowPrevious])

  useEffect(() => {
    if (flowStep === CONTACT_INDEX) {
      if (flowPrevious < flowStep) {
        setContactClassName(styles.flowAppearFromRight)
        return;
      }

      if (flowPrevious > flowStep) {
        setContactClassName(styles.flowAppearFromLeft)
        return;
      }

      setContactClassName(styles.flow)
      return;
    }

    setContactClassName(styles.flowUnset)
  }, [CONTACT_INDEX, flowStep, flowPrevious])

  useEffect(() => {
    if (flowStep === SELLER_INDEX) {
      if (flowPrevious < flowStep) {
        setSellerClassName(styles.flowAppearFromRight)
        return;
      }

      if (flowPrevious > flowStep) {
        setSellerClassName(styles.flowAppearFromLeft)
        return;
      }

      setSellerClassName(styles.flow)
      return;
    }

    setSellerClassName(styles.flowUnset)
  }, [SELLER_INDEX, flowStep, flowPrevious])

  useEffect(() => {
    if (flowStep === STORE_INDEX) {
      if (flowPrevious < flowStep) {
        setShopClassName(styles.flowAppearFromRight)
        return;
      }

      if (flowPrevious > flowStep) {
        setShopClassName(styles.flowAppearFromLeft)
        return;
      }

      setShopClassName(styles.flow)
      return;
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
              cnpj: Yup.string().required('CNPJ obrigatório').min(14, 'O CNPJ deve ter 14 digitos'),
              inscricaoMunicipal: Yup.string(),
              inscricaoEstadual: Yup.string(),
            })
          }

        return {
          personalInfo: Yup.object().shape({
            firstName: Yup.string().required('Nome obrigatório'),
            lastName: Yup.string().required('Sobrenome obrigatório'),
            cpf: Yup.string().required('CPF obrigatório').min(11, 'O CPF deve ter 11 digitos'),
            // birthday: Yup.date(),
            year: Yup.number().min(1900, '').max(2021, 'O ano não pode ser maior que o ano atual').required('').typeError(''),
            month: Yup.number().min(1, '1-12').max(12, '1-12').required('').typeError(''),
            day: Yup.number().min(1, '1-31').max(31, '31').required('Data de nascimento obrigatória').typeError(''),
          })

          //phone: Yup.string().required('Celular obrigatório').min(11, 'O telefone/celular deve ter os 11 digitos'),
        }
      case ADDRESS_INDEX:
        return {
          address: Yup.object().shape({
            cep: Yup.string().required('CEP deve ser preenchido').min(7, 'CEP deve ter pelo menos 7 digitos'),
            address: Yup.string().required('Endereço deve ser preenchido'),
            number: Yup.mixed()
              .when('address', {
                is: (val: string) => !!val.length,
                then: Yup.number().typeError('Número obrigatório').required('Número obrigaório'),
                otherwise: Yup.string()
              }),
            complement: Yup.string(),
            district: Yup.string()
              .when('address', {
                is: (val: string) => !!val.length,
                then: Yup.string().required('Bairro obrigaório'),
                otherwise: Yup.string()
              }),
            city: Yup.string()
              .when('address', {
                is: (val: string) => !!val.length,
                then: Yup.string().required('Cidade obrigaória'),
                otherwise: Yup.string()
              }),
          })
        }
      case CONTACT_INDEX:
        if (!!user.personalInfo && user.userType === 'f')
          return {
            contact: Yup.object().shape({
              phone: Yup.string().min(10, 'O telefone/celular deve ter pelo menos 10 digitos').required('O telefone/celular deve ser preenchido'),
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
            account: Yup.string().min(6, 'A conta deve ter pelo menos 6 digitos').required('Conta obrigatório'),
            agency: Yup.string().min(5, 'A agência deve ter pelo menos 5 digitos').required('Agência obrigatório'),
            pix: Yup.string(),
          })
        }
      case STORE_INDEX:
        return {
          shopInfo: Yup.object().shape({
            name: Yup.string().required('Nome obrigatório'),
          })
        }
    }

    return {};
  }, [flowStep, user]);

  useEffect(() => {
    if (isStepCompleted) {
      setChanged(false);

      setFlowPrevious(flowStep >= 0 ? flowStep : 0);

      if (flowIntent === true && flowStep + 1 <= STORE_INDEX) {
        setFlowStep(flowStep + 1);
      }

      if (flowIntent === false && flowStep > PERSONAL_INDEX) {
        setFlowStep(flowStep - 1);
      }

      if (flowIntent === true && flowStep === STORE_INDEX) {
        router.push('/dashboard');
      }
    }
  }, [isStepCompleted, flowIntent])

  const handlePersonType = useCallback((personType: string) => {
    if (personType === 'j') {
      updateUser({
        ...user,
        userType: 'j'
      });
    } else {
      updateUser({
        ...user,
        userType: 'f'
      });
    }

    setFlowStep(flowStep + 1);

    return;
  }, [flowStep])

  const handleSubmit = useCallback(
    async (data: ProfileFormData) => {
      setStepCompleted(false);
      setLoading(true);

      try {
        formRef.current?.setErrors({});
        // setStepCompleted(false);

        const schema = Yup.object().shape({ ...yupValidationSchema });
        await schema.validate(data, { abortEarly: false });

        if (!isChanged) {
          setStepCompleted(true);
          setLoading(false);

          return;
        }

        switch (flowStep) {
          case PERSONAL_INDEX:
            var personalInfo;

            if (user.userType === 'f') {
              const {
                firstName,
                lastName,
                cpf,
                day,
                month,
                year,
              } = data.personalInfo as PersonalInfoDTO;

              personalInfo = {
                isPF: true,
                firstName,
                lastName,
                cpf,
                rg: '11',
                birthday: format(new Date(year, (month - 1), day), 'dd-MM-yyyy')
                // birthday: !!birthday ? format(new Date(birthday), 'dd-MM-yyyy') : null,
              } as PersonInfo;

              await api.post('/account/personalInfo', personalInfo).then(response => {
                const updatedUser = { ...user, ...response.data, userType: !!response.data['isPF'] ? 'f' : 'j' };

                updateUser(updatedUser);
              }).catch(err => {
                console.log(err.response.data);

                setStepCompleted(false);
                setLoading(false);

                err.response.data.errors.forEach((error: AppError) => {
                  const apiError = findError(error.errorCode);
                  const errorField = getErrorField(error.errorCode);

                  console.log(apiError);

                  if (!!errorField) {

                    if (errorField.errorField === 'personalInfo.birthday') {
                      formRef.current?.setFieldError('personalInfo.day', 'Informe uma data de nascimento válida')
                      formRef.current?.setFieldError('personalInfo.month', ' ')
                      formRef.current?.setFieldError('personalInfo.year', ' ')
                      return;
                    }

                    formRef.current?.setFieldError(errorField.errorField, !!apiError.example ? apiError.example.join('\n') : 'Erro indefinido')
                  } else {
                    handleModalMessage(true, { title: 'Erro', message: 'Ocorreu um erro inesperado', type: 'error' })
                  }

                });

              })

            } else {
              const {
                name,
                razaoSocial,
                cnpj,
                inscricaoEstadual,
                inscricaoMunicipal } = data.personalInfo as CompanyInfo;

              personalInfo = {
                isPJ: true,
                name,
                razaoSocial,
                cnpj: cnpjValidator.format(cnpj),
                inscricaoEstadual,
                inscricaoMunicipal
              };

              await api.post('/account/personalInfo', personalInfo).then(response => {
                const updatedUser = { ...user, ...response.data, userType: !!response.data['isPF'] ? 'f' : 'j' };

                updateUser(updatedUser);
                setStepCompleted(true);
              }).catch(err => {
                console.log(err.response.data);

                setStepCompleted(false);
                setLoading(false);

                err.response.data.errors.forEach((error: AppError) => {
                  const apiError = findError(error.errorCode);
                  const errorField = getErrorField(error.errorCode);

                  console.log(apiError);

                  if (!!errorField) {
                    formRef.current?.setFieldError(errorField.errorField, !!apiError.example ? apiError.example.join('\n') : 'Erro indefinido')
                  } else {
                    handleModalMessage(true, { title: 'Erro', message: 'Ocorreu um erro inesperado', type: 'error' })
                  }

                });

              })
            }

            break;
          case ADDRESS_INDEX:
            const {
              cep,
              address,
              city,
              complement,
              district,
              number,
            } = data.address;

            var cepFormatted = cep.replaceAll("-", "");
            cepFormatted = cepFormatted.slice(0, 5) + "-" + cepFormatted.slice(5, cep.length)

            const addressInfo = {
              cep: cepFormatted,
              address,
              city,
              complement,
              district,
              number
            };

            await api.post('/account/address', addressInfo).then(response => {
              updateUser({ ...user, address: { ...response.data } });
              setStepCompleted(true);
            }).catch(err => {
              console.log(err.response.data);

              setStepCompleted(false);
              setLoading(false);

              err.response.data.errors.forEach((error: AppError) => {
                const apiError = findError(error.errorCode);
                const errorField = getErrorField(error.errorCode);
                handleModalMessage(true, { title: 'Erro', message: '', type: 'error' })

                console.log(apiError);

                if (!!errorField) {
                  formRef.current?.setFieldError(errorField.errorField, !!apiError.example ? apiError.example.join('\n') : 'Erro indefinido')
                }

              });

            })

            break;
          case CONTACT_INDEX:
            const {
              phone,
              url,
            } = data.contact;

            const contact = {
              phone,
              url
            }

            await api.post('/account/contact', contact).then(response => {
              updateUser({ ...user, contact: { ...response.data } });
              setStepCompleted(true);
            }).catch(err => {
              console.log(err.response.data);

              setStepCompleted(false);
              setLoading(false);

              err.response.data.errors.forEach((error: AppError) => {
                const apiError = findError(error.errorCode);
                const errorField = getErrorField(error.errorCode);
                handleModalMessage(true, { title: 'Erro', message: '', type: 'error' })

                console.log(apiError);

                if (!!errorField) {
                  formRef.current?.setFieldError(errorField.errorField, !!apiError.example ? apiError.example.join('\n') : 'Erro indefinido')
                }

              });

            })

            break;
          case SELLER_INDEX:
            const {
              bank,
              name: bankName,
              account,
              agency,
              pix,
            } = data.bankInfo;

            const bankInfo = {
              bank,
              name: bankName,
              account,
              agency,
              pix
            };

            await api.post('/account/bankInfo', bankInfo).then(response => {
              updateUser({ ...user, address: { ...response.data } });
              setStepCompleted(true);
            }).catch(err => {
              console.log(err.response.data);

              setStepCompleted(false);
              setLoading(false);

              err.response.data.errors.forEach((error: AppError) => {
                const apiError = findError(error.errorCode);
                const errorField = getErrorField(error.errorCode);
                handleModalMessage(true, { title: 'Erro', message: '', type: 'error' })

                console.log(apiError);

                if (!!errorField) {
                  formRef.current?.setFieldError(errorField.errorField, !!apiError.example ? apiError.example.join('\n') : 'Erro indefinido')
                }

              });

            })

            updateUser({ ...user, ...bankInfo })

            break;
          case STORE_INDEX:
            const storeName = data.shopInfo.name;

            const shopInfo = { name: storeName };

            await api.post('/account/shopInfo', shopInfo).then(response => {
              updateUser({ ...user, shopInfo: { ...response.data } });
              setStepCompleted(true);
            }).catch(err => {
              console.log(err.response.data);

              setStepCompleted(false);
              setLoading(false);

              err.response.data.errors.forEach((error: AppError) => {
                const apiError = findError(error.errorCode);
                const errorField = getErrorField(error.errorCode);
                handleModalMessage(true, { title: 'Erro', message: '', type: 'error' })

                console.log(apiError);

                if (!!errorField) {
                  formRef.current?.setFieldError(errorField.errorField, !!apiError.example ? apiError.example.join('\n') : 'Erro indefinido')
                }

              });

            })

            // updateUser({ ...user, shopInfo: { ...shopInfo } });

            break;
        }

        setLoading(false);

        // handleFlowStep();

        // addToast({
        //   type: 'success',
        //   title: 'Perfil atualizado!',
        //   description:
        //     'Suas informações do perfil foram alteradas com sucesso!',
        // });
      } catch (err) {

        setStepCompleted(false);
        setLoading(false);

        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

          return;
        }

        // addToast({
        //   type: 'error',
        //   title: 'Erro na atualização',
        //   description:
        //     'Ocorreu um erro ao atualizar seu perfil, tente novamente.',
        // });
      }
    },
    [isChanged, isStepCompleted],
  );

  const handleAvatarChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const data = new FormData();

        data.append('avatar', e.target.files[0]);

        // api.patch('/users/avatar', data).then(response => {
        //   updateUser(response.data);

        //   // addToast({
        //   //   type: 'success',
        //   //   title: 'Avatar atualizado!',
        //   // });
        // });
      }
    },
    [updateUser],
  );

  const handleSetBankCode = useCallback((index: number) => {
    if (index >= 0) {
      formRef.current?.setFieldValue('bankInfo.bank', banks[index].code);
      return;
    }

    formRef.current?.setFieldValue('bankInfo.bank', '');
  }, []);

  const handleSetBankName = useCallback((index: number) => {
    if (index >= 0) {
      formRef.current?.setFieldValue('bankInfo.name', banks[index].name);
    }

    formRef.current?.setFieldValue('bankInfo.name', '');
  }, []);

  const handleReturn = useCallback(() => {
    setFlowIntent(false);
    formRef.current?.submitForm();
  }, [])

  const handleAdvance = useCallback(() => {
    setFlowIntent(true);
    formRef.current?.submitForm();
  }, [])

  const handleModalVisibility = useCallback(() => {
    handleModalMessage(false);
  }, [])

  // useEffect(() => {
  //   formRef.current?.setData({ ...user })
  // }, [formRef, user])

  useEffect(() => { }, [])

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileContent}>
        <Form
          ref={formRef}
          initialData={{
            ...user
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
                            placeholder='Dia'
                            autoComplete='off'
                            onChange={() => {
                              setChanged(true)
                            }}
                          // type='numeric'
                          // maxLength={2}
                          />

                          <Input
                            name='month'
                            placeholder='Mês'
                            autoComplete='off'
                            onChange={() => {
                              setChanged(true)
                            }}
                          // type='numeric'
                          // maxLength={2}
                          />

                          <Input
                            name='year'
                            placeholder='Ano'
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
                        <Input
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

                        <Input
                          name='cnpj'
                          placeholder='CNPJ'
                          autoComplete='off'
                          // isMasked
                          // mask={'999.999.999-99'}
                          onChange={() => {
                            setChanged(true)
                          }}
                          maxLength={14}
                        // value={!!user?.cpf ? user.cpf : ''}
                        />

                        <Input
                          name='inscricaoEstadual'
                          placeholder='Inscrição Estadual'
                          autoComplete='off'
                          // isMasked
                          // mask={'999.999.999-99'}
                          onChange={() => {
                            setChanged(true)
                          }}
                          maxLength={9}
                        // value={!!user?.cpf ? user.cpf : ''}
                        />

                        <Input
                          name='inscricaoMunicipal'
                          placeholder='Inscrição Municipal'
                          autoComplete='off'
                          // isMasked
                          // mask={'999.999.999-99'}
                          onChange={() => {
                            setChanged(true)
                          }}
                          maxLength={11}
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
                  <Input
                    name='phone'
                    placeholder='Telefone/celular'
                    autoComplete='off'
                    // isMasked
                    // mask={'99999-999'}
                    onChange={() => {
                      setChanged(true)
                    }}
                    // type={'numer'}
                    maxLength={11}
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

                  <Input
                    name='cep'
                    placeholder='CEP'
                    autoComplete='off'
                    // isMasked
                    // mask={'99999-999'}
                    onChange={() => {
                      setChanged(true)
                    }}
                    // type={'numer'}
                    maxLength={8}
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

                  <Input
                    name='account'
                    placeholder='Conta'
                    autoComplete='off'
                    // isMasked
                    // mask={'99999-9'}
                    onChange={() => {
                      setChanged(true)
                    }}
                    // type={'number'}
                    maxLength={10}
                  />

                  <Input
                    name='agency'
                    placeholder='Agencia'
                    autoComplete='off'
                    // isMasked
                    // mask={'9999-9'}
                    onChange={() => {
                      setChanged(true)
                    }}
                    // type={'number'}
                    maxLength={5}
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
                    e.preventDefault();

                    handleReturn()

                    // handleFlowStep();
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
                    e.preventDefault();

                    handleAdvance()

                    // handleFlowStep();
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
              <p>{modalMessage.message}</p>
            </div>
          </MessageModal>
        )
      }
    </div >
  );
};

export default Profile;
