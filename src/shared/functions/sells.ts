import OrderStatus from '../enums/order';
import { Order, OrderProduct } from '../types/order';

import { addDays, differenceInBusinessDays } from 'date-fns';

export function getDaysToShip(orderUpdateDate: string) {
  let orderDate = new Date(orderUpdateDate);
  const today = new Date();
  orderDate = addDays(orderDate, 2);

  return differenceInBusinessDays(orderDate, today);
}

export function InOrderStatus(order: Order, filter: OrderStatus): boolean {
  switch (filter) {
    case OrderStatus.Aprovado:
      return (
        order.status.status === 'Delivered' ||
        order.status.status === 'Completed' ||
        order.status.status === 'Invoiced' ||
        order.status.status === 'Shipped'
      );
    case OrderStatus.Cancelado:
      return order.status.status === 'Canceled';
    case OrderStatus.Processando:
      return (
        order.status.status === 'Approved' || order.status.status === 'Pending'
      );
    case OrderStatus.Atrasado:
      return (
        order.status.status !== 'Shipped' &&
        order.status.status !== 'Delivered' &&
        order.status.status !== 'Completed' &&
        order.status.status !== 'Canceled' &&
        !!order.payment.paymentDate &&
        getDaysToShip(order.payment.paymentDate) < 0
      );
    default:
      break;
  }

  return true;
}

export function OrderContainsProduct(order: Order, search: string): boolean {
  const contains = order.products.reduce(
    (accumulator: number, product: OrderProduct) => {
      accumulator += product.name.toLowerCase().includes(search.toLowerCase())
        ? 1
        : 0;
      return accumulator;
    },
    0,
  );

  return !!contains;
}
