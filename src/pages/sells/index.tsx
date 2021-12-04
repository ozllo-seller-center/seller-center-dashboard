import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiCalendar, FiCameraOff, FiPaperclip, FiSearch } from 'react-icons/fi'
import { FormHandles } from '@unform/core';
import { GetStaticProps } from 'next';
import { format, isSameWeek, isSameMonth, isToday, parseISO, parse, toDate, fromUnixTime } from 'date-fns';
import { Form } from '@unform/web';

import Button from '../../components/FilterButton';
import BulletedButton from '../../components/BulletedButton';
import FilterInput from '../../components/FilterInput';
import StatusPanel from '../../components/OrderStatusPanel';

import styles from './styles.module.scss';
import DatePickerPopup from '../../components/DatePickerPopup';
import Collapsible from '../../components/Collapsible';
import AttachButton from '../../components/AttachButton';
import { useLoading } from 'src/hooks/loading';
import { useAuth } from 'src/hooks/auth';
import api from 'src/services/api';

enum SellStatus {
  // 'pending' | 'approved' | 'invoiced' | 'shipped' | 'delivered' | 'canceled' | 'completed'
  Entregue,
  Processando,
  Retornado,
  Cancelado,
  Faturando,
  Despachando,
  Todos
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
  Mes = 3,
  Custom = 4
}

type OrderProduct = {
  name: string,
  quantity: number,
  price: number,
  discount: number,
}

export type Sell = {
  id: any,
  order_number: string,
  marketplace: 'VTEX' | 'AMAZON' | 'OZLLO' | 'B2W',
  date: number;
  status: SellStatus, //'Processando' | 'Faturando' | 'Despachando' | 'Retornado' | 'Cancelado' | 'Entregue',
  products: OrderProduct[]
  total: number,
  nfe_url?: string,
  shipment_cod?: string,
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

function InOrderStatus(order: Sell, filter: OrderStatus): boolean {

  switch (filter) {
    case OrderStatus.Aprovado:
      return order.status === SellStatus.Entregue;
    case OrderStatus.Cancelado:
      return order.status === SellStatus.Cancelado;
    case OrderStatus.Devolvido:
      return order.status === SellStatus.Retornado;
    case OrderStatus.Processando:
      return order.status === SellStatus.Processando || order.status === SellStatus.Faturando || order.status === SellStatus.Despachando;
  }

  return true;
}

function OrderContainsProduct(order: Sell, search: string): boolean {
  const contains = order.products.reduce((accumulator: number, product: OrderProduct) => {
    accumulator += product.name.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
    return accumulator;
  }, 0)

  return !!contains;
}

export function Sells({ sells }: SellsProps) {
  const [items, setItems] = useState([] as Sell[]);
  const [status, setStatus] = useState(SellStatus.Todos as SellStatus);
  const [orderStatus, setOrderStatus] = useState(OrderStatus.Todos as OrderStatus);
  const [fromDateFilter, setFromDateFilter] = useState(new Date());
  const [toDateFilter, setToDateFilter] = useState(new Date());
  const [filter, setFilter] = useState(Filter.Hoje);
  const [search, setSeacrh] = useState('');

  const itemsRef = useMemo(() => Array(items.length).fill(0).map(i => React.createRef<HTMLTableRowElement>()), [items]);
  const collapsibleRefs = useMemo(() => items.length > 2 && Array(items.length).fill(0).map(i => React.createRef<HTMLDivElement>()), [items]);

  const [totalApproved, setTotalApproved] = useState('Carregando...');
  const [totalProcessing, setTotalProcessing] = useState('Carregando...');
  const [totalCanceled, setTotalCanceled] = useState('Carregando...');
  const [totalReturned, setTotalReturned] = useState('Carregando...');
  const [total, setTotal] = useState('Carregando...');

  const { user, token, updateUser } = useAuth();
  const { isLoading, setLoading } = useLoading();

  useEffect(() => {
    setLoading(true)

    api.get('/account/detail').then(response => {
      updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: response.data.shopInfo._id } })

      api.get('/order/all', {
        headers: {
          authorization: token,
          shop: response.data.shopInfo._id,
        }
      }).then(response => {
        console.log('Orders:')
        console.log(response.data)

        // response.data.orders.map((order: any) => {

        // })

        setLoading(false)
      }).catch(err => {
        console.log(err)
        setLoading(false)
      })
    }).catch(err => {
      console.log(err)
      setLoading(false)
    });
  }, [])


  const inInterval = useCallback((order: Sell) => {
    switch (filter) {
      case Filter.Hoje:
        return isToday(order.date);

      case Filter.Semana:
        return isSameWeek(order.date, new Date());

      case Filter.Mes:
        return isSameMonth(order.date, new Date());

      case Filter.Custom:
        return format(order.date, 'yyyy/MM/dd') <= format(toDateFilter, 'yyyy/MM/dd') && format(order.date, 'yyyy/MM/dd') >= format(fromDateFilter, 'yyyy/MM/dd');

      default:
        return isToday(order.date);
    }
  }, [fromDateFilter, toDateFilter, filter])

  useEffect(() => {
    const totals = sells.reduce((accumulator: Totals, order: Sell) => {
      if (inInterval(order)) {
        switch (order.status) {
          case SellStatus.Entregue:
            accumulator.totalApproved += order.total;
            accumulator.total += order.total;
            break;
          case SellStatus.Processando:
          case SellStatus.Faturando:
          case SellStatus.Despachando:
            accumulator.totalProcessing += order.total;
            accumulator.total += order.total;
            break;
          case SellStatus.Cancelado:
            accumulator.totalCanceled += order.total;
            accumulator.total -= order.total;
            break;
          case SellStatus.Retornado:
            accumulator.totalReturned += order.total;
            accumulator.total -= order.total;
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
  }, [orderStatus, fromDateFilter, toDateFilter, filter]);

  const formRef = useRef<FormHandles>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setItems(sells.filter(sell => {
      if (status === SellStatus.Todos)
        return inInterval(sell) && InOrderStatus(sell, orderStatus) && (search === '' || OrderContainsProduct(sell, search));

      return inInterval(sell) && (sell.status === status) && (search === '' || OrderContainsProduct(sell, search));
    }));
  }, [sells, status, orderStatus, fromDateFilter, toDateFilter, search, filter]);

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

  const handleAttachment = useCallback(async (data: any) => {
  }, [items]);

  const datePickerRef = useRef<FormHandles>(null);
  const [datePickerVisibility, setDatePickerVisibility] = useState(false);

  return (
    <div className={styles.sellsContainer}>
      <div className={styles.sellsHeader}>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Todos)}
          isActive={status === SellStatus.Todos}>
          Todas
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Processando)}
          isActive={status === SellStatus.Processando}>
          Aguardando Pagamento
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Faturando)}
          isActive={status === SellStatus.Faturando}>
          Aguardando Faturamento
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Despachando)}
          isActive={status === SellStatus.Despachando}>
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
        <BulletedButton
          onClick={() => setStatus(SellStatus.Entregue)}
          isActive={status === SellStatus.Entregue}>
          Entregues
        </BulletedButton>
      </div>
      <div className={styles.divider} />
      <div className={styles.sellsContent}>
        <div className={styles.sellsOptions}>
          <div className={styles.contentFilters}>
            <Button isActive={filter === Filter.Hoje} onClick={() => setFilter(Filter.Hoje)}>
              Hoje
            </Button>
            <Button isActive={filter === Filter.Semana} onClick={() => setFilter(Filter.Semana)}>
              Esta semana
            </Button>
            <Button isActive={filter === Filter.Mes} onClick={() => setFilter(Filter.Mes)}>
              Este mês
            </Button>
            <div className={styles.verticalDivider} />
            <div>
              <Button
                icon={FiCalendar}
                isActive={filter === Filter.Custom}
                onClick={() => {
                  setFilter(Filter.Custom);
                  setDatePickerVisibility(!datePickerVisibility);
                }}>Escolher período</Button>

              {filter === Filter.Custom && (
                <DatePickerPopup
                  formRef={datePickerRef}
                  setToDateFilter={setToDateFilter}
                  setFromDateFilter={setFromDateFilter}
                  style={{
                    marginBottom: '-13.25rem'
                  }}
                  className={styles.datePopupContainer}
                  visibility={datePickerVisibility}
                  setVisibility={setDatePickerVisibility}
                />
              )}
            </div>
            <Form ref={formRef} onSubmit={handleSubmit} className={styles.searchContainer}>
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
            <StatusPanel title='Todos' onClick={() => setOrderStatus(OrderStatus.Todos)} isActive={orderStatus === OrderStatus.Todos}>
              <span className={styles.grayText}> {total} </span>
            </StatusPanel>
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
          </div>
        )}
        {items.length > 0 ? (
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Número do pedido</th>
                <th>Produtos</th>
                <th>Data</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {items.map((item, i) => (
                <tr className={styles.tableItem} key={item.order_number} ref={itemsRef[i]}>
                  <td width='12.5%'>
                    {item.order_number}
                  </td>
                  <td id={styles.itemsCell}>
                    {
                      item.products.map((product, i) => {
                        return (i < 2 && <p key={i}>{product.name}</p>)
                      })
                    }
                    {
                      item.products.length > 2 && (
                        <>
                          <Collapsible totalItems={item.products.length} toggleRef={!!collapsibleRefs ? collapsibleRefs[i] : undefined}>
                            {
                              item.products.map((product, i) => {
                                if (i < 2)
                                  return (<></>)

                                return (
                                  <p key={i}>{product.name}</p>
                                )
                              })
                            }
                          </Collapsible>
                        </>
                      )
                    }
                  </td>
                  <td id={styles.dateCell}>
                    {format(item.date, 'dd/MM/yyyy')}
                  </td>
                  <td id={styles.valueCell}>
                    {
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }
                      ).format(item.total)
                    }
                  </td>
                  <td width='12.5%'>
                    {SellStatus[item.status]}
                  </td>
                  <td id={status === SellStatus.Faturando || status === SellStatus.Despachando ? styles.attachmentCell : styles.actionCell}>
                    {status === SellStatus.Faturando ?
                      <AttachButton
                        name={item.id}
                        title='Anexo de NF-e'
                        attachedText='NF-e Anexada'
                        unattachedText='Anexar NF-e'
                        placeholder='Informe a URL da NF-e'
                        handleAttachment={handleAttachment}
                        isAttached={!!item.nfe_url}
                      />
                      :
                      status === SellStatus.Despachando ?
                        <AttachButton
                          name={item.id}
                          title='Código de envio'
                          attachedText='Código de Envio'
                          unattachedText='Informar código'
                          placeholder='Informe o código de envio'
                          handleAttachment={handleAttachment}
                          isAttached={!!item.nfe_url}
                        />
                        :
                        <span className={styles.action} style={{ cursor: 'help', opacity: 0.5 }} title="Desabilitado"> Ver detalhes </span>
                    }
                  </td>
                </tr>
              )
              )
              }
            </tbody>
          </table>
        ) : (
          <span className={styles.emptyList}> Nenhum item foi encontrado </span>
        )}
      </div>
    </div >
  )
}

const ordersFromApi: Sell[] = [];

export const getStaticProps: GetStaticProps = async ({ }) => {
  const sells = ordersFromApi.sort((a, b) => a.date < b.date ? -1 : 1);

  return ({
    props: { sells },
    revalidate: 10
  })
}

export default Sells;
