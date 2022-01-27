import React, { useCallback, useRef, ChangeEvent, useState } from 'react';

import Link from 'next/link';

import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { useRouter } from 'next/router';
import * as Yup from 'yup';

import { FiCheck, FiChevronLeft, FiX } from 'react-icons/fi';

import { useAuth } from '../../hooks/auth';

import api from '../../services/api';

import getValidationErrors from '../../utils/getValidationErrors';

import styles from './styles.module.scss';

import { isEmailValid, isPasswordSecure } from '../../utils/util';
import Input from '../../components/InputLabeless';
import Button from '../../components/PrimaryButton';
import MessageModal from '../../components/MessageModal';
import { Loader } from 'src/components/Loader';
import { useLoading } from 'src/hooks/loading';
import { AppError } from 'src/shared/errors/api/errors';

type SignUpFormData = {
  email: string,
}

const ForgotPassword: React.FC = () => {
  const { isLoading, setLoading } = useLoading();

  const [isModalVisible, setModalVisibility] = useState(false);
  const [successfull, setSuccessfull] = useState(false);
  const [title, setTitle] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [userAvatar, setUserAvatar] = useState<string>();

  const formRef = useRef<FormHandles>(null);

  const { user } = useAuth();

  const router = useRouter();

  const handleSubmit = useCallback(
    async (data: SignUpFormData) => {
      setLoading(true);
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          email: Yup.string()
            .required('E-mail obrigatório')
            .email('Digite um e-mail válido')
            .test(
              'email-validation',
              'Informe um e-mail válido',
              (value) => (
                !!value && isEmailValid(value)
              )),
        });
        await schema.validate(data, { abortEarly: false });

        const {
          email
        } = data;

        await api.get(`/auth/forgotPassword/${email}`);

        setModalVisibility(true);
        setSuccessfull(true);
        setLoading(false);
        setTitle('Requisição de senha enviada!');
        setMessage('Cheque seu e-mail para recuperar sua senha.');
      } catch (err) {
        setLoading(false);

        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

          return;
        }

        setModalVisibility(true);
        setSuccessfull(false);
        setTitle('Oops...');
        setMessage('Ocorreu um erro durante a requisição, tente novamente em alguns instantes.');
        // addToast({
        //   type: 'error',
        //   title: 'Erro na atualização',
        //   description:
        //     'Ocorreu um erro ao atualizar seu perfil, tente novamente.',
        // });
      }
    },
    [],
  );

  const handleModalVisibility = useCallback(() => {
    setModalVisibility(false);

    if (successfull)
      router.push('/');
  }, [isModalVisible, successfull])

  return (
    <div className={styles.signupContainer}>
      <header>
        <div>
          <Link href="/">
            <Button
              type='button'
              customStyle={{ className: styles.backButton }}
              icon={FiChevronLeft}
            >
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <div className={styles.recoveryContent}>
        <Form
          ref={formRef}
          initialData={{
            email: user?.email,
          }}
          onSubmit={handleSubmit}
        >
          {/* <div className={styles.avatarInput}>
            <AvatarInput avatarUrl={!!userAvatar ? userAvatar : ''} userName={'Avatar'} handleAvatarChange={handleAvatarChange} />
          </div> */}

          <div className={styles.formsContainer}>
            <div className={styles.personal}>
              <h3>Recuperação de senha</h3>

              <Input
                name='email'
                placeholder='E-mail'
                autoComplete='off'
              />

            </div>
          </div>

          <Button type="submit" customStyle={{ className: styles.saveButton }}>Confirmar</Button>

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
              <p>{message}</p>
            </div>
          </MessageModal>
        )
      }
    </div>
  );
};

export default ForgotPassword;
