import React, { useEffect, useState } from 'react';

import api from 'src/services/api';

import { useAuth } from 'src/hooks/auth';
import styles from './styles.module.scss';
import HeaderDropdown from 'src/components/HeaderDropdown';

import { platformItems } from '../../shared/consts/integrations';

interface PlatformAttribute {
  name: string;
  type: 'text' | 'url' | 'email';
  required?: boolean;
}

const Integrations: React.FC = () => {
  const [platform, setPlatform] = useState('');

  const [title, setTitle] = useState('');
  const [attributes, setAttributes] = useState<PlatformAttribute[]>([]);

  const { user, token } = useAuth();

  useEffect(() => {
    if (user) {
      api.get('integration/system', {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        },
      });
    }
  }, [token, user]);

  useEffect(() => {
    let attrs: PlatformAttribute[] = [];

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
            name: 'sellerdId',
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
            name: 'wooCommerceConsumer',
            type: 'text',
          },
        ];

        break;

      default:
        break;
    }

    setAttributes(attrs);
  }, [platform]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <HeaderDropdown items={platformItems} setActiveItem={setPlatform} />
      </div>
      <div className={styles.content}></div>
    </div>
  );
};

export default Integrations;
