import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiAlertTriangle, FiCalendar, FiCheck, FiClipboard, FiMoreHorizontal, FiPaperclip, FiSearch, FiX } from 'react-icons/fi'
import { FormHandles } from '@unform/core'
import { addDays, differenceInBusinessDays, format, isSameWeek, isToday, subDays } from 'date-fns'
import { Form } from '@unform/web'

import Button from '../../components/PrimaryButton'
import FilterButton from '../../components/FilterButton'

import FilterInput from '../../components/FilterInput'
import StatusPanel from '../../components/OrderStatusPanel'

import styles from './styles.module.scss'
import DatePickerPopup from '../../components/DatePickerPopup'
import Collapsible from '../../components/Collapsible'
import HeaderDropdown from 'src/components/HeaderDropdown'
import AttachButton from 'src/components/AttachButton'
import { useAuth } from 'src/hooks/auth'
import { useLoading } from 'src/hooks/loading'
import { useModalMessage } from 'src/hooks/message'
import Modal from 'src/components/Modal'
import NfeModalContent from 'src/components/NfeModalContent'
import MessageModal from 'src/components/MessageModal'
import { Order, OrderParent, OrderStatusType } from 'src/shared/types/order'
import api from 'src/services/api'
import { BiPackage } from 'react-icons/bi'
import OrderDetailsModal from 'src/components/OrderDetailsModal'
import TrackingModalContent from 'src/components/TrackingModalContent'
import { InOrderStatus, OrderContainsProduct } from 'src/shared/functions/sells'
import { OrderStatus } from 'src/shared/enums/order'
import { useRouter } from 'next/router'
import { MdOutlineLocalShipping } from 'react-icons/md'

enum SellStatus {
  // 'Pending' | 'Approved' | 'Invoiced' | 'Shipped' | 'Delivered' | 'Canceled' | 'Completed'
  Entregue = 'Entregue',
  Processando = 'Processando',
  Cancelado = 'Cancelado',
  Faturando = 'Aprovado',
  Despachado = 'Despachado',
  Despachando = 'Despachando',
  Todos = '?'
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

interface SearchFormData {
  search: string
}

interface SellsProps {
  sells: OrderParent[]
}

interface Totals {
  totalApproved: number
  totalProcessing: number
  totalCanceled: number
  total: number
}

export function Sells() {
  const [orders, setOrders] = useState([] as OrderParent[])
  const [items, setItems] = useState([] as OrderParent[])
  const [status, setStatus] = useState(SellStatus.Todos as SellStatus)
  const [orderStatus, setOrderStatus] = useState(OrderStatus.Todos as OrderStatus)

  const [fromDateFilter, setFromDateFilter] = useState(new Date())
  const [toDateFilter, setToDateFilter] = useState(new Date())
  const [filter, setFilter] = useState(Filter.Mes)
  const [search, setSeacrh] = useState('')

  const itemsRef = useMemo(() => Array(items.length).fill(0).map(i => React.createRef<HTMLTableRowElement>()), [items])
  const collapsibleRefs = useMemo(() => items.length > 2 && Array(items.length).fill(0).map(i => React.createRef<HTMLDivElement>()), [items])

  const [totalApproved, setTotalApproved] = useState('Carregando...')
  const [totalProcessing, setTotalProcessing] = useState('Carregando...')
  const [totalCanceled, setTotalCanceled] = useState('Carregando...')
  const [totalReturned, setTotalReturned] = useState('Carregando...')
  const [total, setTotal] = useState('Carregando...')

  const { user, token, updateUser } = useAuth()
  const { isLoading, setLoading } = useLoading()
  const { showModalMessage: showMessage, modalMessage, handleModalMessage } = useModalMessage()

  const [isNfeModalOpen, setNfeModalOpen] = useState(false)
  const [nfeItem, setNfeItem] = useState<OrderParent>()

  const [isTrackingModalOpen, setTrackingModalOpen] = useState(false)
  const [trackingItem, setTrackingItem] = useState<OrderParent>()

  const [modalOrder, setModalOrder] = useState<Order>()
  const [isOrderModalOpen, setOrderModalOpen] = useState(false)

  const router = useRouter()

  const inInterval = useCallback((order: Order) => {

    const date: Date = new Date(order.payment.purchaseDate)
    date.setHours(0)
    date.setMinutes(0)
    date.setMilliseconds(0)

    switch (filter) {
      case Filter.Semana:
        return isSameWeek(date, new Date())

      case Filter.Mes:
        const today = new Date()
        today.setHours(0)
        today.setMinutes(0)
        today.setMilliseconds(0)

        return date.getTime() >= subDays(today, 31).getTime() && date.getTime() <= today.getTime()

      case Filter.Custom:
        return format(date, 'yyyy/MM/dd') <= format(toDateFilter, 'yyyy/MM/dd') && format(date, 'yyyy/MM/dd') >= format(fromDateFilter, 'yyyy/MM/dd')

      default:
        return isToday(date)
    }
  }, [status, fromDateFilter, toDateFilter, filter])

  const loadOrders = useCallback(() => {
    setLoading(true)

    api.get('/account/detail').then(response => {
      updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: response.data.shopInfo._id, userId: response.data.shopInfo.userId } })

      api.get('/order/all', {
        headers: {
          authorization: token,
          shop_id: response.data.shopInfo._id,
        }
      }).then(response => {
        // console.log('Orders:')
        // console.log(JSON.stringify(response.data))

        setOrders(response.data as OrderParent[])

        // response.data.map((order: OrderParent) => {

        // })

        setLoading(false)
      }).catch(err => {
        console.log(err)
        setLoading(false)
      })
    }).catch(err => {
      setLoading(false)

      console.log(err)
      router.push('/')
    })
  }, [user])

  useEffect(() => {
    // setOrders(ordersFromApi)
    loadOrders()
  }, [])


  useEffect(() => {
    const totals = orders.reduce((accumulator: Totals, orderParent: OrderParent) => {
      const order = orderParent.order
      if (inInterval(order)) {
        switch (order.status.status) {
          case 'Completed':
          case 'Delivered':
          case 'Invoiced':
          case 'Shipped':
            accumulator.totalApproved += order.payment.totalAmountPlusShipping
            accumulator.total += order.payment.totalAmountPlusShipping
            break
          case 'Approved':
          case 'Pending':
            accumulator.totalProcessing += order.payment.totalAmountPlusShipping
            accumulator.total += order.payment.totalAmountPlusShipping
            break
          case 'Canceled':
            accumulator.totalCanceled += order.payment.totalAmountPlusShipping
            accumulator.total -= order.payment.totalAmountPlusShipping
            break
        }
      }

      return accumulator
    }, { totalApproved: 0, totalCanceled: 0, totalProcessing: 0, total: 0 })

    setTotalApproved(new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totals.totalApproved))

    setTotalProcessing(new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totals.totalProcessing))

    setTotalCanceled(new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totals.totalCanceled))

    setTotal(new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totals.total))
  }, [orders, orderStatus, fromDateFilter, toDateFilter, filter])

  const formRef = useRef<FormHandles>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const newItems = orders.filter((orderParent) => {
      const order = orderParent.order

      switch (status) {
        case SellStatus.Processando:
          return inInterval(order) && (order.status.status === 'Pending') && (search === '' || OrderContainsProduct(order, search))
        case SellStatus.Faturando:
          return inInterval(order) && (order.status.status === 'Approved') && (search === '' || OrderContainsProduct(order, search))
        case SellStatus.Despachando:
          return inInterval(order) && (order.status.status === 'Invoiced') && (search === '' || OrderContainsProduct(order, search))
        case SellStatus.Despachado:
          return inInterval(order) && (order.status.status === 'Shipped') && (search === '' || OrderContainsProduct(order, search))
        case SellStatus.Cancelado:
          return inInterval(order) && (order.status.status === 'Canceled') && (search === '' || OrderContainsProduct(order, search))
        case SellStatus.Entregue:
          return inInterval(order) && (order.status.status === 'Delivered' || order.status.status === 'Completed')
            && (search === '' || OrderContainsProduct(order, search))

        default:
          return inInterval(order) && InOrderStatus(order, orderStatus) && (search === '' || OrderContainsProduct(order, search))
      }
    })

    setItems(newItems)
  }, [orders, status, orderStatus, fromDateFilter, toDateFilter, search, filter])

  const handleSubmit = useCallback(
    async (data: SearchFormData) => {
      try {
        formRef.current?.setErrors({})

        if (data.search !== search) {
          setSeacrh(data.search)
        }

      } catch (err) {
        setError('Ocorreu um erro ao fazer login, cheque as credenciais.')
      }
    },
    [search],
  )

  const handleModalVisibility = useCallback(() => {
    handleModalMessage(false)
  }, [])

  const handleOrderModalVisibility = useCallback(() => {
    setOrderModalOpen(false)
  }, [])


  const handleAttachment = useCallback(async (data: any) => {

  }, [items])

  const datePickerRef = useRef<FormHandles>(null)
  const [datePickerVisibility, setDatePickerVisibility] = useState(false)

  const getOrderStatus = useCallback((orderStatus: OrderStatusType) => {
    switch (orderStatus) {
      case 'Pending':
        return SellStatus.Processando
      case 'Approved':
        return SellStatus.Faturando
      case 'Invoiced':
        return SellStatus.Despachando
      case 'Shipped':
        return SellStatus.Despachado
      case 'Canceled':
        return SellStatus.Cancelado
      case 'Delivered':
      case 'Completed':
        return SellStatus.Entregue
    }
  }, [])

  const getDaysToShip = useCallback((orderUpdateDate: string) => {
    let orderDate = new Date(orderUpdateDate)
    const today = new Date()
    orderDate = addDays(orderDate, 2)

    return differenceInBusinessDays(orderDate, today)
  }, [])

  return (
    <>
      <div className={status !== SellStatus.Todos ? styles.sellsContainer : styles.sellsContainerShorter}>
        <div className={styles.sellsHeader}>
          <HeaderDropdown items={[
            { text: 'Todas', value: SellStatus.Todos },
            { text: 'Aguardando Pagamento', value: SellStatus.Processando },
            { text: 'Aguardando Faturamento', value: SellStatus.Faturando },
            { text: 'Aguardando Despacho', value: SellStatus.Despachando },
            { text: 'Despachado', value: SellStatus.Despachado },
            { text: 'Entregues & Concluídos', value: SellStatus.Entregue },
          ]}
            setActiveItem={setStatus} />
        </div>
        <div className={styles.divider} />
        <div className={styles.sellsContent}>
          <div className={styles.sellsOptions}>
            <div className={styles.contentFilters}>
              <FilterButton isActive={filter === Filter.Hoje} onClick={() => setFilter(Filter.Hoje)}>
                Hoje
              </FilterButton>
              <FilterButton isActive={filter === Filter.Semana} onClick={() => setFilter(Filter.Semana)}>
                Esta semana
              </FilterButton>
              <FilterButton isActive={filter === Filter.Mes} onClick={() => setFilter(Filter.Mes)}>
                Últimos 30 dias
              </FilterButton>
              <div>
                <FilterButton
                  icon={FiCalendar}
                  isActive={filter === Filter.Custom}
                  onClick={() => {
                    setFilter(Filter.Custom)
                    setDatePickerVisibility(!datePickerVisibility)
                  }}>
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
                      marginLeft: '-11rem'
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
          {items.length > 0 ? (
            <div>
              {items.map((item, i) => (
                <div className={styles.itemCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.start}>
                      <FiClipboard />
                      Pedido: <b>{item._id}</b>
                    </span>
                    <span className={styles.end}>
                      <FiCalendar />
                      {format(new Date(item.order.payment.purchaseDate), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div className={styles.cardDivider} />
                  <div className={styles.cardBody}>
                    <div className={styles.products}>
                      <span style={{ marginBottom: '0.5rem' }}><b>Produtos</b></span>
                      {
                        item.order.products.map((product, i) => {
                          return (i < 2 && <p key={i}>{product.name}</p>)
                        })
                      }
                      {
                        item.order.products.length > 2 && (
                          <>
                            <Collapsible totalItems={item.order.products.length} toggleRef={!!collapsibleRefs ? collapsibleRefs[i] : undefined}>
                              {
                                item.order.products.map((product, i) => {
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
                    </div>
                    {
                      getOrderStatus(item.order.status.status) === SellStatus.Entregue && (
                        <div className={styles.approvedItem}>
                          <FiCheck />
                          Entregue
                        </div>
                      )
                    }
                    {
                      getOrderStatus(item.order.status.status) === SellStatus.Processando && (
                        <div className={styles.processingItem}>
                          <FiMoreHorizontal />
                          Proceesando
                        </div>
                      )
                    }
                    {
                      getOrderStatus(item.order.status.status) === SellStatus.Faturando && (
                        <div className={styles.processingItem}>
                          <FiMoreHorizontal />
                          Faturando
                        </div>
                      )
                    }
                    {
                      getOrderStatus(item.order.status.status) === SellStatus.Despachando && (
                        <div className={styles.processingItem}>
                          <BiPackage />
                          Despachando
                        </div>
                      )
                    }
                    {
                      getOrderStatus(item.order.status.status) === SellStatus.Despachado && (
                        <div className={styles.approvedItem}>
                          <MdOutlineLocalShipping />
                          Despachado
                        </div>
                      )
                    }
                    {
                      getOrderStatus(item.order.status.status) === SellStatus.Cancelado && (
                        <div className={styles.canceledItem}>
                          <FiX />
                          Cancelado
                        </div>
                      )
                    }
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
                    <span>Valor: {
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }
                      ).format(item.order.payment.totalAmountPlusShipping)
                    }
                    </span>

                    {
                      (item.order.status.status !== 'Shipped' && item.order.status.status !== 'Delivered' &&
                        item.order.status.status !== 'Completed' && item.order.status.status !== 'Canceled' &&
                        (!!item.order.payment.paymentDate && getDaysToShip(item.order.payment.paymentDate) <= 2)) && (
                        <div className={styles.shippmentWarning} style={getDaysToShip(item.order.payment.paymentDate) >= 0 ? { color: 'var(--yellow-300)' } : { color: 'var(--red-300)' }}>
                          <FiAlertTriangle />
                          {
                            getDaysToShip(item.order.payment.paymentDate) >= 1 &&
                            <span>{getDaysToShip(item.order.payment.paymentDate)} dias p/ despachar</span>
                          }
                          {
                            getDaysToShip(item.order.payment.paymentDate) === 0 &&
                            <span>Último dia p/ despachar</span>
                          }
                          {
                            getDaysToShip(item.order.payment.paymentDate) < 0 &&
                            <span>Despache atrasado!</span>
                          }
                        </div>
                      )
                    }

                    {status === SellStatus.Faturando ?
                      <AttachButton
                        name={item._id}
                        title='Anexo de NF-e'
                        attachedText='NF-e Anexada'
                        unattachedText='Anexar NF-e'
                        placeholder='Informe a URL da NF-e'
                        // isAttached={!!item.order.orderNotes && item.order.orderNotes.length > 0} //!item.nfe_url
                        isAttached={item.order.status.status === 'Invoiced'}
                        onClick={() => {
                          if (item.order.status.status === 'Approved') {
                            setNfeModalOpen(true)
                            setNfeItem(item)

                            return
                          }
                        }}
                      />
                      :
                      status === SellStatus.Despachando ?
                        <AttachButton
                          name={item._id}
                          title='Código de envio'
                          attachedText='Código de Envio'
                          unattachedText='Informar código'
                          placeholder='Informe o código de envio'
                          // handleAttachment={handleAttachment}
                          // isAttached={!!item.order.orderNotes} //!item.nfe_url
                          isAttached={item.order.status.status === 'Shipped'}
                          onClick={() => {
                            if (item.order.status.status === 'Invoiced') {
                              setTrackingModalOpen(true)
                              setTrackingItem(item)
                            }
                          }}
                        />
                        :
                        <Button
                          className={styles.detailsButton}
                          onClick={() => {
                            setOrderModalOpen(true)
                            setModalOrder(item.order)
                          }}
                        > Ver detalhes </Button>
                    }
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className={styles.emptyList}> Nenhum item foi encontrado </span>
          )}
        </div>
        {status === SellStatus.Todos && (
          <div className={styles.sellsFooter}>
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
            </div>
          </div>
        )}
      </div>
      {
        (isNfeModalOpen && nfeItem) && (
          <Modal
            handleVisibility={() => { setNfeModalOpen(false) }}
            title='Anexar NF-e'
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
            handleVisibility={() => { setTrackingModalOpen(false) }}
            title='Anexar Rastreio'
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
              {modalMessage.message.map((message, i) => <p key={i} className={styles.messages}>{message}</p>)}
            </div>
          </MessageModal>
        )
      }
      {
        (isOrderModalOpen && modalOrder) && (
          <OrderDetailsModal handleVisibility={handleOrderModalVisibility} order={modalOrder} />
        )
      }
    </>
  )
}

// export const getStaticProps: GetStaticProps = async ({ }) => {
//   const sells = ordersFromApi.sort((a, b) => a.date < b.date ? -1 : 1)

//   return ({
//     props: { sells },
//     revalidate: 10
//   })
// }

export default Sells
