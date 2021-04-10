import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GetStaticProps } from "next";
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { isSameDay, isSameWeek, isSameMonth, parse, format } from 'date-fns';
import { FiSearch, FiCameraOff } from 'react-icons/fi';

import BulletedButton from '@components/BulletedButton';
import Button from '@components/Button';
import FilterInput from '@components/FilterInput';
import StatusPanel from '@components/OrderStatusPanel';

import styles from './styles.module.scss';
import { useRouter } from 'next/router';

enum OrderStatus {
  Aprovado = 0,
  Processando = 1,
  Cancelado = 2,
  Devolvido = 3
}

enum Filter {
  Hoje = 0,
  Semana = 1,
  Mes = 3
}

type Order = {
  id: string;
  status: OrderStatus;
  name: string;
  brand: string;
  sku: string;
  date: string;
  value: number;
  image?: string;
}

interface SearchFormData {
  search: string;
}

interface OrdersProps {
  orders: Order[];
}

interface Totals {
  totalApproved: number;
  totalProcessing: number;
  totalCanceled: number;
  totalReturned: number;
}

function InInterval(order: Order, filter: number): boolean {
  switch (filter) {
    case Filter.Hoje:
      return isSameDay(parse(order.date, 'dd/MM/yyyy', new Date()), new Date());

    case Filter.Semana:
      return isSameWeek(parse(order.date, 'dd/MM/yyyy', new Date()), new Date());

    case Filter.Mes:
      return isSameMonth(parse(order.date, 'dd/MM/yyyy', new Date()), new Date());

    default:
      return isSameDay(parse(order.date, 'dd/MM/yyyy', new Date()), new Date());
  }
}

export function Orders({ orders }: OrdersProps) {
  const [items, setItems] = useState([] as Order[]);
  const [status, setStatus] = useState(OrderStatus.Aprovado as OrderStatus);
  const [filter, setFilter] = useState(Filter.Hoje);
  const [search, setSeacrh] = useState('');
  const [loading, setLoading] = useState(false);

  const [totalApproved, setTotalApproved] = useState('Carregando...');
  const [totalProcessing, setTotalProcessing] = useState('Carregando...');
  const [totalCanceled, setTotalCanceled] = useState('Carregando...');
  const [totalReturned, setTotalReturned] = useState('Carregando...');

  const formRef = useRef<FormHandles>(null);
  const [error, setError] = useState('');

  const router = useRouter();

  useEffect(() => {
    setLoading(true);


    setItems(orders.filter(order => {
      return InInterval(order, filter) && order.status === status && (search === '' || order.name.toLowerCase().includes(search.toLowerCase()));
    }));

    setLoading(false);
  }, [status, search, filter]);

  useEffect(() => {
    const totals = orders.reduce((accumulator: Totals, order: Order) => {
      if (InInterval(order, filter)) {
        switch (order.status) {
          case OrderStatus.Aprovado:
            accumulator.totalApproved += order.value;
            break;
          case OrderStatus.Cancelado:
            accumulator.totalCanceled += order.value;
            break;
          case OrderStatus.Devolvido:
            accumulator.totalReturned += order.value;
            break;
          case OrderStatus.Processando:
            accumulator.totalProcessing += order.value;
            break;
        }
      }


      return accumulator;
    }, { totalApproved: 0, totalCanceled: 0, totalProcessing: 0, totalReturned: 0 });

    setTotalApproved(new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totals.totalApproved));

    setTotalProcessing(new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totals.totalProcessing));

    setTotalCanceled(new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totals.totalCanceled));

    setTotalReturned(new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totals.totalReturned));
  }, [orders, filter])

  const handleSubmit = useCallback(
    async (data: SearchFormData) => {
      console.log(`Search: ${search} | ${data.search}`)
      try {
        formRef.current?.setErrors({});

        if (data.search !== search) {
          setSeacrh(data.search);
        }

      } catch (err) {
        setError('Ocorreu um erro ao fazer login, cheque as credenciais.');
      }
    },
    [search],
  );

  return (
    <div className={styles.ordersContainer}>
      <div className={styles.ordersHeader}>
        <BulletedButton
          onClick={() => { router.push('/orders') }}
          isActive>
          Número de Pedidos
        </BulletedButton>
        <BulletedButton
          onClick={() => { router.push('/orders/sent') }}>
          Envios
        </BulletedButton>
        <BulletedButton
          onClick={() => { router.push('/orders/order-products') }}>
          Produtos
        </BulletedButton>
      </div>
      <div className={styles.divider} />
      <div className={styles.ordersContent}>
        <div className={styles.ordersOptions}>
          <div className={styles.contentFilters}>
            <Button isActive={filter === Filter.Hoje} onClick={() => setFilter(Filter.Hoje)}>
              Hoje
            </Button>
            {/* <Button isActive={filter === Filter.Semana} onClick={() => setFilter(Filter.Semana)}>
              Essa semana
            </Button> */}
            <Button isActive={filter === Filter.Mes} onClick={() => setFilter(Filter.Mes)}>
              Esse mês
            </Button>
            <Form ref={formRef} onSubmit={handleSubmit}>
              <FilterInput
                name="search"
                icon={FiSearch}
                placeholder="Pesquise um produto..."
                autoComplete="off" />
            </Form>
          </div>
        </div>
        <div className={styles.orderStatusButtons}>
          <StatusPanel title='Aprovados' onClick={() => setStatus(OrderStatus.Aprovado)} isActive={status === OrderStatus.Aprovado}>
            <span className={styles.greenText}> {totalApproved} </span>
          </StatusPanel>
          <StatusPanel title='Processando' onClick={() => setStatus(OrderStatus.Processando)} isActive={status === OrderStatus.Processando}>
            <span className={styles.blueText}> {totalProcessing} </span>
          </StatusPanel>
          <StatusPanel title='Cancelados' onClick={() => setStatus(OrderStatus.Cancelado)} isActive={status === OrderStatus.Cancelado}>
            <span className={styles.redText}> {totalCanceled} </span>
          </StatusPanel>
          <StatusPanel title='Devolvidos' onClick={() => setStatus(OrderStatus.Devolvido)} isActive={status === OrderStatus.Devolvido}>
            <span className={styles.orangeText}> {totalReturned} </span>
          </StatusPanel>
          <StatusPanel title='Todos' onClick={() => { }} isActive={false}>
            <span className={styles.grayText}> R$ 100.000,00 </span>
          </StatusPanel>
        </div>
        {items.length > 0 ? (
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Foto</th>
                <th>Nome do produto</th>
                <th>Marca</th>
                <th>SKU</th>
                <th>Data</th>
                <th>Valor</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {items.map(item =>
                <tr className={styles.tableItem} key={item.id}>
                  <td id={styles.imgCell} >
                    {item.image ? <img src={item.image} alt={item.name} /> : <FiCameraOff />}
                  </td>
                  <td id={styles.nameCell}>
                    {item.name}
                  </td>
                  <td>
                    {item.brand}
                  </td>
                  <td>
                    {item.sku}
                  </td>
                  <td id={styles.dateCell}>
                    {item.date}
                  </td>
                  <td id={styles.valueCell}>
                    {
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }
                      ).format(item.value)
                    }
                  </td>
                  <td id={styles.actionCell}>
                    <span className={styles.action}> Ver detalhes </span>
                  </td>
                </tr>
              )
              }
            </tbody>
          </table>
        ) : (
          <span className={styles.emptyList}> Nenhum item foi encontrado </span>
        )}
      </div>
    </div>
  )
}


const ordersFromApi: Order[] = [
  {
    id: '1',
    status: OrderStatus.Aprovado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    image: 'https://images-americanas.b2w.io/produtos/01/00/img/2608684/5/2608684535_1GG.jpg'
  },
  {
    id: '2',
    status: OrderStatus.Aprovado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    image: 'https://images-americanas.b2w.io/produtos/01/00/img/2608684/5/2608684535_1GG.jpg'
  },
  {
    id: '3',
    status: OrderStatus.Aprovado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    image: ''
  },
  {
    id: '4',
    status: OrderStatus.Aprovado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    image: ''
  },
  {
    id: '5',
    status: OrderStatus.Aprovado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '6',
    status: OrderStatus.Aprovado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '7',
    status: OrderStatus.Aprovado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '8',
    status: OrderStatus.Aprovado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '9',
    status: OrderStatus.Aprovado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '10',
    status: OrderStatus.Aprovado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '11',
    status: OrderStatus.Cancelado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '12',
    status: OrderStatus.Cancelado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '04/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '13',
    status: OrderStatus.Devolvido,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '14',
    status: OrderStatus.Devolvido,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '04/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '15',
    status: OrderStatus.Devolvido,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '16',
    status: OrderStatus.Devolvido,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '04/04/2021',
    value: 299.90,
    image: ''
  },
]

export const getStaticProps: GetStaticProps = async () => {
  return ({
    props: {
      orders: ordersFromApi
    },
    revalidate: 10
  });
}

export default Orders;
