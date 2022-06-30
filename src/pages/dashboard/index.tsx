import React, { useEffect, useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { MdAttachMoney } from 'react-icons/md';

import { useRouter } from 'next/router';
import PanelItem from '../../components/PanelItem';

import styles from './styles.module.scss';
import Panel from '../../components/Panel';
import { useAuth } from 'src/hooks/auth';
import api from 'src/services/api';
import { useLoading } from 'src/hooks/loading';
import Loader from 'src/components/Loader';

const Dashboard: React.FC = () => {
  const router = useRouter();

  const { user, token } = useAuth();

  const { isLoading, setLoading } = useLoading();

  const [amount, setAmount] = useState({
    pending: 'R$ 0,00',
    approved: 'R$ 0,00',
    invoiced: 'R$ 0,00',
    shipped: 'R$ 0,00',
    delivered: 'R$ 0,00',
    canceled: 'R$ 0,00',
  });

  const [quantity, setQuantity] = useState({
    pending: '0',
    approved: '0',
    invoiced: '0',
    shipped: '0',
    delivered: '0',
    canceled: '0',
  });

  useEffect(() => {
    if (!user) {
      return;
    }
    setLoading(true);
    api
      .get('/order/revenue', {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        },
      })
      .then(response => {
        setAmount(response.data);
        setLoading(false);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err);
        setLoading(false);
      });

    api
      .get('/order/insigths', {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        },
      })
      .then(response => {
        const statusCount =
          response.data[
            response.data.findIndex(
              (item: { status_count: any }) => item.status_count,
            )
          ]['status_count'];

        setQuantity(statusCount);
        setLoading(false);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err);
        setLoading(false);
      });
  }, [setLoading, token, user]);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardContent}>
        <Panel
          icon={MdAttachMoney}
          title="Resumo de Vendas"
          description="Confira os status de suas vendas"
          onPanelButtonClick={() => {
            router.push('/sells');
          }}
        >
          <PanelItem
            title={'Processando'}
            value={amount.pending}
            valueColor="blue"
          />
          <PanelItem
            title="Aguardando Faturamento"
            value={amount.approved}
            valueColor="orange"
          />
          <PanelItem
            title="Aguardando Despacho"
            value={amount.invoiced}
            valueColor="red"
          />
          <PanelItem
            title="Despachados"
            value={amount.shipped}
            valueColor="yellow"
          />
          <PanelItem
            title="Entregues e Concluídos"
            value={amount.delivered}
            valueColor="green"
          />
          <PanelItem
            title="Cancelados"
            value={amount.canceled}
            valueColor="gray"
          />
        </Panel>
        <Panel
          icon={FiSend}
          title="Status dos Envios"
          description="Confira os status e quantidades referentes aos envios"
          onPanelButtonClick={() => {
            router.push('/sells');
          }}
        >
          <PanelItem
            title="Processando"
            value={quantity.pending}
            valueColor="blue"
          />
          <PanelItem
            title="Aguardando Faturamento"
            value={quantity.approved}
            valueColor="orange"
          />
          <PanelItem
            title="Aguardando Despacho"
            value={quantity.invoiced}
            valueColor="red"
          />
          <PanelItem
            title="Despachados"
            value={quantity.shipped}
            valueColor="yellow"
          />
          <PanelItem
            title="Entregues e Concluídos"
            value={quantity.delivered}
            valueColor="green"
          />
          <PanelItem
            title="Cancelados"
            value={quantity.canceled}
            valueColor="gray"
          />
        </Panel>
      </div>
      {isLoading && (
        <div className={styles.loadingContainer}>
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
