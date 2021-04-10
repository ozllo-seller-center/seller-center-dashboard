import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GetStaticProps } from "next";
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { isSameDay, isSameWeek, isSameMonth, parse, format } from 'date-fns';
import { FiSearch, FiCameraOff } from 'react-icons/fi';

import BulletedButton from '@components/BulletedButton';
import Button from '@components/Button';
import FilterInput from '@components/FilterInput';
import OrderStatusPanel from '@components/OrderStatusPanel';

import styles from './styles.module.scss';
import { useRouter } from 'next/router';

enum OrderStatus {
  Aguardando_Confirmação = 1,
  Aguardando_Despacho = 2,
  Despachados = 3,
  Entregues = 4,
  Retornados = 5,
  Cancelados = 6,
  Todos = 9
}

enum SentStatus {
  Enviar = 0,
  Enviado = 1,
  Caminho = 2,
  Entregue = 3,
}

enum Filter {
  Hoje = 0,
  Semana = 1,
  Mes = 3
}

type Order = {
  id: string;
  status: SentStatus;
  orderStatus: OrderStatus;
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
  totalSent: number;
  totalToSend: number;
  totalDelivered: number;
  totalTrack: number;
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

export function Sent({ orders }: OrdersProps) {
  const [items, setItems] = useState([] as Order[]);
  const [status, setStatus] = useState(OrderStatus.Todos as OrderStatus);

  const [filter, setFilter] = useState(Filter.Hoje);
  const [search, setSeacrh] = useState('');
  const [loading, setLoading] = useState(false);

  const [totalToSend, setTotalToSend] = useState('Carregando...');
  const [totalSent, setTotalSent] = useState('Carregando...');
  const [totalDelivered, setTotalDelivered] = useState('Carregando...');
  const [totalTrack, setTotalTrack] = useState('Carregando...');

  const formRef = useRef<FormHandles>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);


    setItems(orders.filter(order => {
      return InInterval(order, filter) && (order.orderStatus === status || status === OrderStatus.Todos) && (search === '' || order.name.toLowerCase().includes(search.toLowerCase()));
    }));

    setLoading(false);
  }, [status, search, filter]);

  useEffect(() => {
    const totals = orders.reduce((accumulator: Totals, order: Order) => {
      if (InInterval(order, filter))
        switch (order.status) {
          case SentStatus.Enviar:
            accumulator.totalToSend++;
            break;
          case SentStatus.Enviado:
            accumulator.totalSent++;
            break;
          case SentStatus.Entregue:
            accumulator.totalDelivered++;
            break;
          case SentStatus.Caminho:
            accumulator.totalTrack++;
            break;
        }

      return accumulator;
    },
      { totalToSend: 0, totalSent: 0, totalDelivered: 0, totalTrack: 0 });

    setTotalToSend(totals.totalToSend.toFixed(0).toString());

    setTotalSent(totals.totalSent.toFixed(0).toString());

    setTotalDelivered(totals.totalDelivered.toFixed(0).toString());

    setTotalTrack(totals.totalTrack.toFixed(0).toString());
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
          onClick={() => setStatus(OrderStatus.Todos)}
          isActive={status === OrderStatus.Todos}>
          Todas
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(OrderStatus.Aguardando_Confirmação)}
          isActive={status === OrderStatus.Aguardando_Confirmação}>
          Aguardando Confirmação
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(OrderStatus.Aguardando_Despacho)}
          isActive={status === OrderStatus.Aguardando_Despacho}>
          Aguardando Despacho
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(OrderStatus.Despachados)}
          isActive={status === OrderStatus.Despachados}>
          Despachados
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(OrderStatus.Entregues)}
          isActive={status === OrderStatus.Entregues}>
          Entregues
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(OrderStatus.Retornados)}
          isActive={status === OrderStatus.Retornados}>
          Retornados
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(OrderStatus.Cancelados)}
          isActive={status === OrderStatus.Cancelados}>
          Cancelados
        </BulletedButton>
      </div>
      <div className={styles.orderStatus}>
        <div className={styles.statusInfo}>
          <p>A enviar</p>
          <span className={styles.grayText}> {totalToSend} </span>
        </div>
        <div className={styles.statusInfo}>
          <p>Enviado</p>
          <span className={styles.blueText}> {totalSent} </span>
        </div>
        <div className={styles.statusInfo}>
          <p>A caminho</p>
          <span className={styles.blueText}> {totalTrack} </span>
        </div>
        <div className={styles.statusInfo}>
          <p>Entregue</p>
          <span className={styles.greenText}> {totalDelivered} </span>
        </div>
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
        <div className={styles.tableContainer}>
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
    </div>
  )
}


const ordersFromApi: Order[] = [
  {
    id: '1',
    status: SentStatus.Enviar,
    orderStatus: OrderStatus.Aguardando_Despacho,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    image: 'https://images-americanas.b2w.io/produtos/01/00/img/2608684/5/2608684535_1GG.jpg'
  },
  {
    id: '2',
    status: SentStatus.Enviar,
    orderStatus: OrderStatus.Aguardando_Despacho,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    image: 'https://images-americanas.b2w.io/produtos/01/00/img/2608684/5/2608684535_1GG.jpg'
  },
  {
    id: '3',
    status: SentStatus.Enviar,
    orderStatus: OrderStatus.Aguardando_Despacho,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    image: ''
  },
  {
    id: '4',
    status: SentStatus.Enviar,
    orderStatus: OrderStatus.Aguardando_Despacho,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    image: ''
  },
  {
    id: '5',
    status: SentStatus.Enviar,
    orderStatus: OrderStatus.Aguardando_Confirmação,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '6',
    status: SentStatus.Enviar,
    orderStatus: OrderStatus.Aguardando_Confirmação,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '7',
    status: SentStatus.Enviar,
    orderStatus: OrderStatus.Aguardando_Confirmação,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '8',
    status: SentStatus.Enviar,
    orderStatus: OrderStatus.Aguardando_Despacho,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '9',
    status: SentStatus.Enviar,
    orderStatus: OrderStatus.Aguardando_Confirmação,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '10',
    status: SentStatus.Enviar,
    orderStatus: OrderStatus.Aguardando_Confirmação,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '11',
    status: SentStatus.Enviado,
    orderStatus: OrderStatus.Aguardando_Confirmação,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '12',
    status: SentStatus.Enviado,
    orderStatus: OrderStatus.Aguardando_Confirmação,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '04/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '13',
    status: SentStatus.Caminho,
    orderStatus: OrderStatus.Despachados,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '14',
    status: SentStatus.Caminho,
    orderStatus: OrderStatus.Despachados,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '04/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '15',
    status: SentStatus.Entregue,
    orderStatus: OrderStatus.Entregues,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    image: ''
  },
  {
    id: '16',
    status: SentStatus.Entregue,
    orderStatus: OrderStatus.Entregues,
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

export default Sent;
