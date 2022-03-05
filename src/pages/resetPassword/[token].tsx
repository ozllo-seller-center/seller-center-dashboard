import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useRouter } from 'next/router';
import * as Yup from 'yup';
import { FiCheck, FiX } from 'react-icons/fi';

import { useLoading } from 'src/hooks/loading';
import { FormHandles } from '@unform/core/typings/types';
import { Form } from '@unform/web';
import { VscCircleFilled } from 'react-icons/vsc';
import { AppError } from 'src/shared/errors/api/errors';
import getValidationErrors from 'src/utils/getValidationErrors';
import { isEmailValid, isPasswordSecure } from 'src/utils/util';
import Button from 'src/components/PrimaryButton';
import Input from 'src/components/InputLabeless';
import Loader from 'src/components/Loader';
import MessageModal from 'src/components/MessageModal';
import { MdUpdate } from 'react-icons/md';
import styles from './styles.module.scss';
import api from '../../services/api';
import { useAuth, User } from '../../hooks/auth';

type ConfirmationFormData = {
  password: string,
  password_confirmation: string,
}

const ResetPassword: React.FC = () => {
  const [isVerifying, setVerifying] = useState(true);
  const [isVerified, setVerified] = useState(false);

  const { isLoading, setLoading } = useLoading();

  const [isModalVisible, setModalVisibility] = useState(false);
  const [successfull, setSuccessfull] = useState(false);
  const [title, setTitle] = useState<string>();
  const [message, setMessage] = useState<string>();

  const router = useRouter();

  const { verifyUser, user } = useAuth();
  const { token } = router.query;

  const [passwordCheck, setPasswordCheck] = useState('');
  const [userId, setUserId] = useState('');

  const formRef = useRef<FormHandles>(null);

  useEffect(() => {
    if (token === '') {
      router.push('/');
    }

    api.get(`/auth/resetPassword/${token}`).then((response) => {
      if (response.data) {
        setVerifying(false);
        setVerified(true);

        setUserId(response.data);

        return;
      }

      setVerifying(false);
      setVerified(false);
    }).catch((err) => {
      setVerifying(false);
      setVerified(false);
    });
  }, []);

  const handleSubmit = useCallback(
    async (data: ConfirmationFormData) => {
      setLoading(true);
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
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
          password,
        } = data;

        await api.post('/auth/resetPassword', { user_id: userId, new_password: password });

        setModalVisibility(true);
        setSuccessfull(true);
        setLoading(false);
        setTitle('Nova senha cadastrada!');
        setMessage('Tente entrar em sua conta agora.');
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
    [setLoading, userId],
  );

  const handleModalVisibility = useCallback(() => {
    setModalVisibility(false);

    if (successfull) { router.push('/'); }
  }, [router, successfull]);

  return (
    <div className={styles.container}>
      {
        isVerifying && (
          <div className={styles.verifying}>
            <div className={styles.dotFlashing} />
            <p>Estamos verificando sua requisição</p>
          </div>
        )
      }
      {
        (!isVerified && !isVerifying) && (
          <div className={styles.notVerified}>
            <FiX />
            <h2>Requisição inválida!</h2>
            <p>Confira o link de recuperação de senha em seu e-mail e tente novamente</p>
          </div>
        )
      }
      {
        (isVerified && !isVerifying) && (
          <div className={styles.confirmationContent}>
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
                <div className={styles.password}>
                  <h3>Informe sua nova senha</h3>

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
                          ? <VscCircleFilled className={styles.empty} />
                          : passwordCheck.length >= 8 ? <FiCheck className={styles.check} /> : <FiX className={styles.error} />
                      }
                      <span className={passwordCheck === '' ? styles.empty : passwordCheck.length >= 8 ? styles.check : styles.error}>
                        A senha deve conter pelo menos 8 caractéres
                      </span>

                      {
                        passwordCheck === ''
                          ? <VscCircleFilled className={styles.empty} />
                          : (/[a-z]/.test(passwordCheck)) ? <FiCheck className={styles.check} /> : <FiX className={styles.error} />
                      }
                      <span className={passwordCheck === '' ? styles.empty : (/[a-z]/.test(passwordCheck)) ? styles.check : styles.error}>
                        Deve conter pelo menos uma letra minúscula
                      </span>

                      {
                        passwordCheck === ''
                          ? <VscCircleFilled className={styles.empty} />
                          : (/[A-Z]/.test(passwordCheck)) ? <FiCheck className={styles.check} /> : <FiX className={styles.error} />
                      }
                      <span className={passwordCheck === '' ? styles.empty : (/[A-Z]/.test(passwordCheck)) ? styles.check : styles.error}>
                        Deve conter pelo menos uma letra maiúscula
                      </span>

                      {
                        passwordCheck === ''
                          ? <VscCircleFilled className={styles.empty} />
                          : (/[0-9]/.test(passwordCheck)) ? <FiCheck className={styles.check} /> : <FiX className={styles.error} />
                      }
                      <span className={passwordCheck === '' ? styles.empty : (/[0-9]/.test(passwordCheck)) ? styles.check : styles.error}>
                        Deve conter pelo menos um digito numérico
                      </span>

                      {
                        passwordCheck === ''
                          ? <VscCircleFilled className={styles.empty} />
                          : (/[!@#$%^&*]/.test(passwordCheck)) ? <FiCheck className={styles.check} /> : <FiX className={styles.error} />
                      }
                      <span className={passwordCheck === '' ? styles.empty : (/[!@#$%^&*]/.test(passwordCheck)) ? styles.check : styles.error}>
                        Deve conter pelo menos um caractére especial
                      </span>

                    </div>
                  </div>

                </div>
              </div>

              <Button type="submit" customStyle={{ className: styles.saveButton }}>Confirmar</Button>

            </Form>
          </div>
        )
      }
      {/* confirmationContent */}
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

export default ResetPassword;
