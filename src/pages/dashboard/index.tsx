
import { Panel } from '@components/Panel';
import { useAuth } from '@hooks/auth';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { MdAttachMoney } from 'react-icons/md';

import PanelItem from '../../components/PanelItem';

import styles from './styles.module.scss';

interface OrderSummary {
  name: string;
  value: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [approvedOrders, setApprovedOrders] = useState({
    name: 'Aprovados', value: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(1000000)
  } as OrderSummary);
  const [canceledOrders, setCanceledOrders] = useState({} as OrderSummary);
  const [returnedOredres, setReturnedOrders] = useState({} as OrderSummary);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router])

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardContent}>
        <Panel icon={FiShoppingCart} title='Resumo de Pedidos' description='Confira os status dos seus pedidos'>
          <PanelItem title={approvedOrders.name} value={approvedOrders.value} valueColor='green' />
          <PanelItem title='Processando' value='R$ 1.000.000,00' valueColor='blue' />
          <PanelItem title='Cancelados' value='R$ 1.000.000,00' valueColor='red' />
          <PanelItem title='Devolvidos' value='R$ 1.000.000,00' valueColor='orange' />
        </Panel>
        <Panel icon={MdAttachMoney} title='Status de Vendas' description='Confira os status e quantidades referentes as vendas'>
          <PanelItem title='Aguardando confirmação' value='32' valueColor='gray' />
          <PanelItem title='Aguardando despacho' value='32' valueColor='yellow' />
          <PanelItem title='Despachados' value='32' valueColor='blue' />
          <PanelItem title='Entregues' value='32' valueColor='green' />
          <PanelItem title='Retornados' value='32' valueColor='orange' />
          <PanelItem title='Cancelados' value='32' valueColor='red' />
        </Panel>
        {/* <div className={styles.panelShortcuts}>
          <span>Atalhos</span>
          <div className={styles.shortcutsArea}>

          </div>
        </div> */}
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ }) => {


  return {
    props: {},
    revalidate: 10
  }
}

export default Dashboard;
