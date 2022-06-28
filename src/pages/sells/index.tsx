import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCalendar,
  FiCheck,
  FiDownload,
  FiInfo,
  FiPaperclip,
  FiX,
} from 'react-icons/fi';

import { FormHandles } from '@unform/core';
import {
  addDays,
  differenceInBusinessDays,
  differenceInDays,
  format,
  isSameWeek,
  isToday,
  subDays,
} from 'date-fns';

import { useLoading } from 'src/hooks/loading';
import { useAuth } from 'src/hooks/auth';
import api from 'src/services/api';
import AttachButton from 'src/components/AttachButton';
import Modal from 'src/components/Modal';
import NfeModalContent from 'src/components/NfeModalContent';
import { useModalMessage } from 'src/hooks/message';
import MessageModal from 'src/components/MessageModal';
import { Order, OrderParent, OrderStatusType } from 'src/shared/types/order';
import OrderDetailsModal from 'src/components/OrderDetailsModal';
import TrackingModalContent from 'src/components/TrackingModalContent';
import router from 'next/router';
import OrderStatus from 'src/shared/enums/order';
import { InOrderStatus } from 'src/shared/functions/sells';
import { HoverTooltip } from 'src/components/Tooltip';
import Loader from 'src/components/Loader';
import { Filter, SellStatus } from 'src/shared/enums/sells';
import Collapsible from '../../components/Collapsible';
import DatePickerPopup from '../../components/DatePickerPopup';
import styles from './styles.module.scss';
import StatusPanel from '../../components/OrderStatusPanel';
import BulletedButton from '../../components/BulletedButton';
import Button from '../../components/FilterButton';
import InfoPanel from 'src/components/InfoPanel';
import {
  b2wStore,
  mercadoLivreStore,
  shoppeeStore,
} from 'src/shared/consts/sells';
import { TablePagination } from '@mui/material';

interface Totals {
  totalApproved: number;
  totalProcessing: number;
  totalCanceled: number;
  totalDelayed: number;
  total: number;
}

const Sells: React.FC = () => {
  const [orders, setOrders] = useState([] as OrderParent[]);
  const [items, setItems] = useState([] as OrderParent[]);
  const [status, setStatus] = useState(SellStatus.Todos as SellStatus);
  const [orderStatus, setOrderStatus] = useState(
    OrderStatus.Todos as OrderStatus,
  );

  const [fromDateFilter, setFromDateFilter] = useState(new Date());
  const [toDateFilter, setToDateFilter] = useState(new Date());

  const [filter, setFilter] = useState(Filter.Todos);

  const [daysUntilDelivery, setDaysUntilDelivery] = useState(0);

  const itemsRef = useMemo(
    () =>
      Array(items.length)
        .fill(0)
        .map(_i => React.createRef<HTMLTableRowElement>()),
    [items],
  );

  const collapsibleRefs = useMemo(
    () =>
      items.length > 2 &&
      Array(items.length)
        .fill(0)
        .map(_i => React.createRef<HTMLDivElement>()),
    [items],
  );

  const [totalApproved, setTotalApproved] = useState('Carregando...');
  const [totalProcessing, setTotalProcessing] = useState('Carregando...');
  const [totalCanceled, setTotalCanceled] = useState('Carregando...');
  const [totalDelayed, setTotalDelayed] = useState(0);
  const [total, setTotal] = useState('Carregando...');

  const { user, token, updateUser } = useAuth();
  const { isLoading, setLoading } = useLoading();
  const {
    showModalMessage: showMessage,
    modalMessage,
    handleModalMessage,
  } = useModalMessage();

  const [isNfeModalOpen, setNfeModalOpen] = useState(false);
  const [nfeItem, setNfeItem] = useState<OrderParent>();

  const [isTrackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingItem, setTrackingItem] = useState<OrderParent>();

  const [modalOrder, setModalOrder] = useState<Order>();
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);

  const [openTooltip, setOpenTooltip] = useState(false);
  const [tooltipItem, setTooltipItem] = useState<Order>();
  const [toolTipYOffset, setToolTipYOffset] = useState(0);
  const [toolTipXOffset, setToolTipXOffset] = useState(0);

  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // setOrders(ordersFromApi)
    setLoading(true);

    api
      .get('/account/detail')
      .then(response => {
        updateUser({
          ...user,
          shopInfo: {
            ...user.shopInfo,
            _id: response.data.shopInfo._id,
            userId: response.data.shopInfo.userId,
          },
        });

        loadOrders();
      })
      .catch(err => {
        setLoading(false);

        // eslint-disable-next-line no-console
        console.log(err);
        router.push('/');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    api
      .get('/order/insigths', {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        },
      })
      .then(response => {
        if (
          filter === Filter.Mes ||
          (filter === Filter.Período &&
            differenceInDays(toDateFilter, fromDateFilter) > 10)
        ) {
          setDaysUntilDelivery(
            response.data[0].average_shipping_time.last_month,
          );
          return;
        }

        setDaysUntilDelivery(response.data[0].average_shipping_time.last_week);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err);
        setDaysUntilDelivery(0);

        setLoading(false);
      });
  }, [orders, filter, setLoading, token, user, toDateFilter, fromDateFilter]);

  const loadOrders = useCallback(() => {
    setLoading(true);

    api
      .get(`/order/all?page=${page + 1}&limit=${rowsPerPage}`, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        },
      })
      .then(response => {
        const ords: OrderParent[] = response.data.items;
        setPage(0);
        setOrders(ords);
        setTotalItems(response.data.total);
        setItems(response.data.items);
        setLoading(false);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err);
        setLoading(false);
      });
  }, [setLoading, page, rowsPerPage, token, user.shopInfo._id]);

  const inInterval = useCallback(
    (order: Order) => {
      const date: Date = new Date(order.payment.purchaseDate);
      date.setHours(0);
      date.setMinutes(0);
      date.setMilliseconds(0);

      const today = new Date();

      switch (filter) {
        case Filter.Semana:
          return isSameWeek(date, new Date());

        case Filter.Mes:
          today.setHours(0);
          today.setMinutes(0);
          today.setMilliseconds(0);

          return (
            date.getTime() >= subDays(today, 31).getTime() &&
            date.getTime() <= today.getTime()
          );

        case Filter.Período:
          return (
            format(date, 'yyyy/MM/dd') <= format(toDateFilter, 'yyyy/MM/dd') &&
            format(date, 'yyyy/MM/dd') >= format(fromDateFilter, 'yyyy/MM/dd')
          );
        case Filter.Hoje:
          return isToday(date);
        default:
          return true;
      }
    },
    [fromDateFilter, toDateFilter, filter],
  );

  useEffect(() => {
    const totals = orders.reduce(
      (accumulator: Totals, orderParent: OrderParent) => {
        const { order } = orderParent;

        if (inInterval(order)) {
          switch (order.status.status) {
            case 'Completed':
            case 'Delivered':
            case 'Invoiced':
            case 'Shipped':
              accumulator.totalApproved +=
                order.payment.totalAmountPlusShipping;
              accumulator.total += order.payment.totalAmountPlusShipping;
              break;
            case 'Approved':
            case 'Pending':
              accumulator.totalProcessing +=
                order.payment.totalAmountPlusShipping;
              accumulator.total += order.payment.totalAmountPlusShipping;
              break;
            case 'Canceled':
              accumulator.totalCanceled +=
                order.payment.totalAmountPlusShipping;
              accumulator.total += order.payment.totalAmountPlusShipping;
              break;
            default:
              break;
          }

          if (
            order.status.status !== 'Shipped' &&
            order.status.status !== 'Delivered' &&
            order.status.status !== 'Completed' &&
            order.status.status !== 'Canceled' &&
            order.status.status !== 'Pending' &&
            !!order.payment.paymentDate &&
            getDaysToShip(
              order.payment?.approvedDate || order.payment.paymentDate,
            ) < 0
          ) {
            accumulator.totalDelayed += 1;
          }
        }

        return accumulator;
      },
      {
        totalApproved: 0,
        totalCanceled: 0,
        totalProcessing: 0,
        totalDelayed: 0,
        total: 0,
      },
    );

    setTotalDelayed(totals.totalDelayed);

    setTotalApproved(
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(totals.totalApproved),
    );

    setTotalProcessing(
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(totals.totalProcessing),
    );

    setTotalCanceled(
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(totals.totalCanceled),
    );

    setTotal(
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(totals.total),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, orderStatus, fromDateFilter, toDateFilter, filter, inInterval]);

  useEffect(() => {
    const newItems = orders.filter(orderParent => {
      const { order } = orderParent;

      switch (status) {
        case SellStatus.Processando:
          return inInterval(order) && order.status.status === 'Pending';
        case SellStatus.Faturando:
          return inInterval(order) && order.status.status === 'Approved';
        case SellStatus.Despachando:
          return inInterval(order) && order.status.status === 'Invoiced';
        case SellStatus.Despachado:
          return inInterval(order) && order.status.status === 'Shipped';
        case SellStatus.Cancelado:
          return inInterval(order) && order.status.status === 'Canceled';
        case SellStatus.Entregue:
          return (
            inInterval(order) &&
            (order.status.status === 'Delivered' ||
              order.status.status === 'Completed')
          );
        default:
          return inInterval(order) && InOrderStatus(order, orderStatus);
      }
    });

    setItems(newItems);
  }, [
    orders,
    status,
    orderStatus,
    fromDateFilter,
    toDateFilter,
    filter,
    inInterval,
  ]);

  const getOrdersByStatus = useCallback(
    (status: string) => {
      setLoading(true);
      api
        .get(`/order/status/${status}?page=1&limit=${rowsPerPage}`, {
          headers: {
            authorization: token,
            shop_id: user.shopInfo._id,
          },
        })
        .then(response => {
          setPage(0);
          setTotalItems(response.data.total);
          setItems(response.data.items);
          setLoading(false);
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.log(err);
          setLoading(false);
        });
    },
    [setLoading, rowsPerPage, token, user.shopInfo._id],
  );

  const datePickerRef = useRef<FormHandles>(null);
  const [datePickerVisibility, setDatePickerVisibility] = useState(false);

  const handleModalVisibility = useCallback(() => {
    handleModalMessage(false);
  }, [handleModalMessage]);

  const handleOrderModalVisibility = useCallback(() => {
    setOrderModalOpen(false);
  }, []);

  const getOrderStatus = useCallback((os: OrderStatusType): SellStatus => {
    switch (os) {
      case 'Pending':
        return SellStatus.Processando;
      case 'Approved':
        return SellStatus.Faturando;
      case 'Invoiced':
        return SellStatus.Despachando;
      case 'Shipped':
        return SellStatus.Despachado;
      case 'Canceled':
        return SellStatus.Cancelado;
      case 'Delivered':
      case 'Completed':
        return SellStatus.Entregue;
      default:
        return SellStatus.Processando;
    }
  }, []);

  const getDaysToShip = useCallback((orderUpdateDate: string) => {
    let orderDate = new Date(orderUpdateDate);
    const today = new Date();
    orderDate = addDays(orderDate, 2);

    return differenceInBusinessDays(orderDate, today);
  }, []);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setLoading(true);

    api
      .get(`${getOrderQueryPrefix()}?page=${page + 1}&limit=${rowsPerPage}`, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        },
      })
      .then(response => {
        setPage(newPage);
        setOrders(response.data.items);
        setLoading(false);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err);
        setLoading(false);
      });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setLoading(true);
    api
      .get(
        `${getOrderQueryPrefix()}?page=1&limit=${
          event.target.value
        }&search=${search}`,
        {
          headers: {
            authorization: token,
            shop_id: user.shopInfo._id,
          },
        },
      )
      .then(response => {
        setPage(0);
        if (response.status === 200) {
          setRowsPerPage(parseInt(event.target.value, 10));
          setOrders(response.data.items);
          setTotalItems(response.data.total);
        } else {
          setOrders([]);
          setTotalItems(0);
        }
        setLoading(false);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err);
        setLoading(false);
      });
  };

  const getOrderQueryPrefix = () => {
    let query;
    switch (status) {
      case SellStatus.Processando:
        query = '/order/status/pending';
        break;
      case SellStatus.Faturando:
        query = '/order/status/approved';
        break;
      case SellStatus.Despachando:
        query = '/order/status/invoiced';
        break;
      case SellStatus.Despachado:
        query = '/order/status/shipped';
        break;
      case SellStatus.Cancelado:
        query = '/order/status/canceled';
        break;
      case SellStatus.Entregue:
        query = '/order/status/delivered';
        break;
      default:
        query = '/order/all';
    }
    return query;
  };

  return (
    <div className={styles.sellsContainer}>
      <span className={styles.aviso}> Prazo de despacho: 2 dias úteis </span>
      <span className={styles.aviso}>
        Uso obrigatório da etiqueta de despacho da B2W, Mercado Livre e Shopee
        que estará disponível após o anexo da Nota Fiscal
      </span>
      <br />
      <div className={styles.sellsHeader}>
        <BulletedButton
          onClick={() => {
            loadOrders();
            setStatus(SellStatus.Todos);
          }}
          isActive={status === SellStatus.Todos}
        >
          Todas
        </BulletedButton>
        <BulletedButton
          onClick={() => {
            getOrdersByStatus('pending');
            setStatus(SellStatus.Processando);
          }}
          isActive={status === SellStatus.Processando}
        >
          Aguardando Pagamento
        </BulletedButton>
        <BulletedButton
          onClick={() => {
            getOrdersByStatus('approved');
            setStatus(SellStatus.Faturando);
          }}
          isActive={status === SellStatus.Faturando}
        >
          Aguardando Faturamento
        </BulletedButton>
        <BulletedButton
          onClick={() => {
            getOrdersByStatus('invoiced');
            setStatus(SellStatus.Despachando);
          }}
          isActive={status === SellStatus.Despachando}
        >
          Aguardando Despacho
        </BulletedButton>
        <BulletedButton
          onClick={() => {
            getOrdersByStatus('shipped');
            setStatus(SellStatus.Despachado);
          }}
          isActive={status === SellStatus.Despachado}
        >
          Despachados
        </BulletedButton>
        <BulletedButton
          onClick={() => {
            getOrdersByStatus('delivered');
            setStatus(SellStatus.Entregue);
          }}
          isActive={status === SellStatus.Entregue}
        >
          Entregues & Concluídos
        </BulletedButton>
        <BulletedButton
          onClick={() => {
            getOrdersByStatus('canceled');
            setStatus(SellStatus.Cancelado);
          }}
          isActive={status === SellStatus.Cancelado}
        >
          Cancelados
        </BulletedButton>
      </div>
      <div className={styles.divider} />
      <div className={styles.sellsContent}>
        <div className={styles.sellsOptions}>
          <div className={styles.contentFilters}>
            <Button
              isActive={filter === Filter.Hoje}
              onClick={() => setFilter(Filter.Hoje)}
            >
              Hoje
            </Button>
            <Button
              isActive={filter === Filter.Semana}
              onClick={() => setFilter(Filter.Semana)}
            >
              Esta semana
            </Button>
            <Button
              isActive={filter === Filter.Mes}
              onClick={() => setFilter(Filter.Mes)}
            >
              Últimos 30 dias
            </Button>
            <div>
              <Button
                icon={FiCalendar}
                isActive={filter === Filter.Período}
                onClick={() => {
                  setFilter(Filter.Período);
                  setDatePickerVisibility(!datePickerVisibility);
                }}
              >
                Escolher período
              </Button>

              {filter === Filter.Período && (
                <DatePickerPopup
                  formRef={datePickerRef}
                  setToDateFilter={setToDateFilter}
                  setFromDateFilter={setFromDateFilter}
                  style={{
                    marginBottom: '-13.25rem',
                  }}
                  className={styles.datePopupContainer}
                  visibility={datePickerVisibility}
                  setVisibility={setDatePickerVisibility}
                />
              )}
            </div>
            <Button onClick={() => setFilter(Filter.Todos)}>
              Remover Filtro
            </Button>
          </div>
          <TablePagination
            component="div"
            count={totalItems}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Pedidos por página"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count}`
            }
          />
        </div>
        {status === SellStatus.Todos && (
          <div className={styles.orderStatusButtons}>
            <StatusPanel
              title="Todos"
              onClick={() => setOrderStatus(OrderStatus.Todos)}
              isActive={orderStatus === OrderStatus.Todos}
            >
              <span className={styles.grayText}> {total} </span>
            </StatusPanel>
            <StatusPanel
              title="Aprovados"
              onClick={() => setOrderStatus(OrderStatus.Aprovado)}
              isActive={orderStatus === OrderStatus.Aprovado}
            >
              <span className={styles.greenText}> {totalApproved} </span>
            </StatusPanel>
            <StatusPanel
              title="Processando"
              onClick={() => setOrderStatus(OrderStatus.Processando)}
              isActive={orderStatus === OrderStatus.Processando}
            >
              <span className={styles.blueText}> {totalProcessing} </span>
            </StatusPanel>
            <StatusPanel
              title="Cancelados"
              onClick={() => setOrderStatus(OrderStatus.Cancelado)}
              isActive={orderStatus === OrderStatus.Cancelado}
            >
              <span className={styles.redText}> {totalCanceled} </span>
            </StatusPanel>
            <InfoPanel
              style={{ marginLeft: 'auto' }}
              title="Tempo médio de envio"
              icon={FiAlertCircle}
              warning={daysUntilDelivery > 2 && orders.length > 0}
              warningMessage={
                <span>
                  Devido a média de entrega estar acima de 2 dias
                  <br /> sua loja está sujeita a punições!
                </span>
              }
            >
              <span
                style={
                  daysUntilDelivery > 2 && orders.length > 0
                    ? { color: 'var(--red-100)' }
                    : {}
                }
              >
                {' '}
                {orders.length > 0 ? daysUntilDelivery : '--'}{' '}
                {daysUntilDelivery > 1 ? 'dias' : 'dia'}{' '}
              </span>
            </InfoPanel>
            <StatusPanel
              title={daysUntilDelivery > 1 ? 'Atrados' : 'Atrasado'}
              altAlign
              onClick={() => setOrderStatus(OrderStatus.Atrasado)}
              isActive={orderStatus === OrderStatus.Atrasado}
              style={
                totalDelayed > 0 && orderStatus !== OrderStatus.Atrasado
                  ? {
                      backgroundColor: 'var(--red-100-40)',
                      color: 'var(--white)',
                    }
                  : {}
              }
            >
              <span
                className={
                  totalDelayed > 0 && orderStatus !== OrderStatus.Atrasado
                    ? styles.whiteText
                    : ''
                }
              >
                {' '}
                {totalDelayed}{' '}
              </span>
            </StatusPanel>
          </div>
        )}
        {items.length > 0 ? (
          <>
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
                  <tr
                    className={styles.tableItem}
                    key={item._id}
                    ref={itemsRef[i]}
                  >
                    <td width="10%">{item.order.reference.id}</td>
                    <td id={styles.itemsCell}>
                      {item.order.products.map(
                        (product, j) =>
                          j <= 2 && <p key={product.sku}>{product.name}</p>,
                      )}
                      {item.order.products.length > 3 && (
                        <Collapsible
                          totalItems={item.order.products.length}
                          toggleRef={
                            collapsibleRefs ? collapsibleRefs[i] : undefined
                          }
                        >
                          {item.order.products.map(product => (
                            <p key={product.sku}>{product.name}</p>
                          ))}
                        </Collapsible>
                      )}
                    </td>
                    <td id={styles.dateCell}>
                      {format(
                        new Date(item.order.payment.purchaseDate),
                        'dd/MM/yyyy',
                      )}
                    </td>
                    <td id={styles.valueCell}>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(item.order.payment.totalAmountPlusShipping)}
                    </td>
                    <td width="12.5%" className={styles.statusCell}>
                      {item.order.status.status !== 'Shipped' &&
                      item.order.status.status !== 'Delivered' &&
                      item.order.status.status !== 'Completed' &&
                      item.order.status.status !== 'Canceled' &&
                      item.order.status.status !== 'Pending' &&
                      !!item.order.payment.paymentDate &&
                      getDaysToShip(
                        item.order.payment?.approvedDate ||
                          item.order.payment.paymentDate,
                      ) <= 2 ? (
                        <div className={styles.shippmentWarning}>
                          <FiAlertTriangle
                            style={
                              getDaysToShip(
                                item.order.payment?.approvedDate ||
                                  item.order.payment.paymentDate,
                              ) >= 0
                                ? { color: 'var(--yellow-300)' }
                                : { color: 'var(--red-300)' }
                            }
                            onMouseOver={e => {
                              setOpenTooltip(true);
                              setTooltipItem(item.order);
                              setToolTipYOffset(e.pageY);
                              setToolTipXOffset(e.pageX);
                            }}
                            onMouseOut={() => {
                              setOpenTooltip(false);
                            }}
                          />
                          <span
                            style={
                              getDaysToShip(
                                item.order.payment?.approvedDate ||
                                  item.order.payment.paymentDate,
                              ) >= 0
                                ? { color: 'var(--yellow-300)' }
                                : { color: 'var(--red-300)' }
                            }
                          >
                            {getOrderStatus(item.order.status.status)}
                          </span>
                        </div>
                      ) : (
                        getOrderStatus(item.order.status.status)
                      )}
                    </td>
                    <td
                      id={
                        status === SellStatus.Faturando ||
                        status === SellStatus.Despachando
                          ? styles.attachmentCell
                          : styles.actionCell
                      }
                    >
                      {status === SellStatus.Faturando && (
                        <AttachButton
                          name={item._id}
                          title="Anexo de NF-e"
                          attachedText="NF-e Anexada"
                          unattachedText="Anexar NF-e"
                          placeholder="Informe a URL da NF-e"
                          // isAttached={!!item.order.orderNotes && item.order.orderNotes.length > 0} //!item.nfe_url
                          isAttached={item.order.status.status === 'Invoiced'}
                          onClick={() => {
                            if (item.order.status.status === 'Approved') {
                              setNfeModalOpen(true);
                              setNfeItem(item);
                            }
                          }}
                        />
                      )}
                      {status === SellStatus.Despachando && (
                        <>
                          <AttachButton
                            name={item._id}
                            title="Código de envio"
                            attachedText="Código de Envio"
                            unattachedText="Informar código"
                            placeholder="Informe o código de envio"
                            // handleAttachment={handleAttachment}
                            // isAttached={!!item.order.orderNotes} //!item.nfe_url
                            isAttached={item.order.status.status === 'Shipped'}
                            onClick={() => {
                              if (item.order.status.status === 'Invoiced') {
                                setTrackingModalOpen(true);
                                setTrackingItem(item);
                              }
                            }}
                          />
                          {(item.order.reference.system.source ===
                            shoppeeStore ||
                            item.order.reference.system.source ===
                              mercadoLivreStore ||
                            item.order.reference.system.source ===
                              b2wStore) && (
                            <AttachButton
                              style={{ marginTop: '1rem' }}
                              name={item._id}
                              title="Etiqueta de envio"
                              attachedText="Etiqueta de envio"
                              unattachedText="Etiqueta de envio"
                              isAttached={true}
                              placeholder={''}
                              type="button"
                              alterIcon={FiDownload}
                              onClick={async () => {
                                setLoading(true);

                                return await api
                                  .get(
                                    `order/${item.order.reference.id}/shippingLabel`,
                                    {
                                      headers: {
                                        authorization: token,
                                        shop_id: user.shopInfo._id,
                                      },
                                    },
                                  )
                                  .then(response => {
                                    setLoading(false);

                                    if (!response.data.data.url) {
                                      handleModalMessage(true, {
                                        message: [
                                          'Etiqueta não pode ser encontrada.',
                                          'Por favor, tente novamente mais tarde.',
                                        ],
                                        title: 'Etiqueta não encontrada',
                                        type: 'other',
                                      });

                                      return;
                                    }

                                    window.open(
                                      response.data.data.url,
                                      '_blank',
                                    );
                                  })
                                  .catch(err => {
                                    // eslint-disable-next-line no-console
                                    console.log(err);

                                    setLoading(false);

                                    handleModalMessage(true, {
                                      message: [
                                        'Etiqueta não pode ser encontrada.',
                                        'Por favor, tente novamente mais tarde.',
                                      ],
                                      title: 'Etiqueta não encontrada',
                                      type: 'error',
                                    });

                                    return;
                                  });
                              }}
                            ></AttachButton>
                          )}
                        </>
                      )}
                      {status !== SellStatus.Faturando &&
                        status !== SellStatus.Despachando && (
                          <>
                            {status === SellStatus.Despachado &&
                              (item.order.reference.system.source ===
                                shoppeeStore ||
                                item.order.reference.system.source ===
                                  mercadoLivreStore ||
                                item.order.reference.system.source ===
                                  b2wStore) && (
                                <AttachButton
                                  style={{ marginBottom: '1rem' }}
                                  name={item._id}
                                  title="Etiqueta de envio"
                                  attachedText="Etiqueta de envio"
                                  unattachedText="Etiqueta de envio"
                                  isAttached={true}
                                  placeholder={''}
                                  type="button"
                                  alterIcon={FiDownload}
                                  onClick={async () => {
                                    setLoading(true);

                                    return await api
                                      .get(
                                        `order/${item.order.reference.id}/shippingLabel`,
                                        {
                                          headers: {
                                            authorization: token,
                                            shop_id: user.shopInfo._id,
                                          },
                                        },
                                      )
                                      .then(response => {
                                        setLoading(false);

                                        if (!response.data.data.url) {
                                          handleModalMessage(true, {
                                            message: [
                                              'Etiqueta não pode ser encontrada.',
                                              'Por favor, tente novamente mais tarde.',
                                            ],
                                            title: 'Etiqueta não encontrada',
                                            type: 'other',
                                          });

                                          return;
                                        }

                                        window.open(
                                          response.data.data.url,
                                          '_blank',
                                        );
                                      })
                                      .catch(err => {
                                        setLoading(false);

                                        handleModalMessage(true, {
                                          message: [
                                            'Etiqueta não pode ser encontrada.',
                                            'Por favor, tente novamente mais tarde.',
                                          ],
                                          title: 'Etiqueta não encontrada',
                                          type: 'error',
                                        });

                                        // eslint-disable-next-line no-console
                                        console.log(err);
                                      });
                                  }}
                                ></AttachButton>
                              )}

                            <button
                              type="button"
                              className={styles.action}
                              onClick={() => {
                                setOrderModalOpen(true);
                                setModalOrder(item.order);
                              }}
                            >
                              {' '}
                              Ver detalhes{' '}
                            </button>
                          </>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rowsPerPage < totalItems && (
              <TablePagination
                component="div"
                count={totalItems}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Produtos por página"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count}`
                }
              />
            )}
          </>
        ) : (
          <span className={styles.emptyList}>
            {' '}
            Nenhum item foi encontrado.
            {filter !== 5 && (
              <p>
                {' '}
                (Filtrando por {'"'}
                <b>{Filter[filter].toLowerCase()}</b>
                {'"'}. Experimente{' '}
                <a href="#" onClick={() => setFilter(Filter.Todos)}>
                  remover o filtro
                </a>
                .)
              </p>
            )}
          </span>
        )}
      </div>
      {openTooltip && tooltipItem && (
        <HoverTooltip
          closeTooltip={() => setOpenTooltip(false)}
          offsetY={toolTipYOffset}
          offsetX={toolTipXOffset}
        >
          <div
            className={
              getDaysToShip(
                tooltipItem.payment.approvedDate ||
                  tooltipItem.payment.paymentDate,
              ) >= 0
                ? styles.yellowText
                : styles.redText
            }
          >
            {getDaysToShip(
              tooltipItem.payment.approvedDate ||
                tooltipItem.payment.paymentDate,
            ) >= 1 && (
              <span>
                {getDaysToShip(
                  tooltipItem.payment.approvedDate ||
                    tooltipItem.payment.paymentDate,
                )}{' '}
                dias p/ despachar
              </span>
            )}
            {getDaysToShip(
              tooltipItem.payment.approvedDate ||
                tooltipItem.payment.paymentDate,
            ) === 0 && <span>Último dia p/ despachar</span>}
            {getDaysToShip(
              tooltipItem.payment.approvedDate ||
                tooltipItem.payment.paymentDate,
            ) < 0 && <span>Despacho atrasado!</span>}
          </div>
        </HoverTooltip>
      )}
      {isNfeModalOpen && nfeItem && (
        <Modal
          handleVisibility={() => {
            setNfeModalOpen(false);
          }}
          title="Anexar NF-e"
          icon={FiPaperclip}
        >
          <NfeModalContent
            item={nfeItem}
            closeModal={() => setNfeModalOpen(false)}
            onNfeSent={loadOrders}
          />
        </Modal>
      )}
      {isTrackingModalOpen && trackingItem && (
        <Modal
          handleVisibility={() => {
            setTrackingModalOpen(false);
          }}
          title="Anexar Rastreio"
          icon={FiPaperclip}
        >
          <TrackingModalContent
            item={trackingItem}
            closeModal={() => setTrackingModalOpen(false)}
            onTrackSent={loadOrders}
          />
        </Modal>
      )}
      {showMessage && (
        <MessageModal handleVisibility={handleModalVisibility}>
          <div className={styles.modalContent}>
            {modalMessage.type === 'success' && (
              <FiCheck style={{ color: 'var(--green-100)' }} />
            )}
            {modalMessage.type === 'error' && (
              <FiX style={{ color: 'var(--red-100)' }} />
            )}
            {modalMessage.type === 'other' && (
              <FiInfo style={{ color: 'var(--gray-300)' }} />
            )}
            <p className={styles.title}>{modalMessage.title}</p>
            {modalMessage.message.map(message => (
              <p key={message} className={styles.messages}>
                {message}
              </p>
            ))}
          </div>
        </MessageModal>
      )}
      {isOrderModalOpen && modalOrder && (
        <OrderDetailsModal
          handleVisibility={handleOrderModalVisibility}
          order={modalOrder}
        />
      )}
      {isLoading && (
        <div className={styles.loadingContainer}>
          <Loader />
        </div>
      )}
    </div>
  );
};

// export const getStaticProps: GetStaticProps = async ({ }) => {
//   const sells = ordersFromApi //ordersFromApi.sort((a, b) => a.date < b.date ? -1 : 1)

//   return ({
//     props: { sells },
//     revalidate: 10
//   })
// }

export default Sells;
