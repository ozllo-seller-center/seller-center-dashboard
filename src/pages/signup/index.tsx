import React, {
  useCallback, useRef, useState, useMemo,
} from 'react';

import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { useRouter } from 'next/router';
import * as Yup from 'yup';
import Link from 'next/link';
import { FiCheck, FiChevronLeft, FiX } from 'react-icons/fi';
import { VscCircleFilled } from 'react-icons/vsc';

import Loader from 'src/components/Loader';
import { useLoading } from 'src/hooks/loading';
import { AppError } from 'src/shared/errors/api/errors';
import { useAuth } from '../../hooks/auth';

import api from '../../services/api';

import getValidationErrors from '../../utils/getValidationErrors';

import styles from './styles.module.scss';

import { isEmailValid, isPasswordSecure } from '../../utils/util';
import Input from '../../components/InputLabeless';
import Button from '../../components/PrimaryButton';
import MessageModal from '../../components/MessageModal';

type SignUpFormData = {
  name: string,
  email: string,
  password: string,
  password_confirmation: string,
}

const SignUp: React.FC = () => {
  const { isLoading, setLoading } = useLoading();

  const [isModalVisible, setModalVisibility] = useState(false);
  const [successfull, setSuccessfull] = useState(false);
  const [title, setTitle] = useState<string>();
  const [messages, setMessages] = useState<string[]>([]);
  const [userAvatar, setUserAvatar] = useState<string>();
  const [passwordCheck, setPasswordCheck] = useState('');

  const formRef = useRef<FormHandles>(null);

  const { user } = useAuth();

  const router = useRouter();

  const handleSubmit = useCallback(
    async (data: SignUpFormData) => {
      setLoading(true);
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          // name: Yup.string().required('Nome obrigatório'),
          email: Yup.string()
            .required('E-mail obrigatório')
            .email('Digite um e-mail válido')
            .test(
              'email-validation',
              'Informe um e-mail válido',
              (value) => (
                !!value && isEmailValid(value)
              ),
            ),
          password: Yup.string()
            .required('Senha obrigatória')
            .min(8, 'No mínimo 8 digitos')
            .test(
              'password-validation',
              'A senha não cumpre os critérios de segurança indicados abaixo',
              (value) => (
                !!value && isPasswordSecure(value)
              ),
            ),
          password_confirmation: Yup.string()
            .required('Confirme sua senha')
            .test(
              'password-validation',
              ' ',
              (value) => (
                !!value && isPasswordSecure(value)
              ),
            )
            .oneOf([Yup.ref('password')], 'A confirmação deve ser igual a senha'),
        });
        await schema.validate(data, { abortEarly: false });

        const {
          email,
          password,
        } = data;

        await api.post('/auth/create', { email, password });

        setModalVisibility(true);
        setSuccessfull(true);
        setLoading(false);
        setTitle('Cadastro realizado com sucesso!');
        setMessages(['Cheque seu e-mail para autenticar sua conta.', 'Caso a conta não seja autenticada em algumas horas, o cadastro será cancelado.']);
      } catch (err: any) {
        setLoading(false);

        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

          return;
        }

        // console.log(err.response.data)

        if (err.response.data.errors.findIndex((er: AppError) => er.errorCode === 4) >= 0) {
          setModalVisibility(true);
          setSuccessfull(false);
          setTitle('Usuário já existe');
          setMessages(['Tente realizar o login ou recuperar sua senha.']);
          return;
        }

        setModalVisibility(true);
        setSuccessfull(false);
        setTitle('Oops...');
        setMessages(['Ocorreu um erro durante o cadastro, tente novamente em alguns instantes.']);
        // addToast({
        //   type: 'error',
        //   title: 'Erro na atualização',
        //   description:
        //     'Ocorreu um erro ao atualizar seu perfil, tente novamente.',
        // });
      }
    },
    [setLoading],
  );

  const handleModalVisibility = useCallback(() => {
    setModalVisibility(false);

    if (successfull) { router.push('/'); }
  }, [router, successfull]);

  // TODO: Implementar avatar no cadastro e perfil do usuário no back-end
  // const handleAvatarChange = useCallback(
  //   (e: ChangeEvent<HTMLInputElement>) => {
  //     if (e.target.files) {
  //       const data = new FormData();

  //       data.append('avatar', e.target.files[0]);

  //       !!userAvatar && URL.revokeObjectURL(userAvatar);
  //       setUserAvatar(URL.createObjectURL(e.target.files[0]));
  //     }
  //   },
  //   [userAvatar, updateUser],
  // );

  const lengthStyle = useMemo(() => {
    if (passwordCheck === '') { return styles.empty; }

    if (passwordCheck.length >= 8) { return styles.check; }

    return styles.error;
  }, [passwordCheck]);

  const lowerCaseStyle = useMemo(() => {
    if (passwordCheck === '') { return styles.empty; }

    if (/[a-z]/.test(passwordCheck)) { return styles.check; }

    return styles.error;
  }, [passwordCheck]);

  const upperCaseStyle = useMemo(() => {
    if (passwordCheck === '') { return styles.empty; }

    if (/[A-Z]/.test(passwordCheck)) { return styles.check; }

    return styles.error;
  }, [passwordCheck]);

  const numberStyle = useMemo(() => {
    if (passwordCheck === '') { return styles.empty; }

    if (/[0-9]/.test(passwordCheck)) { return styles.check; }

    return styles.error;
  }, [passwordCheck]);

  const specialCharStyle = useMemo(() => {
    if (passwordCheck === '') { return styles.empty; }

    if (/[!@#$%^&*]/.test(passwordCheck)) { return styles.check; }

    return styles.error;
  }, [passwordCheck]);

  return (
    <div className={styles.signupContainer}>
      <header>
        <div>
          <Link href="/">
            <Button
              type="button"
              customStyle={{ className: styles.backButton }}
              icon={FiChevronLeft}
            >
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <div className={styles.signupContent}>
        <Form
          ref={formRef}
          initialData={{
            email: user?.email,
          }}
          onSubmit={handleSubmit}
        >
          {/* TODO: Implementar avatar no cadastro e perfil do usuário no back-end */}
          {/* <div className={styles.avatarInput}>
            <AvatarInput avatarUrl={!!userAvatar ? userAvatar : ''} userName={'Avatar'} handleAvatarChange={handleAvatarChange} />
          </div> */}

          <div className={styles.formsContainer}>
            <div className={styles.personal}>
              <h3>Sua conta Ozllo</h3>

              <Input
                name="email"
                placeholder="E-mail"
                autoComplete="off"
              />

              <Input
                name="password"
                type="password"
                placeholder="Senha"
                onChange={(e) => {
                  setPasswordCheck(e.target.value);
                }}
              />

              <Input
                name="password_confirmation"
                type="password"
                placeholder="Confirme a senha"
              />

              <div className={styles.passwordPanel}>
                <span>
                  A senha deve cumprir os seguintes critérios
                </span>
                <div>
                  {
                    passwordCheck === ''
                      && <VscCircleFilled className={styles.empty} />
                  }
                  {passwordCheck.length >= 8 && <FiCheck className={styles.check} />}
                  {(passwordCheck !== '' && passwordCheck.length < 8) && <FiX className={styles.error} />}
                  <span className={lengthStyle}>
                    A senha deve conter pelo menos 8 caractéres
                  </span>

                  {
                    passwordCheck === ''
                      && <VscCircleFilled className={styles.empty} />
                  }
                  {(/[a-z]/.test(passwordCheck)) && <FiCheck className={styles.check} />}
                  {(passwordCheck !== '' && !(/[a-z]/.test(passwordCheck))) && <FiX className={styles.error} />}
                  <span className={lowerCaseStyle}>
                    Deve conter pelo menos uma letra minúscula
                  </span>

                  {
                    passwordCheck === ''
                      && <VscCircleFilled className={styles.empty} />
                  }
                  {(/[A-Z]/.test(passwordCheck)) && <FiCheck className={styles.check} />}
                  {(passwordCheck !== '' && !(/[A-Z]/.test(passwordCheck))) && <FiX className={styles.error} />}
                  <span className={upperCaseStyle}>
                    Deve conter pelo menos uma letra maiúscula
                  </span>

                  {
                    passwordCheck === ''
                      && <VscCircleFilled className={styles.empty} />
                  }
                  {(/[0-9]/.test(passwordCheck)) && <FiCheck className={styles.check} />}
                  {(passwordCheck !== '' && !(/[0-9]/.test(passwordCheck))) && <FiX className={styles.error} />}
                  <span className={numberStyle}>
                    Deve conter pelo menos um digito numérico
                  </span>

                  {
                    passwordCheck === ''
                      && <VscCircleFilled className={styles.empty} />
                  }
                  {(/[!@#$%^&*]/.test(passwordCheck)) && <FiCheck className={styles.check} />}
                  {(passwordCheck !== '' && !(/[!@#$%^&*]/.test(passwordCheck))) && <FiX className={styles.error} />}
                  <span className={specialCharStyle}>
                    Deve conter pelo menos um caractére especial
                  </span>

                </div>
              </div>

            </div>
          </div>

          <Button type="submit" customStyle={{ className: styles.saveButton }}>Cadastrar</Button>

        </Form>
      </div>
      {
        isLoading && (
          <div className={styles.loadingContainer}>
            <Loader />
          </div>
        )
      }
      {
        isModalVisible && (
          <MessageModal handleVisibility={handleModalVisibility} alterStyle={successfull}>
            <div className={styles.modalContent}>
              {successfull ? <FiCheck style={{ color: 'var(--green-100)' }} /> : <FiX style={{ color: 'var(--red-100)' }} />}
              <p>{title}</p>
              {messages.map((message) => (
                <p>
                  {' '}
                  {message}
                  {' '}
                </p>
              ))}
            </div>
          </MessageModal>
        )
      }
    </div>
  );
};

export default SignUp;
