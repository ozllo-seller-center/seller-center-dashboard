import React, { useEffect, useState } from 'react';
import { Order } from 'src/shared/types/order';
import { BiPackage } from 'react-icons/bi';

import { FiCheck, FiMoreHorizontal, FiX } from 'react-icons/fi';
import format from 'date-fns/format';
import Modal from '../Modal';

import styles from './styles.module.scss';

interface OrderDetailsModalProps {
  handleVisibility: React.MouseEventHandler;
  order: Order;
}

enum OrderStatus {
  Entregue = 'Entregue',
  Processando = 'Processando',
  Cancelado = 'Cancelado',
  Faturando = 'Faturando',
  Despachado = 'Despachado',
  Despachando = 'Despachando',
  EmBranco = '',
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  handleVisibility,
  order,
}) => {
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(
    OrderStatus.EmBranco,
  );

  useEffect(() => {
    switch (order.status.status) {
      case 'Pending':
        setOrderStatus(OrderStatus.Processando);
        break;
      case 'Approved':
        setOrderStatus(OrderStatus.Faturando);
        break;
      case 'Invoiced':
        setOrderStatus(OrderStatus.Despachando);
        break;
      case 'Shipped':
        setOrderStatus(OrderStatus.Despachado);
        break;
      case 'Canceled':
        setOrderStatus(OrderStatus.Cancelado);
        break;
      case 'Delivered':
      case 'Completed':
        setOrderStatus(OrderStatus.Entregue);
        break;

      default:
        break;
    }
  }, [order]);

  return (
    <Modal
      handleVisibility={handleVisibility}
      title="Detalhes do pedido"
      cleanStyle
    >
      <div className={styles.container}>
        <div className={styles.normal}>
          <strong>Dados do pedido</strong>
          <div className={styles.content}>
            <div className={styles.info}>
              <div className={styles.column}>
                <strong>Código do pedido</strong>
                <span>{order.reference.source}</span>
                <strong>Vendido por</strong>
                <span>{order.reference.store}</span>
              </div>
              <div className={styles.column}>
                <strong>Data do pedido</strong>
                <span>
                  {format(new Date(order.payment.purchaseDate), 'dd/MM/yyyy')}
                </span>
                <strong>Enviado por</strong>
                <span>{order.shipping.provider}</span>
              </div>
            </div>
            <div className={styles.status}>
              <strong>Status</strong>
              {orderStatus === OrderStatus.Entregue && (
                <>
                  <FiCheck className={styles.green} />
                  <span className={styles.green}>{orderStatus}</span>
                </>
              )}
              {orderStatus === OrderStatus.Processando && (
                <>
                  <FiMoreHorizontal className={styles.blue} />
                  <span className={styles.blue}>{orderStatus}</span>
                </>
              )}
              {orderStatus === OrderStatus.Faturando && (
                <>
                  <FiMoreHorizontal className={styles.blue} />
                  <span className={styles.blue}>{orderStatus}</span>
                </>
              )}
              {orderStatus === OrderStatus.Despachando && (
                <>
                  <BiPackage className={styles.blue} />
                  <span className={styles.blue}>{orderStatus}</span>
                </>
              )}
              {orderStatus === OrderStatus.Despachado && (
                <>
                  <BiPackage className={styles.blue} />
                  <span className={styles.blue}>{orderStatus}</span>
                </>
              )}
              {orderStatus === OrderStatus.Cancelado && (
                <>
                  <FiX className={styles.red} />
                  <span className={styles.red}>{orderStatus}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className={styles.alt}>
          <strong>Dados do cliente</strong>
          <div className={styles.content}>
            <div className={styles.info}>
              <div className={styles.column}>
                <strong>Nome</strong>
                <span style={{ textTransform: 'capitalize' }}>
                  {order.customer.name.toLocaleLowerCase()}
                </span>
                <strong>CPF/CNPJ</strong>
                <span>{order.customer.documentNumber}</span>
              </div>
              <div className={styles.column}>
                <strong>E-mail</strong>
                <span>{order.customer.email}</span>
              </div>
              <div className={styles.column}>
                <strong>Telefone</strong>
                <span>{order.customer.telephone}</span>
                <strong>Celular</strong>
                <span>{order.customer.mobileNumber}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.normal}>
          <div className={styles.content}>
            <div className={styles.info}>
              <div className={styles.column}>
                <strong className={styles.subTitle}>Dados da entrega</strong>
                <strong>Recebedor</strong>
                <span style={{ textTransform: 'capitalize' }}>
                  {order.shipping.receiverName.toLocaleLowerCase()}
                </span>
                <strong>CEP</strong>
                <span>{order.shipping.address.zipCode}</span>
                <strong>Endereço</strong>
                <span>
                  {order.shipping.address.address}, nº
                  {order.shipping.address.number}
                </span>
                <span>{order.shipping.address.neighborhood}</span>
                <span>
                  {order.shipping.address.city} - {order.shipping.address.state}
                </span>
                {order.shipping.address.additionalInfo && (
                  <span>
                    Complemento: {order.shipping.address.additionalInfo}
                  </span>
                )}
              </div>
              <div className={styles.column}>
                <strong className={styles.subTitle}>Dados do envio</strong>
                <strong>Prestador</strong>
                <span>{order.shipping.provider?.toLocaleLowerCase()}</span>
                <strong>Serviço</strong>
                <span>{order.shipping.service}</span>
                <strong>Responsável</strong>
                <span>{order.shipping.responsible}</span>
                <strong>Previsão de entrega</strong>
                <span>
                  {order.shipping.estimatedDeliveryDate
                    ? format(
                        new Date(order.shipping.estimatedDeliveryDate),
                        'dd/MM/yyyy - hh:mm:ss',
                      )
                    : 'Sem previsão'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.alt}>
          <strong>Itens do pedido</strong>
          <div className={styles.content}>
            <div className={styles.products}>
              {order.products.map(product => (
                <div key={product.idProduct} className={styles.product}>
                  <strong className={styles.title}>Item</strong>
                  <span>{product.name}</span>
                  <div className={styles.details}>
                    <div>
                      <strong>Quantidade</strong>
                      <span>{product.quantity}</span>
                    </div>
                    <div>
                      <strong>Valor</strong>
                      <span>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(product.price)}
                      </span>
                    </div>
                    <div>
                      <strong>Desconto</strong>
                      <span>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(product.discount)}
                      </span>
                    </div>
                    <div>
                      <strong>Valor total</strong>
                      <span>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(
                          product.price * product.quantity - product.discount,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.normal}>
          <strong>Valor total do pedido</strong>
          <div className={styles.content}>
            <div className={styles.info}>
              <div className={styles.column}>
                <strong>Total dos itens</strong>
                <span>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(order.payment.totalAmount)}
                </span>
              </div>
              <div className={styles.column}>
                <strong>Total descontado</strong>
                <span>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(order.payment.totalDiscount)}
                </span>
              </div>
              <div className={styles.column}>
                <strong>Valor de envio</strong>
                <span>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(
                    order.payment.totalAmountPlusShipping -
                      order.payment.totalAmount,
                  )}
                </span>
              </div>
              <div className={styles.column}>
                <strong>Total do pedido</strong>
                <span>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(order.payment.totalAmountPlusShipping)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;
