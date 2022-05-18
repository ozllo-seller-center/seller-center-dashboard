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
  FiClipboard,
  FiDownload,
  FiMoreHorizontal,
  FiPaperclip,
  FiSearch,
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
import { Form } from '@unform/web';

import HeaderDropdown from 'src/components/HeaderDropdown';
import AttachButton from 'src/components/AttachButton';
import { useAuth } from 'src/hooks/auth';
import { useLoading } from 'src/hooks/loading';
import { useModalMessage } from 'src/hooks/message';
import Modal from 'src/components/Modal';
import NfeModalContent from 'src/components/NfeModalContent';
import MessageModal from 'src/components/MessageModal';
import { Order, OrderParent, OrderStatusType } from 'src/shared/types/order';
import api from 'src/services/api';
import { BiPackage } from 'react-icons/bi';
import OrderDetailsModal from 'src/components/OrderDetailsModal';
import TrackingModalContent from 'src/components/TrackingModalContent';
import {
  getDaysToShip,
  InOrderStatus,
  OrderContainsProduct,
} from 'src/shared/functions/sells';
import OrderStatus from 'src/shared/enums/order';
import { useRouter } from 'next/router';
import { MdOutlineLocalShipping } from 'react-icons/md';
import { Filter, SellStatus } from 'src/shared/enums/sells';
import Loader from 'src/components/Loader';
import Collapsible from '../../components/Collapsible';
import DatePickerPopup from '../../components/DatePickerPopup';
import styles from './styles.module.scss';
import StatusPanel from '../../components/OrderStatusPanel';
import FilterInput from '../../components/FilterInput';
import FilterButton from '../../components/FilterButton';
import Button from '../../components/PrimaryButton';
import InfoPanel from 'src/components/InfoPanel';
import InfoPanelMobile from 'src/components/InfoPanelMobile';
import {
  b2wStore,
  mercadoLivreStore,
  shoppeeStore,
} from 'src/shared/consts/sells';

interface SearchFormData {
  search: string;
}

interface Totals {
  totalApproved: number;
  totalProcessing: number;
  totalCanceled: number;
  totalDelayed: number;
  total: number;
}

export const SellsMobile: React.FC = () => {
  const [orders, setOrders] = useState([] as OrderParent[]);
  const [items, setItems] = useState([] as OrderParent[]);
  const [status, setStatus] = useState(SellStatus.Todos as SellStatus);
  const [orderStatus, setOrderStatus] = useState(
    OrderStatus.Todos as OrderStatus,
  );

  const [fromDateFilter, setFromDateFilter] = useState(new Date());
  const [toDateFilter, setToDateFilter] = useState(new Date());
  const [filter, setFilter] = useState(Filter.Mes);
  // const [search, setSeacrh] = useState('');

  const [totalDelayed, setTotalDelayed] = useState(0);
  const [daysUntilDelivery, setDaysUntilDelivery] = useState(0);

  const collapsibleRefs = useMemo(
    () =>
      items.length > 2 &&
      Array(items.length)
        .fill(0)
        .map(() => React.createRef<HTMLDivElement>()),
    [items],
  );

  const [totalApproved, setTotalApproved] = useState('Carregando...');
  const [totalProcessing, setTotalProcessing] = useState('Carregando...');
  const [totalCanceled, setTotalCanceled] = useState('Carregando...');
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

  const router = useRouter();

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
          (filter === Filter.Custom &&
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
        console.log(err);
        setDaysUntilDelivery(0);

        setLoading(false);
      });
  }, [orders, filter, setLoading, token, user, toDateFilter, fromDateFilter]);

  const loadOrders = useCallback(() => {
    setLoading(true);

    api
      .get('/order/all', {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        },
      })
      .then(response => {
        const ords: OrderParent[] = response.data;

        setOrders(ords);

        // setOrders(response.data as OrderParent[]);

        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, [user, token, setLoading]);

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

        case Filter.Custom:
          return (
            format(date, 'yyyy/MM/dd') <= format(toDateFilter, 'yyyy/MM/dd') &&
            format(date, 'yyyy/MM/dd') >= format(fromDateFilter, 'yyyy/MM/dd')
          );

        default:
          return isToday(date);
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
            !!order.payment.paymentDate &&
            getDaysToShip(order.payment.paymentDate) < 0
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

  return (
    <>
      <div
        className={
          status !== SellStatus.Todos
            ? styles.sellsContainer
            : styles.sellsContainerShorter
        }
      >
        <div className={styles.sellsHeader}>
          <HeaderDropdown
            items={[
              { text: 'Todas', value: SellStatus.Todos },
              { text: 'Aguardando Pagamento', value: SellStatus.Processando },
              { text: 'Aguardando Faturamento', value: SellStatus.Faturando },
              { text: 'Aguardando Despacho', value: SellStatus.Despachando },
              { text: 'Despachado', value: SellStatus.Despachado },
              { text: 'Entregues & Concluídos', value: SellStatus.Entregue },
            ]}
            setActiveItem={setStatus}
          />
        </div>
        <div className={styles.divider} />
        <div className={styles.sellsContent}>
          <div className={styles.sellsOptions}>
            <div className={styles.contentFilters}>
              <FilterButton
                isActive={filter === Filter.Hoje}
                onClick={() => setFilter(Filter.Hoje)}
              >
                Hoje
              </FilterButton>
              <FilterButton
                isActive={filter === Filter.Semana}
                onClick={() => setFilter(Filter.Semana)}
              >
                Esta semana
              </FilterButton>
              <FilterButton
                isActive={filter === Filter.Mes}
                onClick={() => setFilter(Filter.Mes)}
              >
                Últimos 30 dias
              </FilterButton>
              <div>
                <FilterButton
                  icon={FiCalendar}
                  isActive={filter === Filter.Custom}
                  onClick={() => {
                    setFilter(Filter.Custom);
                    setDatePickerVisibility(!datePickerVisibility);
                  }}
                >
                  Escolher período
                </FilterButton>

                {filter === Filter.Custom && (
                  <DatePickerPopup
                    formRef={datePickerRef}
                    setToDateFilter={setToDateFilter}
                    setFromDateFilter={setFromDateFilter}
                    style={{
                      // marginBottom: '-13.25rem',
                      marginTop: '-3rem',
                      marginLeft: '-11rem',
                    }}
                    className={styles.datePopupContainer}
                    visibility={datePickerVisibility}
                    setVisibility={setDatePickerVisibility}
                  />
                )}
              </div>
              {/* <Form
                ref={formRef}
                onSubmit={handleSubmit}
                className={styles.searchContainer}
              >
                <FilterInput
                  name="search"
                  icon={FiSearch}
                  placeholder="Pesquise um produto..."
                  autoComplete="off"
                />
              </Form> */}
            </div>
            <InfoPanelMobile
              title="Tempo médio de envio"
              icon={FiAlertCircle}
              warning={
                daysUntilDelivery > 2 &&
                orders.length > 0 &&
                filter !== Filter.Custom
              }
              warningMessage={
                <span>
                  Devido a média de entrega estar acima de 2 dias sua loja está
                  sujeita a punições!
                </span>
              }
            >
              <span
                style={
                  daysUntilDelivery > 2 && Filter.Custom && orders.length > 0
                    ? { color: 'var(--red-100)' }
                    : {}
                }
              >
                {' '}
                {!Filter.Custom && orders.length > 0
                  ? daysUntilDelivery
                  : '--'}{' '}
                dias{' '}
              </span>
            </InfoPanelMobile>
          </div>
          {items.length > 0 ? (
            <div>
              {items.map((item, i) => (
                <div key={item._id} className={styles.itemCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.start}>
                      <FiClipboard />
                      Pedido: <b>{item.order.reference.id}</b>
                    </span>
                    <span className={styles.end}>
                      <FiCalendar />
                      {format(
                        new Date(item.order.payment.purchaseDate),
                        'dd/MM/yyyy',
                      )}
                    </span>
                  </div>
                  <div className={styles.cardDivider} />
                  <div className={styles.cardBody}>
                    <div className={styles.products}>
                      <span style={{ marginBottom: '0.5rem' }}>
                        <b>Produtos</b>
                      </span>
                      {item.order.products.map(
                        (product, j) =>
                          j <= 2 && (
                            <p key={product.idProduct}>{product.name}</p>
                          ),
                      )}
                      {item.order.products.length > 3 && (
                        <Collapsible
                          totalItems={item.order.products.length}
                          toggleRef={
                            collapsibleRefs ? collapsibleRefs[i] : undefined
                          }
                        >
                          {item.order.products.map(product => (
                            <p key={product.idProduct}>{product.name}</p>
                          ))}
                        </Collapsible>
                      )}
                    </div>
                    {getOrderStatus(item.order.status.status) ===
                      SellStatus.Entregue && (
                      <div className={styles.approvedItem}>
                        <FiCheck />
                        Entregue
                      </div>
                    )}
                    {getOrderStatus(item.order.status.status) ===
                      SellStatus.Processando && (
                      <div className={styles.processingItem}>
                        <FiMoreHorizontal />
                        Proceesando
                      </div>
                    )}
                    {getOrderStatus(item.order.status.status) ===
                      SellStatus.Faturando && (
                      <div className={styles.processingItem}>
                        <FiMoreHorizontal />
                        Faturando
                      </div>
                    )}
                    {getOrderStatus(item.order.status.status) ===
                      SellStatus.Despachando && (
                      <div className={styles.processingItem}>
                        <BiPackage />
                        Despachando
                      </div>
                    )}
                    {getOrderStatus(item.order.status.status) ===
                      SellStatus.Despachado && (
                      <div className={styles.approvedItem}>
                        <MdOutlineLocalShipping />
                        Despachado
                      </div>
                    )}
                    {getOrderStatus(item.order.status.status) ===
                      SellStatus.Cancelado && (
                      <div className={styles.canceledItem}>
                        <FiX />
                        Cancelado
                      </div>
                    )}
                    {/* FIXME: Determinar o status de retornado no back-end
                     {
                      getOrderStatus(item.order.status.status) === SellStatus.Retornado && (
                        <div className={styles.returnedItem}>
                          <RiArrowGoBackFill />
                          Retornado
                        </div>
                      )
                    } */}
                  </div>
                  <div className={styles.cardDivider} />
                  <div className={styles.cardFooter}>
                    <span>
                      Valor:{' '}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(item.order.payment.totalAmountPlusShipping)}
                    </span>

                    {item.order.status.status !== 'Shipped' &&
                      item.order.status.status !== 'Delivered' &&
                      item.order.status.status !== 'Completed' &&
                      item.order.status.status !== 'Canceled' &&
                      !!item.order.payment.paymentDate &&
                      getDaysToShip(item.order.payment.paymentDate) <= 2 && (
                        <div
                          className={styles.shippmentWarning}
                          style={
                            getDaysToShip(item.order.payment.paymentDate) >= 0
                              ? { color: 'var(--yellow-300)' }
                              : { color: 'var(--red-300)' }
                          }
                        >
                          <FiAlertTriangle />
                          {getDaysToShip(item.order.payment.paymentDate) >=
                            1 && (
                            <span>
                              {getDaysToShip(item.order.payment.paymentDate)}{' '}
                              dias p/ despachar
                            </span>
                          )}
                          {getDaysToShip(item.order.payment.paymentDate) ===
                            0 && <span>Último dia p/ despachar</span>}
                          {getDaysToShip(item.order.payment.paymentDate) <
                            0 && <span>Despache atrasado!</span>}
                        </div>
                      )}

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
                      <div className={styles.multipleButtons}>
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
                        {(item.order.reference.system.source === shoppeeStore ||
                          item.order.reference.system.source ===
                            mercadoLivreStore ||
                          item.order.reference.system.source === b2wStore) && (
                          <AttachButton
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

                                  window.open(response.data.data.url, '_blank');
                                })
                                .catch(err => {
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
                      </div>
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

                                      console.log(err);
                                    });
                                }}
                              ></AttachButton>
                            )}
                          <Button
                            className={styles.detailsButton}
                            onClick={() => {
                              setOrderModalOpen(true);
                              setModalOrder(item.order);
                            }}
                          >
                            {' '}
                            Ver detalhes{' '}
                          </Button>
                        </>
                      )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className={styles.emptyList}>
              {' '}
              Nenhum item foi encontrado{' '}
            </span>
          )}
        </div>
        {status === SellStatus.Todos && (
          <div className={styles.sellsFooter}>
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
              <StatusPanel
                title="Atrasados"
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
          </div>
        )}
      </div>
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
            {modalMessage.type === 'success' ? (
              <FiCheck style={{ color: 'var(--green-100)' }} />
            ) : (
              <FiX style={{ color: 'var(--red-100)' }} />
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
    </>
  );
};

// export const getStaticProps: GetStaticProps = async ({ }) => {
//   const sells = ordersFromApi.sort((a, b) => a.date < b.date ? -1 : 1)

//   return ({
//     props: { sells },
//     revalidate: 10
//   })
// }

export default SellsMobile;
