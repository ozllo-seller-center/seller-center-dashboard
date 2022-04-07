import React, { useCallback, useEffect, useRef, useState } from 'react';

import api from 'src/services/api';

import * as Yup from 'yup';

import { useAuth } from 'src/hooks/auth';
import styles from './styles.module.scss';

import { platformItems } from '../../shared/consts/integrations';
import { useLoading } from 'src/hooks/loading';
import Loader from 'src/components/Loader';
import Button from 'src/components/PrimaryButton';
import {
  MdSignalWifiStatusbar4Bar,
  MdSignalWifiStatusbarConnectedNoInternet,
  MdSignalWifiStatusbarNotConnected,
} from 'react-icons/md';
import Input from 'src/components/Input';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import IntegrationList from 'src/components/IntegrationList';
import { useModalMessage } from 'src/hooks/message';
import MessageModal from 'src/components/MessageModal';
import { FiCheck, FiWifiOff, FiX } from 'react-icons/fi';

interface PlatformAttribute {
  name: string;
  type: 'text' | 'url' | 'email' | 'password';
  required?: boolean;
}

type SavedIntegration = any & {
  name: string;
  active?: boolean;
};

enum IntegrationStatus {
  CONNECTED,
  DISCONNECTED,
  UNSET,
}

const Integrations: React.FC = () => {
  const [platform, setPlatform] = useState(platformItems[0].value);
  const [savedInfo, setSavedInfo] = useState<SavedIntegration>();
  const [connectionStatus, setConnectionStatus] = useState(
    IntegrationStatus.UNSET,
  );

  const [title, setTitle] = useState('');
  const [attributes, setAttributes] = useState<PlatformAttribute[]>([]);
  // const [connectButton, setConnectButton] = useState(false);

  const formRef = useRef<FormHandles>(null);

  const { user, token } = useAuth();
  const { isLoading, setLoading } = useLoading();
  const { handleModalMessage, showModalMessage, modalMessage } =
    useModalMessage();

  useEffect(() => {
    setLoading(true);

    if (user) {
      api
        .get('integration/system', {
          headers: {
            authorization: token,
            shop_id: user.shopInfo._id,
          },
        })
        .then(response => {
          setPlatform(response.data.name);
          setSavedInfo({ ...response.data.data, name: response.data.name });

          formRef.current?.setData(response.data.data);

          if (response.data.data) {
            setConnectionStatus(IntegrationStatus.CONNECTED);
          }

          setLoading(false);
        })
        .catch(err => {
          console.log(err);
          setLoading(false);
        });

      return;
    }

    // setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!savedInfo || platform !== savedInfo.name) {
      setConnectionStatus(IntegrationStatus.UNSET);
      return;
    }

    if (!savedInfo.active) {
      // FIXME: ajustar depois que o Daniel ajustar o backend
      // setConnectionStatus(IntegrationStatus.DISCONNECTED);
      setConnectionStatus(IntegrationStatus.CONNECTED);
      return;
    }

    setConnectionStatus(IntegrationStatus.CONNECTED);
  }, [savedInfo, platform]);

  useEffect(() => {
    let attrs: PlatformAttribute[] = [];

    const connection = false;

    switch (platform) {
      case 'bling':
        setTitle('Bling');

        attrs = [
          {
            name: 'apiKey',
            type: 'text',
          },
        ];
        break;

      case 'bseller':
        setTitle('BSeller');

        attrs = [
          {
            name: 'apiKey',
            type: 'text',
          },
        ];
        break;

      case 'eccoys':
        setTitle('Eccoys');

        attrs = [
          {
            name: 'url',
            type: 'url',
          },
          {
            name: 'apiKey',
            type: 'text',
          },
          {
            name: 'secret',
            type: 'text',
          },
          {
            name: 'ecommerceUrl',
            type: 'url',
          },
        ];
        break;

      case 'idealaware':
        setTitle('IdealaWare');

        attrs = [
          {
            name: 'url',
            type: 'url',
          },
          {
            name: 'email',
            type: 'email',
          },
          {
            name: 'password',
            type: 'text',
          },
        ];
        break;

      case 'ihub':
        setTitle('IHub');

        attrs = [
          {
            name: 'apiUrl',
            type: 'url',
          },
          {
            name: 'jwt',
            type: 'text',
          },
          {
            name: 'sellerId',
            type: 'text',
          },
        ];
        break;

      case 'infracommerce':
        setTitle('Infra.commerce');

        attrs = [
          {
            name: 'shopName',
            type: 'text',
          },
          {
            name: 'url',
            type: 'url',
          },
          {
            name: 'user',
            type: 'text',
          },
          {
            name: 'password',
            type: 'text',
          },
        ];
        break;

      case 'linxc':
        setTitle('Linx Commerce');

        attrs = [
          {
            name: 'user',
            type: 'text',
          },
          {
            name: 'password',
            type: 'text',
          },
        ];

        break;

      case 'linxe':
        setTitle('Linx eMillenium');

        attrs = [
          {
            name: 'url',
            type: 'url',
          },
          {
            name: 'user',
            type: 'text',
          },
          {
            name: 'password',
            type: 'text',
          },
          {
            name: 'eMillenium',
            type: 'text',
          },
        ];

        break;

      case 'linxo':
        setTitle('Linx OMS');

        attrs = [
          {
            name: 'user',
            type: 'text',
          },
          {
            name: 'password',
            type: 'text',
          },
          {
            name: 'apiUrl',
            type: 'url',
          },
          {
            name: 'clientId',
            type: 'text',
          },
          {
            name: 'channelId',
            type: 'text',
          },
        ];

        break;

      case 'lojaintegrada':
        setTitle('Linx Integrada');

        attrs = [
          {
            name: 'apiKey',
            type: 'text',
          },
        ];

        break;

      case 'magento':
        setTitle('Magento');

        attrs = [
          {
            name: 'url',
            type: 'url',
          },
          {
            name: 'apiKey',
            type: 'text',
          },
          {
            name: 'userId',
            type: 'text',
          },
          {
            name: 'websiteId',
            type: 'text',
          },
          {
            name: 'storeView',
            type: 'text',
          },
        ];

        break;

      case 'magento2':
        setTitle('Magento2');

        attrs = [
          {
            name: 'token',
            type: 'text',
          },
          {
            name: 'url',
            type: 'url',
          },
        ];

        break;

      case 'opencart':
        setTitle('Opencart');

        attrs = [
          {
            name: 'apiKey',
            type: 'text',
          },
          {
            name: 'url',
            type: 'url',
          },
          {
            name: 'adminIdOpenCart',
            type: 'text',
          },
        ];

        break;

      case 'softvar':
        setTitle('Softvar');

        attrs = [
          {
            name: 'apiKey',
            type: 'text',
          },
          {
            name: 'userId',
            type: 'text',
          },
          {
            name: 'shopId',
            type: 'text',
          },
          {
            name: 'stockId',
            type: 'text',
          },
        ];

        break;

      case 'tiny':
        setTitle('Tiny');

        attrs = [
          {
            name: 'token',
            type: 'text',
          },
          {
            name: 'ecommerceId',
            type: 'text',
          },
        ];

        break;

      case 'trayio':
        setTitle('Tray.io');

        attrs = [
          {
            name: 'url',
            type: 'url',
          },
        ];

        break;

      case 'vtex':
        setTitle('Vtex');

        attrs = [
          {
            name: 'url',
            type: 'url',
          },
          {
            name: 'vtexKey',
            type: 'text',
          },
          {
            name: 'vtexToken',
            type: 'text',
          },
          {
            name: 'sellerId',
            type: 'text',
          },
          {
            name: 'vtexPoliticId',
            type: 'text',
          },
        ];

        break;

      case 'woo':
        setTitle('WooCommerce');

        attrs = [
          {
            name: 'url',
            type: 'url',
          },
          {
            name: 'wooCommerceKey',
            type: 'text',
          },
          {
            name: 'wooCommercePasswordConsumer',
            type: 'text',
          },
        ];

        break;

      default:
        break;
    }

    setAttributes(attrs);
    // setConnectButton(connection);
  }, [platform, savedInfo]);

  useEffect(() => {
    if (!savedInfo || platform !== savedInfo.name) {
      formRef.current?.reset();
      return;
    }

    formRef.current?.setData(savedInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributes, platform]);

  const integrationFieldLabel = useCallback(
    (integration: string, field: string) => {
      switch (field) {
        case 'apiKey':
          return `API Key ${integration}`;
        case 'secret':
          return `Secret ${integration}`;
        case 'token':
          return `Token ${integration}`;
        case 'jwt':
          return `JWT (Token) ${integration}`;
        case 'sellerId':
          return `SellerId ${integration} (opcional)`;
        case 'userId':
          return `UserId ${integration}`;
        case 'clientId':
          return `ClientId ${integration}`;
        case 'channelId':
          return `ChannelId ${integration}`;
        case 'ecommerceId':
          return `EcommerceId ${integration}`;
        case 'websiteId':
          return `Identificador do Site (WebsiteId) ${integration}`;
        case 'storeView':
          return `Identificador da Vitrine (StoreView) ${integration}`;
        case 'user':
          return `Usuário do(a) ${integration}`;
        case 'email':
          return `E-mail do(a) ${integration}`;
        case 'shopName':
          return `Nome da loja ${integration}`;
        case 'password':
          return `Senha do(a) ${integration}`;
        case 'apiUrl':
          return `URL da API ${integration}`;
        case 'url':
          return `URL da loja ${integration}`;
        case 'shopId':
          return `Id da loja ${integration}`;
        case 'stockId':
          return `Id do estoque (stockId) ${integration}`;
        case 'ecommerceUrl':
          return `URL do E-Commerce ${integration}`;
        case 'eMillenium':
          return `Vitrine da E-Millenium`;
        case 'adminIdOpenCart':
          return `Admin ID REST da Loja Opencart (Secret Key)`;
        case 'wooCommerceKey':
          return `Consumer Key WooCommerce`;
        case 'wooCommercePasswordConsumer':
          return `Senha do Consumer WooCommerce`;
        case 'vtexKey':
          return 'APP Key da Vtex';
        case 'vtexToken':
          return 'APP Token da Vtex';
        case 'vtexPoliticId':
          return 'ID da política da Vtex';
      }

      return '';
    },
    [],
  );

  const integrationFieldPlaceholder = useCallback(
    (integration: string, field: string) => {
      switch (field) {
        case 'apiKey':
          return `Insira a API Key do(a) ${integration}`;
        case 'secret':
          return `Secret Key de Acesso ${integration}`;
        case 'token':
          return `Token ${integration}`;
        case 'jwt':
          return `Token JWT (Token) para API do(a) ${integration}`;
        case 'userId':
          return `Insira o UserId ${integration}`;
        case 'sellerId':
          return `Insira o Seller Id no ${integration}`;
        case 'clientId':
          return `Insira o clientId do(a)) ${integration}`;
        case 'channelId':
          return `Insira o channelId do(a) ${integration}`;
        case 'ecommerceId':
          return `Insira o EcommerceId ${integration}`;
        case 'websiteId':
          return `Insira o identificador do site (websiteId) ${integration}`;
        case 'storeView':
          return `Insira o identificador da Vitrine (storeView) ${integration}`;
        case 'user':
          return `Insira o seu usuário do(a) ${integration}`;
        case 'email':
          return `Insira o email do(a) ${integration}`;
        case 'shopName':
          return `Insira o nome da loja ${integration}`;
        case 'password':
          return `Insira a Senha do(a) ${integration}`;
        case 'apiUrl':
          return `URL da API ${integration}`;
        case 'url':
          return `Insira a URL da loja ${integration}`;
        case 'shopId':
          return `Insira o Id da loja (shopId) ${integration}`;
        case 'stockId':
          return `Insira o Id do estoque (stockId) ${integration}`;
        case 'ecommerceUrl':
          return `Insira a URL/Dominio do seu ecommerce ${integration}`;
        case 'eMillenium':
          return `Insira a vitrine da loja E-millenium`;
        case 'adminIdOpenCart':
          return `Admin ID REST da Loja Opencart (Secret Key)`;
        case 'wooCommerceKey':
          return `Consumer Key WooCommerce`;
        case 'wooCommercePasswordConsumer':
          return `Senha do Consumer WooCommerce`;
        case 'vtexKey':
          return 'Insira o APP Key da Vtex';
        case 'vtexToken':
          return 'Insira o APP Token da Vtex';
        case 'vtexPoliticId':
          return 'Insira o ID da política da Vtex';
      }

      return '';
    },
    [],
  );

  const yupValidationSchema = useCallback(() => {
    let validationSchema = {};

    if (
      platform === 'bling' ||
      platform === 'bsellser' ||
      platform === 'eccoys' ||
      platform === 'lojaintegrada' ||
      platform === 'magento' ||
      platform === 'opencart' ||
      platform === 'softvar'
    ) {
      validationSchema = {
        ...validationSchema,
        apiKey: Yup.string().required('Campo obrigatório'),
      };
    }

    if (
      platform === 'eccoys' ||
      platform === 'idealaware' ||
      platform === 'infracommerce' ||
      platform === 'linxe' ||
      platform === 'magento' ||
      platform === 'magento2' ||
      platform === 'opencart' ||
      platform === 'trayio' ||
      platform === 'vtex' ||
      platform === 'woo'
    ) {
      validationSchema = {
        ...validationSchema,
        url: Yup.string()
          .url(
            'Deve ser informada uma url válida (Ex.: https://www.url.com.br)',
          )
          .required('Campo obrigatório'),
      };
    }

    if (platform === 'eccoys') {
      validationSchema = {
        ...validationSchema,
        secret: Yup.string().required('Campo obrigatório'),
        ecommerceUrl: Yup.string()
          .url(
            'Deve ser informada uma url válida (Ex.: https://www.url.com.br)',
          )
          .required('Campo obrigatório'),
      };
    }

    if (platform === 'idealaware') {
      validationSchema = {
        ...validationSchema,
        email: Yup.string().email().required('Campo obrigatório'),
      };
    }

    if (platform === 'ihub' || platform === 'linxo') {
      validationSchema = {
        ...validationSchema,
        apiUrl: Yup.string()
          .url(
            'Deve ser informada uma url válida (Ex.: https://www.url.com.br)',
          )
          .required('Campo obrigatório'),
      };
    }

    if (platform === 'ihub') {
      validationSchema = {
        ...validationSchema,
        jwt: Yup.string().required('Campo obrigatório'),
        sellerId: Yup.string(),
      };
    }

    if (
      platform === 'infracommerce' ||
      platform === 'idealaware' ||
      platform === 'linxc' ||
      platform === 'linxe' ||
      platform === 'linxo'
    ) {
      validationSchema = {
        ...validationSchema,
        user: Yup.string().required('Campo obrigatório'),
        password: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'softvar') {
      validationSchema = {
        ...validationSchema,
        shopId: Yup.string().required('Campo obrigatório'),
        stockId: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'infracommerce') {
      validationSchema = {
        ...validationSchema,
        shopName: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'linxe') {
      validationSchema = {
        ...validationSchema,
        eMillenium: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'linxo') {
      validationSchema = {
        ...validationSchema,
        clientId: Yup.string().required('Campo obrigatório'),
        channelId: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'magento' || platform === 'softvar') {
      validationSchema = {
        ...validationSchema,
        userId: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'magento') {
      validationSchema = {
        ...validationSchema,
        websiteId: Yup.string().required('Campo obrigatório'),
        storeView: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'magento2' || platform === 'tiny') {
      validationSchema = {
        ...validationSchema,
        token: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'opencart') {
      validationSchema = {
        ...validationSchema,
        adminIdOpenCart: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'tiny') {
      validationSchema = {
        ...validationSchema,
        ecommerceId: Yup.string(),
      };
    }

    if (platform === 'vtex') {
      validationSchema = {
        ...validationSchema,
        vtexKey: Yup.string().required('Campo obrigatório'),
        vtexToken: Yup.string().required('Campo obrigatório'),
        sellerId: Yup.string().required('Campo obrigatório'),
        vtexPoliticId: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'woo') {
      validationSchema = {
        ...validationSchema,
        wooCommerceKey: Yup.string().required('Campo obrigatório'),
        wooCommercePasswordConsumer: Yup.string().required('Campo obrigatório'),
      };
    }

    return validationSchema;
  }, [platform]);

  const handleSubmit = useCallback(
    async (data: any) => {
      setLoading(true);

      const schema = Yup.object().shape({ ...yupValidationSchema });

      await schema.validate(data, { abortEarly: false });

      const payload = {
        name: platform,
        data: {
          ...data,
          active: savedInfo && savedInfo.active ? savedInfo.active : false,
        },
      };

      api
        .post('integration/system', payload, {
          headers: {
            authorization: token,
            shop_id: user.shopInfo._id,
          },
        })
        .then(response => {
          setSavedInfo({
            ...response.data.data,
            active: response.data.data.active,
          });

          if (!response.data.data.active)
            api
              .post(
                `integration/system/${response.data._id}/activate`,
                {},
                {
                  headers: {
                    authorization: token,
                    shop_id: user.shopInfo._id,
                  },
                },
              )
              .then(resp => {
                setSavedInfo({
                  ...response.data.data,
                  active: resp.data.active,
                });

                if (resp.data.active) {
                  setConnectionStatus(IntegrationStatus.CONNECTED);

                  setLoading(false);
                  handleModalMessage(true, {
                    title: 'Sucesso',
                    message: ['Integração realizada com sucesso!'],
                    type: 'success',
                  });

                  return;
                }

                // FIXME: assim que o Daniel ajustar o back retornar o comportamento de sem conexão
                // setConnectionStatus(IntegrationStatus.DISCONNECTED);
                // setLoading(false);
                // handleModalMessage(true, {
                //   title: 'Sem conexão!',
                //   message: [
                //     'A integração foi cadastrada com sucesso.\nPorém a conexão com a plataforma não pode ser estabelecida.',
                //   ],
                //   type: 'other',
                // });

                setConnectionStatus(IntegrationStatus.CONNECTED);
                setLoading(false);
                handleModalMessage(true, {
                  title: 'Sucesso',
                  message: [
                    'Estamos iniciando sua integração.',
                    'Assim que finalizada seus produtos se encontrarão na aba de Produtos',
                  ],
                  type: 'success',
                });
              })
              .catch(err => {
                // FIXME: assim que o Daniel ajustar o back retornar o comportamento de erro na ativação
                // console.log(err);
                // setLoading(false);
                // handleModalMessage(true, {
                //   title: 'Erro',
                //   message: [
                //     'Erro ao conectar a integração, por favor cheque as informações e tente novamente',
                //   ],
                //   type: 'error',
                // });
                // setConnectionStatus(IntegrationStatus.UNSET);

                setConnectionStatus(IntegrationStatus.CONNECTED);
                setLoading(false);
                handleModalMessage(true, {
                  title: 'Sucesso',
                  message: [
                    'Estamos iniciando sua integração.',
                    'Assim que finalizada seus produtos se encontrarão na aba de Produtos',
                  ],
                  type: 'success',
                });
              });
        })
        .catch(err => {
          console.log(err);

          setLoading(false);
          handleModalMessage(true, {
            title: 'Erro',
            message: [
              'Erro ao cadastrar a integração, por favor cheque as informações e tente novamente',
            ],
            type: 'error',
          });

          setConnectionStatus(IntegrationStatus.UNSET);
        });
    },
    [
      handleModalMessage,
      platform,
      savedInfo,
      setLoading,
      token,
      user.shopInfo._id,
      yupValidationSchema,
    ],
  );

  const handleModalVisibility = useCallback(() => {
    handleModalMessage(false);
  }, [handleModalMessage]);

  return (
    <>
      <div className={styles.container}>
        {/* <div className={styles.header}>
          <div>
            <HeaderDropdown items={platformItems} setActiveItem={setPlatform} />
          </div>
        </div> */}
        {/* <div className={styles.divider} /> */}
        <IntegrationList items={platformItems} setActiveItem={setPlatform} />
        <div className={styles.divider} />
        <div className={styles.content}>
          <Form ref={formRef} onSubmit={handleSubmit}>
            {attributes.map((attribute, i) => {
              if (attribute) {
                const label = integrationFieldLabel(title, attribute.name);

                if (attribute.type === 'email')
                  return (
                    <Input
                      key={i}
                      name={attribute.name}
                      label={label}
                      autoComplete="off"
                      placeholder={integrationFieldPlaceholder(
                        title,
                        attribute.name,
                      )}
                    />
                  );

                if (attribute.type === 'url')
                  return (
                    <Input
                      key={i}
                      name={attribute.name}
                      label={label}
                      autoComplete="off"
                      placeholder={integrationFieldPlaceholder(
                        title,
                        attribute.name,
                      )}
                    />
                  );

                if (attribute.type === 'password')
                  return (
                    <Input
                      key={i}
                      name={attribute.name}
                      label={label}
                      autoComplete="off"
                      type="password"
                      placeholder={integrationFieldPlaceholder(
                        title,
                        attribute.name,
                      )}
                    />
                  );

                return (
                  <Input
                    key={i}
                    name={attribute.name}
                    label={label}
                    autoComplete="off"
                    placeholder={integrationFieldPlaceholder(
                      title,
                      attribute.name,
                    )}
                  />
                );
              }
            })}
          </Form>
        </div>
      </div>

      <div className={styles.footerContainer}>
        <div className={styles.connectionStatus}>
          {connectionStatus === IntegrationStatus.CONNECTED && (
            <>
              <MdSignalWifiStatusbar4Bar
                style={{ color: 'var(--green-100)' }}
              />
              <span style={{ color: 'var(--green-100)' }}>
                Integração conectada
              </span>
            </>
          )}
          {connectionStatus === IntegrationStatus.DISCONNECTED && (
            <>
              <MdSignalWifiStatusbarConnectedNoInternet
                style={{ color: 'var(--red-100)' }}
              />
              <span style={{ color: 'var(--red-100)' }}>
                Integração desconectada
              </span>
            </>
          )}
          {connectionStatus === IntegrationStatus.UNSET && (
            <>
              <MdSignalWifiStatusbarNotConnected
                style={{ color: 'var(--gray-300)' }}
              />
              <span>Integração não cadastrada</span>
            </>
          )}
        </div>
        <Button
          type="submit"
          onClick={() => {
            formRef.current?.submitForm();
          }}
        >
          Salvar informações
        </Button>
      </div>

      {isLoading && (
        <div className={styles.loadingContainer}>
          <Loader />
        </div>
      )}

      {showModalMessage && (
        <MessageModal handleVisibility={handleModalVisibility}>
          <div className={styles.modalContent}>
            {modalMessage.type === 'success' && (
              <FiCheck style={{ color: 'var(--green-100)' }} />
            )}
            {modalMessage.type === 'error' && (
              <FiX style={{ color: 'var(--red-100)' }} />
            )}
            {modalMessage.type === 'other' && (
              <FiWifiOff style={{ color: 'var(--gray-300)' }} />
            )}
            <p className={styles.title}>{modalMessage.title}</p>
            {modalMessage.message.map((message, i) => (
              <p key={message} className={styles.messages}>
                {message}
              </p>
            ))}
          </div>
        </MessageModal>
      )}
    </>
  );
};

export default Integrations;
