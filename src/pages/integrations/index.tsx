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
import { BiHelpCircle } from 'react-icons/bi';

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
  const [tutorialLink, setTutorialLink] = useState('');
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
          if (!response.data) {
            setLoading(false);
            return;
          }
          setPlatform(response.data.name);
          setSavedInfo({
            ...response.data.data,
            name: response.data.name,
            active: response.data.active,
          });

          formRef.current?.setData(response.data.data);

          response.data.active
            ? setConnectionStatus(IntegrationStatus.CONNECTED)
            : setConnectionStatus(IntegrationStatus.DISCONNECTED);

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
    savedInfo?.active
      ? setConnectionStatus(IntegrationStatus.CONNECTED)
      : setConnectionStatus(IntegrationStatus.DISCONNECTED);
    return;
  }, [savedInfo, platform]);

  useEffect(() => {
    switch (platform) {
      case 'bling':
        setTutorialLink(
          'https://brandz.ozllo.com.br/como-integrar-a-ozllo360-ao-erp-bling/',
        );
        break;
      case 'lojaintegrada':
        setTutorialLink(
          'https://brandz.ozllo.com.br/como-integrar-sua-loja-integrada-com-a-ozllo360/',
        );
        break;
      case 'vtex':
        setTutorialLink(
          'https://brandz.ozllo.com.br/como-integrar-sua-loja-vtex-com-a-ozllo360-2/',
        );
        break;
      case 'tray':
        setTutorialLink(
          'https://brandz.ozllo.com.br/como-integrar-sua-loja-da-plataforma-tray-com-a-ozllo360/',
        );
        break;
      default:
        setTutorialLink('');
    }
  }, [platform]);

  useEffect(() => {
    let attrs: PlatformAttribute[] = [];

    const connection = false;

    switch (platform) {
      case 'bling':
        setTitle('Bling');

        attrs = [
          {
            name: 'api_key',
            type: 'text',
          },
        ];
        break;

      case 'bseller':
        setTitle('BSeller');

        attrs = [
          {
            name: 'api_key',
            type: 'text',
          },
        ];
        break;

      case 'eccosys':
        setTitle('Eccosys');

        attrs = [
          {
            name: 'url',
            type: 'url',
          },
          {
            name: 'api_key',
            type: 'text',
          },
          {
            name: 'secret_key',
            type: 'text',
          },
          {
            name: 'store_url',
            type: 'url',
          },
        ];
        break;

      case 'idealeware':
        setTitle('IdealeWare');

        attrs = [
          {
            name: 'domain',
            type: 'url',
          },
          {
            name: 'user_email',
            type: 'email',
          },
          {
            name: 'user_password',
            type: 'text',
          },
        ];
        break;

      case 'ihub':
        setTitle('IHub');

        attrs = [
          {
            name: 'host',
            type: 'url',
          },
          {
            name: 'jwt',
            type: 'text',
          },
          {
            name: 'seller_id',
            type: 'text',
          },
        ];
        break;

      case 'infracommerce':
        setTitle('Infra.commerce');

        attrs = [
          {
            name: 'store_name',
            type: 'text',
          },
          {
            name: 'domain',
            type: 'url',
          },
          {
            name: 'user_email',
            type: 'text',
          },
          {
            name: 'password',
            type: 'text',
          },
        ];
        break;

      case 'linx_commerce':
        setTitle('Linx Commerce');

        attrs = [
          {
            name: 'user_name',
            type: 'text',
          },
          {
            name: 'user_password',
            type: 'text',
          },
        ];

        break;

      case 'linx_emillenium':
        setTitle('Linx eMillenium');

        attrs = [
          {
            name: 'store_url',
            type: 'url',
          },
          {
            name: 'user_name',
            type: 'text',
          },
          {
            name: 'password',
            type: 'text',
          },
          {
            name: 'showcase',
            type: 'text',
          },
        ];

        break;

      case 'linx_oms':
        setTitle('Linx OMS');

        attrs = [
          {
            name: 'user_name',
            type: 'text',
          },
          {
            name: 'user_password',
            type: 'text',
          },
          {
            name: 'domain',
            type: 'url',
          },
          {
            name: 'client_id',
            type: 'text',
          },
          {
            name: 'channel_id',
            type: 'text',
          },
        ];

        break;

      case 'loja_integrada':
        setTitle('Loja Integrada');

        attrs = [
          {
            name: 'api_key',
            type: 'text',
          },
        ];

        break;

      case 'magento':
        setTitle('Magento');

        attrs = [
          {
            name: 'url_v1',
            type: 'url',
          },
          {
            name: 'api_key',
            type: 'text',
          },
          {
            name: 'user_id',
            type: 'text',
          },
          {
            name: 'website_id',
            type: 'text',
          },
          {
            name: 'store_view',
            type: 'text',
          },
        ];

        break;

      case 'magento_2':
        setTitle('Magento2');

        attrs = [
          {
            name: 'token',
            type: 'text',
          },
          {
            name: 'domain',
            type: 'url',
          },
        ];

        break;

      case 'opencart':
        setTitle('Opencart');

        attrs = [
          {
            name: 'store_domain',
            type: 'url',
          },
          {
            name: 'rest_admin',
            type: 'text',
          },
        ];

        break;

      case 'softvar':
        setTitle('Softvar');

        attrs = [
          {
            name: 'api_key',
            type: 'text',
          },
          {
            name: 'user_id',
            type: 'text',
          },
          {
            name: 'store_payload_id',
            type: 'text',
          },
          {
            name: 'store_stock_id',
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
            name: 'ecommerce_id',
            type: 'text',
          },
        ];

        break;

      case 'tray':
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
            name: 'admin_app_key',
            type: 'text',
          },
          {
            name: 'admin_api_token',
            type: 'text',
          },
          {
            name: 'seller_id',
            type: 'text',
          },
          {
            name: 'sales_policy_id',
            type: 'text',
          },
        ];

        break;

      case 'woocommerce':
        setTitle('WooCommerce');

        attrs = [
          {
            name: 'store_url',
            type: 'url',
          },
          {
            name: 'api_key',
            type: 'text',
          },
          {
            name: 'secret_key',
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
        case 'api_key':
          return `API Key ${integration}`;
        case 'secret_key':
          return `Secret ${integration}`;
        case 'token':
          return `Token ${integration}`;
        case 'jwt':
          return `JWT (Token) ${integration}`;
        case 'seller_id':
          return `SellerId ${integration}`;
        case 'user_id':
          return `UserId ${integration}`;
        case 'client_id':
          return `ClientId ${integration}`;
        case 'channel_id':
          return `ChannelId ${integration}`;
        case 'ecommerce_id':
          return `EcommerceId ${integration}`;
        case 'website_id':
          return `Identificador do Site (WebsiteId) ${integration}`;
        case 'store_view':
          return `Identificador da Vitrine (StoreView) ${integration}`;
        case 'user_name':
          return `Usuário do(a) ${integration}`;
        case 'user_email':
          return `E-mail do(a) ${integration}`;
        case 'store_name':
          return `Nome da loja ${integration}`;
        case 'user_password':
          return `Senha do(a) ${integration}`;
        case 'password':
          return `Senha do(a) ${integration}`;
        case 'apiUrl':
          return `URL da API ${integration}`;
        case 'store_url':
          return `URL da loja ${integration}`;
        case 'url':
          return `URL da loja ${integration}`;
        case 'url_v1':
          return `URL da loja ${integration}`;
        case 'store_domain':
          return `URL da loja ${integration}`;
        case 'domain':
          return `URL ${integration}`;
        case 'host':
          return `URL ${integration}`;
        case 'store_payload_id':
          return `Id da loja ${integration}`;
        case 'store_stock_id':
          return `Id do estoque (stockId) ${integration}`;
        case 'showcase':
          return `Vitrine da E-Millenium`;
        case 'rest_admin':
          return `Admin ID REST da Loja Opencart (Secret Key)`;
        case 'wooCommerceKey':
          return `Consumer Key WooCommerce`;
        case 'wooCommercePasswordConsumer':
          return `Senha do Consumer WooCommerce`;
        case 'admin_app_key':
          return 'APP Key da Vtex';
        case 'admin_api_token':
          return 'APP Token da Vtex';
        case 'sales_policy_id':
          return 'ID da política da Vtex';
      }

      return '';
    },
    [],
  );

  const integrationFieldPlaceholder = useCallback(
    (integration: string, field: string) => {
      switch (field) {
        case 'api_key':
          return `Insira a API Key do(a) ${integration}`;
        case 'secret_key':
          return `Secret Key de Acesso ${integration}`;
        case 'token':
          return `Token ${integration}`;
        case 'jwt':
          return `Token JWT (Token) para API do(a) ${integration}`;
        case 'user_id':
          return `Insira o UserId ${integration}`;
        case 'seller_id':
          return `Insira o Seller Id no ${integration}`;
        case 'client_id':
          return `Insira o clientId do(a)) ${integration}`;
        case 'channel_id':
          return `Insira o channelId do(a) ${integration}`;
        case 'ecommerce_id':
          return `Insira o EcommerceId ${integration}`;
        case 'website_id':
          return `Insira o identificador do site (websiteId) ${integration}`;
        case 'store_view':
          return `Insira o identificador da Vitrine (storeView) ${integration}`;
        case 'user_name':
          return `Insira o seu usuário do(a) ${integration}`;
        case 'user_email':
          return `Insira o email do(a) ${integration}`;
        case 'store_name':
          return `Insira o nome da loja ${integration}`;
        case 'user_password':
          return `Insira a Senha do(a) ${integration}`;
        case 'password':
          return `Insira a Senha do(a) ${integration}`;
        case 'url':
          return `Insira a URL da loja ${integration}`;
        case 'url_v1':
          return `Insira a URL da loja ${integration}`;
        case 'store_url':
          return `Insira a URL da loja ${integration}`;
        case 'store_domain':
          return `Insira a URL da loja ${integration}`;
        case 'domain':
          return `Insira a URL da loja ${integration}`;
        case 'host':
          return `Insira a URL da loja ${integration}`;
        case 'store_payload_id':
          return `Insira o Id da loja (shopId) ${integration}`;
        case 'store_stock_id':
          return `Insira o Id do estoque (stockId) ${integration}`;
        case 'showcase':
          return `Insira a vitrine da loja E-millenium`;
        case 'rest_admin':
          return `Admin ID REST da Loja Opencart (Secret Key)`;
        case 'wooCommerceKey':
          return `Consumer Key WooCommerce`;
        case 'wooCommercePasswordConsumer':
          return `Senha do Consumer WooCommerce`;
        case 'admin_app_key':
          return 'Insira o APP Key da Vtex';
        case 'admin_api_token':
          return 'Insira o APP Token da Vtex';
        case 'sales_policy_id':
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
      platform === 'eccosys' ||
      platform === 'loja_integrada' ||
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
      platform === 'eccosys' ||
      platform === 'idealeware' ||
      platform === 'infracommerce' ||
      platform === 'linx_commerce' ||
      platform === 'magento' ||
      platform === 'magento_2' ||
      platform === 'opencart' ||
      platform === 'tray' ||
      platform === 'vtex' ||
      platform === 'woocommerce'
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
        secret_key: Yup.string().required('Campo obrigatório'),
        store_url: Yup.string()
          .url(
            'Deve ser informada uma url válida (Ex.: https://www.url.com.br)',
          )
          .required('Campo obrigatório'),
      };
    }

    if (platform === 'idealeware') {
      validationSchema = {
        ...validationSchema,
        user_email: Yup.string().email().required('Campo obrigatório'),
      };
    }

    if (platform === 'ihub' || platform === 'linxo') {
      validationSchema = {
        ...validationSchema,
        host: Yup.string()
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
        seller_id: Yup.string(),
      };
    }

    if (
      platform === 'infracommerce' ||
      platform === 'idealeware' ||
      platform === 'linx_commerce' ||
      platform === 'linx_emillenium' ||
      platform === 'linx_oms'
    ) {
      validationSchema = {
        ...validationSchema,
        user_name: Yup.string().required('Campo obrigatório'),
        user_password: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'softvar') {
      validationSchema = {
        ...validationSchema,
        store_payload_id: Yup.string().required('Campo obrigatório'),
        store_stock_id: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'infracommerce') {
      validationSchema = {
        ...validationSchema,
        store_name: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'linx_emillenium') {
      validationSchema = {
        ...validationSchema,
        showcase: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'linxo') {
      validationSchema = {
        ...validationSchema,
        client_id: Yup.string().required('Campo obrigatório'),
        channel_id: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'magento' || platform === 'softvar') {
      validationSchema = {
        ...validationSchema,
        user_id: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'magento') {
      validationSchema = {
        ...validationSchema,
        website_id: Yup.string().required('Campo obrigatório'),
        store_view: Yup.string().required('Campo obrigatório'),
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
        rest_admin: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'tiny') {
      validationSchema = {
        ...validationSchema,
        ecommerce_id: Yup.string(),
      };
    }

    if (platform === 'vtex') {
      validationSchema = {
        ...validationSchema,
        admin_app_key: Yup.string().required('Campo obrigatório'),
        admin_api_token: Yup.string().required('Campo obrigatório'),
        seller_id: Yup.string().required('Campo obrigatório'),
        sales_policy_id: Yup.string().required('Campo obrigatório'),
      };
    }

    if (platform === 'woocommerce') {
      validationSchema = {
        ...validationSchema,
        api_key: Yup.string().required('Campo obrigatório'),
        secret_key: Yup.string().required('Campo obrigatório'),
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
        data,
      };

      api
        .post('integration/system', payload, {
          headers: {
            authorization: token,
            shop_id: user.shopInfo._id,
          },
        })
        .then(response => {
          setPlatform(response.data.name);
          setSavedInfo({
            ...response.data.data,
            name: response.data.name,
            active: response.data.active,
          });

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
          {tutorialLink && (
            <div
              className={styles.tutorialContainer}
              onClick={() => {
                window.open(tutorialLink, '_blank');
              }}
            >
              <BiHelpCircle />
              <span>
                Dúvidas? Clique aqui para ver como preencher o formulário
              </span>
            </div>
          )}
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
