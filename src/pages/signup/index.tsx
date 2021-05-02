import React, { useCallback, useRef, ChangeEvent, useState } from 'react';

import { FormHandles, Scope } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';

import { useAuth } from '../../hooks/auth';

import api from '../../services/api';

import getValidationErrors from '../../utils/getValidationErrors';

import styles from './styles.module.scss';

import Input from '@components/InputLabeless';
import Button from '@components/PrimaryButton';
import AvatarInput from '@components/AvatarInput';
import Link from 'next/link';
import { FiCheck, FiChevronLeft } from 'react-icons/fi';
import MessageModal from '@components/MessageModal';
import { FaExclamation } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { TIMEOUT } from 'node:dns';

type SignUpFormData = {
  name: string,
  email: string,
  password: string,
  password_confirmation: string,
}

const SignUp: React.FC = () => {
  const [isModalVisible, setModalVisibility] = useState(false);
  const [successfull, setSuccessfull] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string>();

  const formRef = useRef<FormHandles>(null);

  const { user, updateUser } = useAuth();

  const router = useRouter();

  const handleSubmit = useCallback(
    async (data: SignUpFormData) => {
      try {
        formRef.current?.setErrors({});

        console.log(data)

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),
          email: Yup.string()
            .required('E-mail obrigatório')
            .email('Digite um e-mail válido'),
          password: Yup.string()
            .min(6, 'No mínimo 6 digitos'),
          password_confirmation: Yup.string()
            .required('Confirme sua senha')
            .oneOf([Yup.ref('password'), null], 'As senhas devem ser iguais'),
        });
        await schema.validate(data, { abortEarly: false });

        const {
          name,
          email,
        } = data;

        const formData = {
          name,
          email,
        };

        // await api.post('/users', data);

        setModalVisibility(true);
        setTimeout(() => {
          router.push('/');
        }, 10000);

        // history.push('/');
      } catch (err) {
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
    [],
  );

  const handleModalVisibility = useCallback(() => {
    setModalVisibility(false);

    router.push('/');
  }, [isModalVisible])

  const handleAvatarChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const data = new FormData();

        data.append('avatar', e.target.files[0]);

        !!userAvatar && URL.revokeObjectURL(userAvatar);
        setUserAvatar(URL.createObjectURL(e.target.files[0]));

        console.log(userAvatar)

        // api.patch('/users/avatar', data).then(response => {
        //   updateUser(response.data);

        //   // addToast({
        //   //   type: 'success',
        //   //   title: 'Avatar atualizado!',
        //   // });
        // });
      }
    },
    [userAvatar, updateUser],
  );

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

      <div className={styles.signupContent}>
        <Form
          ref={formRef}
          initialData={{
            name: user?.name,
            email: user?.email,
          }}
          onSubmit={handleSubmit}
        >
          <div className={styles.avatarInput}>
            {
              <AvatarInput avatarUrl={!!userAvatar ? userAvatar : ''} userName={'Avatar'} handleAvatarChange={handleAvatarChange} />
            }
          </div>

          <div className={styles.formsContainer}>
            <div className={styles.personal}>
              <h3>Sua conta Ozllo</h3>

              <Input
                name='name'
                placeholder='Nome'
                autoComplete='off'
              />

              <Input
                name='email'
                placeholder='E-mail'
                autoComplete='off'
              />

              <Input
                name="password"
                type="password"
                placeholder="Senha"
              />

              <Input
                name="password_confirmation"
                type="password"
                placeholder="Confirme a senha"
              />

            </div>
          </div>

          <Button type="submit" customStyle={{ className: styles.saveButton }}>Cadastrar</Button>

        </Form>
      </div>
      {
        isModalVisible && (
          <MessageModal handleVisibility={handleModalVisibility} alterStyle={successfull}>
            <div className={styles.modalContent}>
              <FiCheck />
              <p>Cadastro realizado com sucesso!</p>
              <p>Cheque seu e-mail para autenticar sua conta.</p>
            </div>
          </MessageModal>
        )
      }
    </div>
  );
};

export default SignUp;
