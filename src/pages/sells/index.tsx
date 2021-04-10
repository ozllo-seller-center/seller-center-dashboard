import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FiCameraOff, FiSearch } from 'react-icons/fi'
import { FormHandles } from '@unform/core';
import { GetStaticProps } from 'next';
import { format, isSameDay, isSameWeek, isSameMonth, parse } from 'date-fns'
import { Form } from '@unform/web';

import Button from '@components/Button';
import BulletedButton from '@components/BulletedButton';
import FilterInput from '@components/FilterInput';
import StatusPanel from '@components/OrderStatusPanel';

import styles from './styles.module.scss';

enum SellStatus {
  Faturado = 0,
  Aguardando_Confirmação = 1,
  Retornado = 2,
  Cancelado = 3,
  Aguardando_Faturamento = 4,
  Aguardando_Despacho = 5,
  Todos = 9
}

enum OrderStatus {
  Aprovado = 0,
  Processando = 1,
  Cancelado = 2,
  Devolvido = 3,
  Todos = 4
}

enum Filter {
  Hoje = 0,
  Semana = 1,
  Mes = 3
}

type Sell = {
  id: string;
  status: SellStatus;
  name: string;
  date: string;
  value: number;
  image?: string;
}

interface SearchFormData {
  search: string;
}

interface SellsProps {
  sells: Sell[];
}

interface Totals {
  totalApproved: number;
  totalProcessing: number;
  totalCanceled: number;
  totalReturned: number;
  total: number;
}

function InInterval(order: Sell, filter: number): boolean {
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

function InOrderStatus(order: Sell, filter: OrderStatus): boolean {

  switch (filter) {
    case OrderStatus.Aprovado:
      return order.status === SellStatus.Faturado;
    case OrderStatus.Cancelado:
      return order.status === SellStatus.Cancelado;
    case OrderStatus.Devolvido:
      return order.status === SellStatus.Retornado;
    case OrderStatus.Processando:
      return order.status === SellStatus.Aguardando_Despacho || order.status === SellStatus.Aguardando_Faturamento || order.status === SellStatus.Aguardando_Confirmação;
  }

  return true;
}


export function Sells({ sells }: SellsProps) {
  const [items, setItems] = useState([] as Sell[]);
  const [status, setStatus] = useState(SellStatus.Todos as SellStatus);
  const [orderStatus, setOrderStatus] = useState(OrderStatus.Todos as OrderStatus);
  const [filter, setFilter] = useState(Filter.Hoje);
  const [search, setSeacrh] = useState('');
  const [loading, setLoading] = useState(false);

  const [totalApproved, setTotalApproved] = useState('Carregando...');
  const [totalProcessing, setTotalProcessing] = useState('Carregando...');
  const [totalCanceled, setTotalCanceled] = useState('Carregando...');
  const [totalReturned, setTotalReturned] = useState('Carregando...');
  const [total, setTotal] = useState('Carregando...');

  useEffect(() => {
    const totals = sells.reduce((accumulator: Totals, order: Sell) => {
      if (InInterval(order, filter)) {
        switch (order.status) {
          case SellStatus.Faturado:
            accumulator.totalApproved += order.value;
            accumulator.total += order.value;
            break;
          case SellStatus.Aguardando_Confirmação:
          case SellStatus.Aguardando_Faturamento:
          case SellStatus.Aguardando_Despacho:
            accumulator.totalProcessing += order.value;
            accumulator.total += order.value;
            break;
          case SellStatus.Cancelado:
            accumulator.totalCanceled += order.value;
            accumulator.total -= order.value;
            break;
          case SellStatus.Retornado:
            accumulator.totalReturned += order.value;
            accumulator.total -= order.value;
            break;
        }
      }

      return accumulator;
    }, { totalApproved: 0, totalCanceled: 0, totalProcessing: 0, totalReturned: 0, total: 0 });

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

    setTotal(new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totals.total));
  }, [orderStatus, filter]);

  const formRef = useRef<FormHandles>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);


    setItems(sells.filter(sell => {

      if (status === SellStatus.Todos)
        return InInterval(sell, filter) && InOrderStatus(sell, orderStatus) && (search === '' || sell.name.toLowerCase().includes(search.toLowerCase()))

      return InInterval(sell, filter) && (sell.status === status) && (search === '' || sell.name.toLowerCase().includes(search.toLowerCase()));
    }));

    setLoading(false);
  }, [status, orderStatus, search, filter]);

  const handleSubmit = useCallback(
    async (data: SearchFormData) => {
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
    <div className={styles.sellsContainer}>
      <div className={styles.sellsHeader}>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Todos)}
          isActive={status === SellStatus.Todos}>
          Todas
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Faturado)}
          isActive={status === SellStatus.Faturado}>
          Faturados
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Aguardando_Confirmação)}
          isActive={status === SellStatus.Aguardando_Confirmação}>
          Aguardando Confirmação
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Aguardando_Faturamento)}
          isActive={status === SellStatus.Aguardando_Faturamento}>
          Aguardando Faturamento
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Aguardando_Despacho)}
          isActive={status === SellStatus.Aguardando_Despacho}>
          Aguardando Despacho
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Retornado)}
          isActive={status === SellStatus.Retornado}>
          Retornados
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Cancelado)}
          isActive={status === SellStatus.Cancelado}>
          Cancelados
        </BulletedButton>
      </div>
      <div className={styles.divider} />
      <div className={styles.sellsContent}>
        <div className={styles.sellsOptions}>
          <div className={styles.contentFilters}>
            <Button isActive={filter === Filter.Hoje} onClick={() => setFilter(Filter.Hoje)}>
              Hoje
            </Button>
            {/* <Button isActive={filter === Filter.Semana} onClick={() => setFilter(Filter.Semana)}>
              Esta semana
            </Button> */}
            <Button isActive={filter === Filter.Mes} onClick={() => setFilter(Filter.Mes)}>
              Este mês
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
        {status === SellStatus.Todos && (
          <div className={styles.orderStatusButtons}>
            <StatusPanel title='Aprovados' onClick={() => setOrderStatus(OrderStatus.Aprovado)} isActive={orderStatus === OrderStatus.Aprovado}>
              <span className={styles.greenText}> {totalApproved} </span>
            </StatusPanel>
            <StatusPanel title='Processando' onClick={() => setOrderStatus(OrderStatus.Processando)} isActive={orderStatus === OrderStatus.Processando}>
              <span className={styles.blueText}> {totalProcessing} </span>
            </StatusPanel>
            <StatusPanel title='Cancelados' onClick={() => setOrderStatus(OrderStatus.Cancelado)} isActive={orderStatus === OrderStatus.Cancelado}>
              <span className={styles.redText}> {totalCanceled} </span>
            </StatusPanel>
            <StatusPanel title='Devolvidos' onClick={() => setOrderStatus(OrderStatus.Devolvido)} isActive={orderStatus === OrderStatus.Devolvido}>
              <span className={styles.orangeText}> {totalReturned} </span>
            </StatusPanel>
            <StatusPanel title='Todos' onClick={() => setOrderStatus(OrderStatus.Todos)} isActive={orderStatus === OrderStatus.Todos}>
              <span className={styles.grayText}> {total} </span>
            </StatusPanel>
          </div>
        )}
        {items.length > 0 ? (
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Foto</th>
                {status === SellStatus.Todos && <th>Status</th>}
                <th>Número venda</th>
                <th>Nome do produto</th>
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
                  {status === SellStatus.Todos && (
                    <td width='12.5%'>
                      {SellStatus[item.status].split('_').join(' ')}
                    </td>
                  )}
                  <td>
                    {item.id}
                  </td>
                  <td id={styles.nameCell}>
                    {item.name}
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

const ordersFromApi: Sell[] = [
  {
    id: '111111111',
    status: SellStatus.Faturado,
    name: 'TRT Molteom Candy Bloomer...',
    date: '01/04/2021',
    value: 299.90,
    image: 'https://images.rappi.com.br/products/2105890298-1611681705552.png'
  },
  {
    id: '222222222',
    status: SellStatus.Aguardando_Faturamento,
    name: 'RTT Molteom Candy Bloomer...',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    image: 'https://images-americanas.b2w.io/produtos/01/00/img/2608684/5/2608684535_1GG.jpg'
  },
  {
    id: '3333333333',
    status: SellStatus.Aguardando_Faturamento,
    name: 'ZUZ Molteom Candy Bloomer...',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
  },
  {
    id: '4444444444',
    status: SellStatus.Retornado,
    name: 'Molteom Candy Bloomer...',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,

  },
  {
    id: '5555555555',
    status: SellStatus.Faturado,
    name: 'Molteom Candy Bloomer...',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,

  },
  {
    id: '66666666',
    status: SellStatus.Aguardando_Faturamento,
    name: 'Molteom Candy Bloomer...',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,

  },
  {
    id: '77777777',
    status: SellStatus.Aguardando_Faturamento,
    name: 'Molteom Candy Bloomer...',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,

  },
  {
    id: '8888888888',
    status: SellStatus.Aguardando_Faturamento,
    name: 'Molteom Candy Bloomer...',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,

  },
  {
    id: '999999999',
    status: SellStatus.Aguardando_Faturamento,
    name: 'Molteom Candy Bloomer...',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,

  },
  {
    id: '10101010',
    status: SellStatus.Aguardando_Faturamento,
    name: 'Molteom Candy Bloomer...',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,

  },
  {
    id: '1111111111',
    status: SellStatus.Aguardando_Confirmação,
    name: 'Molteom Candy Bloomer...',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,

  },
  {
    id: '12121212',
    status: SellStatus.Aguardando_Confirmação,
    name: 'Molteom Candy Bloomer...',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,

  },
  {
    id: '1313131313',
    status: SellStatus.Cancelado,
    name: 'Molteom Candy Bloomer...',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,

  },
];

export const getStaticProps: GetStaticProps = async ({ }) => {

  return ({
    props: { sells: ordersFromApi },
    revalidate: 10
  })
}

export default Sells;
