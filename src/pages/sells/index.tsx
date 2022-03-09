import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  FiAlertTriangle, FiCalendar, FiCheck, FiPaperclip, FiX,
} from 'react-icons/fi';

import { FormHandles } from '@unform/core';
import {
  addDays, differenceInBusinessDays, format, isSameWeek, isToday, subDays,
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

interface Totals {
  totalApproved: number
  totalProcessing: number
  totalCanceled: number
  total: number
}

const Sells: React.FC = () => {
  const [orders, setOrders] = useState([] as OrderParent[]);
  const [items, setItems] = useState([] as OrderParent[]);
  const [status, setStatus] = useState(SellStatus.Todos as SellStatus);
  const [orderStatus, setOrderStatus] = useState(OrderStatus.Todos as OrderStatus);

  const [fromDateFilter, setFromDateFilter] = useState(new Date());
  const [toDateFilter, setToDateFilter] = useState(new Date());

  const [filter, setFilter] = useState(Filter.Mes);
  const [search, setSeacrh] = useState('');

  const itemsRef = useMemo(() => Array(items.length).fill(0).map((i) => React.createRef<HTMLTableRowElement>()), [items]);
  const collapsibleRefs = useMemo(() => items.length > 2 && Array(items.length).fill(0).map((i) => React.createRef<HTMLDivElement>()), [items]);

  const [totalApproved, setTotalApproved] = useState('Carregando...');
  const [totalProcessing, setTotalProcessing] = useState('Carregando...');
  const [totalCanceled, setTotalCanceled] = useState('Carregando...');
  const [total, setTotal] = useState('Carregando...');

  const { user, token, updateUser } = useAuth();
  const { isLoading, setLoading } = useLoading();
  const { showModalMessage: showMessage, modalMessage, handleModalMessage } = useModalMessage();

  const [isNfeModalOpen, setNfeModalOpen] = useState(false);
  const [nfeItem, setNfeItem] = useState<OrderParent>();

  const [isTrackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingItem, setTrackingItem] = useState<OrderParent>();

  const [modalOrder, setModalOrder] = useState<Order>();
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);

  const [openTooltip, setOpenTooltip] = useState(false);
  const [toolTipYOffset, setToolTipYOffset] = useState(0);
  const [toolTipXOffset, setToolTipXOffset] = useState(0);

  const loadOrders = useCallback(() => {
    setLoading(true);

    api.get('/order/all', {
      headers: {
        authorization: token,
        shop_id: user.shopInfo._id,
      },
    }).then((response) => {
      const ords: OrderParent[] = response.data;

      ords.forEach((order) => {
        const products = order.order.products;

        products.push(products[0]);
        products.push(products[0]);
      });

      setOrders(ords);

      console.log(ords);

      // setOrders(response.data as OrderParent[]);

      setLoading(false);
    }).catch((err) => {
      console.log(err);
      setLoading(false);
    });
  }, [user, token, setLoading]);

  useEffect(() => {
    // setOrders(ordersFromApi)
    setLoading(true);

    api.get('/account/detail').then((response) => {
      updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: response.data.shopInfo._id, userId: response.data.shopInfo.userId } });

      loadOrders();
    }).catch((err) => {
      setLoading(false);

      console.log(err);
      router.push('/');
    });
  }, []);

  const inInterval = useCallback((order: Order) => {
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

        return date.getTime() >= subDays(today, 31).getTime() && date.getTime() <= today.getTime();

      case Filter.Custom:
        return format(date, 'yyyy/MM/dd') <= format(toDateFilter, 'yyyy/MM/dd') && format(date, 'yyyy/MM/dd') >= format(fromDateFilter, 'yyyy/MM/dd');

      default:
        return isToday(date);
    }
  }, [fromDateFilter, toDateFilter, filter]);

  useEffect(() => {
    const totals = orders.reduce((accumulator: Totals, orderParent: OrderParent) => {
      const { order } = orderParent;
      if (inInterval(order)) {
        switch (order.status.status) {
          case 'Completed':
          case 'Delivered':
          case 'Invoiced':
          case 'Shipped':
            accumulator.totalApproved += order.payment.totalAmountPlusShipping;
            accumulator.total += order.payment.totalAmountPlusShipping;
            break;
          case 'Approved':
          case 'Pending':
            accumulator.totalProcessing += order.payment.totalAmountPlusShipping;
            accumulator.total += order.payment.totalAmountPlusShipping;
            break;
          case 'Canceled':
            accumulator.totalCanceled += order.payment.totalAmountPlusShipping;
            accumulator.total += order.payment.totalAmountPlusShipping;
            break;
          default:
            break;
        }
      }

      return accumulator;
    }, {
      totalApproved: 0, totalCanceled: 0, totalProcessing: 0, total: 0,
    });

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

    setTotal(new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totals.total));
  }, [orders, orderStatus, fromDateFilter, toDateFilter, filter, inInterval]);

  useEffect(() => {
    const newItems = orders.filter((orderParent) => {
      const { order } = orderParent;

      switch (status) {
        case SellStatus.Processando:
          return inInterval(order) && (order.status.status === 'Pending');
        case SellStatus.Faturando:
          return inInterval(order) && (order.status.status === 'Approved');
        case SellStatus.Despachando:
          return inInterval(order) && (order.status.status === 'Invoiced');
        case SellStatus.Despachado:
          return inInterval(order) && (order.status.status === 'Shipped');
        case SellStatus.Cancelado:
          return inInterval(order) && (order.status.status === 'Canceled');
        case SellStatus.Entregue:
          return inInterval(order) && (order.status.status === 'Delivered' || order.status.status === 'Completed');

        default:
          return inInterval(order) && InOrderStatus(order, orderStatus);
      }
    });

    setItems(newItems);
  }, [orders, status, orderStatus, fromDateFilter, toDateFilter, filter, inInterval]);

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

  return (
    <div className={styles.sellsContainer}>
      <span className={styles.aviso}> Prazo de despacho 2 dias úteis </span>
      <span className={styles.aviso}>Uso obrigatório da etiqueta de despacho da B2W, Mercado Livre e Shopee que chegará em seu email</span>
      <br />
      <div className={styles.sellsHeader}>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Todos)}
          isActive={status === SellStatus.Todos}
        >
          Todas
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Processando)}
          isActive={status === SellStatus.Processando}
        >
          Aguardando Pagamento
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Faturando)}
          isActive={status === SellStatus.Faturando}
        >
          Aguardando Faturamento
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Despachando)}
          isActive={status === SellStatus.Despachando}
        >
          Aguardando Despacho
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Despachado)}
          isActive={status === SellStatus.Despachado}
        >
          Despachados
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Entregue)}
          isActive={status === SellStatus.Entregue}
        >
          Entregues & Concluídos
        </BulletedButton>
        <BulletedButton
          onClick={() => setStatus(SellStatus.Cancelado)}
          isActive={status === SellStatus.Cancelado}
        >
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
            <Button isActive={filter === Filter.Semana} onClick={() => setFilter(Filter.Semana)}>
              Esta semana
            </Button>
            <Button isActive={filter === Filter.Mes} onClick={() => setFilter(Filter.Mes)}>
              Últimos 30 dias
            </Button>
            <div className={styles.verticalDivider} />
            <div>
              <Button
                icon={FiCalendar}
                isActive={filter === Filter.Custom}
                onClick={() => {
                  setFilter(Filter.Custom);
                  setDatePickerVisibility(!datePickerVisibility);
                }}
              >
                Escolher período

              </Button>

              {filter === Filter.Custom && (
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
          </div>
        </div>
        {status === SellStatus.Todos && (
          <div className={styles.orderStatusButtons}>
            <StatusPanel title="Todos" onClick={() => setOrderStatus(OrderStatus.Todos)} isActive={orderStatus === OrderStatus.Todos}>
              <span className={styles.grayText}>
                {' '}
                {total}
                {' '}
              </span>
            </StatusPanel>
            <StatusPanel title="Aprovados" onClick={() => setOrderStatus(OrderStatus.Aprovado)} isActive={orderStatus === OrderStatus.Aprovado}>
              <span className={styles.greenText}>
                {' '}
                {totalApproved}
                {' '}
              </span>
            </StatusPanel>
            <StatusPanel title="Processando" onClick={() => setOrderStatus(OrderStatus.Processando)} isActive={orderStatus === OrderStatus.Processando}>
              <span className={styles.blueText}>
                {' '}
                {totalProcessing}
                {' '}
              </span>
            </StatusPanel>
            <StatusPanel title="Cancelados" onClick={() => setOrderStatus(OrderStatus.Cancelado)} isActive={orderStatus === OrderStatus.Cancelado}>
              <span className={styles.redText}>
                {' '}
                {totalCanceled}
                {' '}
              </span>
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
                <tr className={styles.tableItem} key={item._id} ref={itemsRef[i]}>
                  <td width="10%">
                    {item.order.reference.id}
                  </td>
                  <td id={styles.itemsCell}>
                    {
                      item.order.products.map((product, j) => (j <= 2 && <p key={product.idProduct}>{product.name}</p>))
                    }
                    {
                      item.order.products.length > 3 && (
                        <Collapsible totalItems={item.order.products.length} toggleRef={collapsibleRefs ? collapsibleRefs[i] : undefined}>
                            {
                              item.order.products.map((product) => (
                                <p key={product.idProduct}>{product.name}</p>
                              ))
                            }
                        </Collapsible>
                      )
                    }
                  </td>
                  <td id={styles.dateCell}>
                    {format(new Date(item.order.payment.purchaseDate), 'dd/MM/yyyy')}
                  </td>
                  <td id={styles.valueCell}>
                    {
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(item.order.payment.totalAmountPlusShipping)
                    }
                  </td>
                  <td width="12.5%" className={styles.statusCell}>
                    {(item.order.status.status !== 'Shipped' && item.order.status.status !== 'Delivered'
                      && item.order.status.status !== 'Completed' && item.order.status.status !== 'Canceled'
                      && (!!item.order.payment.paymentDate && getDaysToShip(item.order.payment.paymentDate) <= 2)) ? (
                        <div className={styles.shippmentWarning}>
                          {/* {
                          getDaysToShip(item.order.status.updatedDate) >= 2 &&
                          <span>{getDaysToShip(item.order.status.updatedDate)} dias p/ despachar</span>
                        }
                        {
                          getDaysToShip(item.order.status.updatedDate) === 1 &&
                          <span>Último dia p/ despachar</span>
                        }
                        {
                          getDaysToShip(item.order.status.updatedDate) <= 0 &&
                          <span>Data de despacho vencida</span>
                        } */}
                          <FiAlertTriangle
                            style={getDaysToShip(item.order.payment.paymentDate) >= 0 ? { color: 'var(--yellow-300)' } : { color: 'var(--red-300)' }}
                            onMouseOver={(e) => {
                              setOpenTooltip(true);
                              setToolTipYOffset(e.pageY);
                              setToolTipXOffset(e.pageX);
                            }}
                            onMouseOut={(e) => { setOpenTooltip(false); }}
                          />
                          <span style={getDaysToShip(item.order.payment.paymentDate) >= 0 ? { color: 'var(--yellow-300)' } : { color: 'var(--red-300)' }}>{getOrderStatus(item.order.status.status)}</span>
                        </div>
                      ) : (getOrderStatus(item.order.status.status))}
                    {openTooltip && (
                      <HoverTooltip closeTooltip={() => setOpenTooltip(false)} offsetY={toolTipYOffset} offsetX={toolTipXOffset}>
                        <div className={getDaysToShip(item.order.payment.paymentDate) >= 0 ? styles.yellowText : styles.redText}>
                          {
                            getDaysToShip(item.order.payment.paymentDate) >= 1
                            && (
                            <span>
                              {getDaysToShip(item.order.payment.paymentDate)}
                              {' '}
                              dias p/ despachar
                            </span>
                            )
                          }
                          {
                            getDaysToShip(item.order.payment.paymentDate) === 0
                            && <span>Último dia p/ despachar</span>
                          }
                          {
                            getDaysToShip(item.order.payment.paymentDate) < 0
                            && <span>Despache atrasado!</span>
                          }
                        </div>
                      </HoverTooltip>
                    )}
                  </td>
                  <td id={status === SellStatus.Faturando || status === SellStatus.Despachando ? styles.attachmentCell : styles.actionCell}>
                    {status === SellStatus.Faturando
                      && (
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
                    {status === SellStatus.Despachando
                        && (
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
                        )}
                    {(status !== SellStatus.Faturando && status !== SellStatus.Despachando)
                    && (
                      <button
                        type="button"
                        className={styles.action}
                        onClick={() => {
                          setOrderModalOpen(true);
                          setModalOrder(item.order);
                        }}
                      >
                        {' '}
                        Ver detalhes
                        {' '}

                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <span className={styles.emptyList}> Nenhum item foi encontrado </span>
        )}
      </div>
      {
        (isNfeModalOpen && nfeItem) && (
          <Modal
            handleVisibility={() => { setNfeModalOpen(false); }}
            title="Anexar NF-e"
            icon={FiPaperclip}
          >
            <NfeModalContent
              item={nfeItem}
              closeModal={() => setNfeModalOpen(false)}
              onNfeSent={loadOrders}
            />
          </Modal>
        )
      }
      {
        (isTrackingModalOpen && trackingItem) && (
          <Modal
            handleVisibility={() => { setTrackingModalOpen(false); }}
            title="Anexar Rastreio"
            icon={FiPaperclip}
          >
            <TrackingModalContent
              item={trackingItem}
              closeModal={() => setTrackingModalOpen(false)}
              onTrackSent={loadOrders}
            />
          </Modal>
        )
      }
      {
        showMessage && (
          <MessageModal handleVisibility={handleModalVisibility}>
            <div className={styles.modalContent}>
              {modalMessage.type === 'success' ? <FiCheck style={{ color: 'var(--green-100)' }} /> : <FiX style={{ color: 'var(--red-100)' }} />}
              <p className={styles.title}>{modalMessage.title}</p>
              {modalMessage.message.map((message) => <p key={message} className={styles.messages}>{message}</p>)}
            </div>
          </MessageModal>
        )
      }
      {
        (isOrderModalOpen && modalOrder) && (
          <OrderDetailsModal handleVisibility={handleOrderModalVisibility} order={modalOrder} />
        )
      }
      {
        isLoading && (
          <div className={styles.loadingContainer}>
            <Loader />
          </div>
        )
      }
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
