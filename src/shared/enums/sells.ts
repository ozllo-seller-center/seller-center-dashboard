export enum SellStatus {
  // 'Pending' | 'Approved' | 'Invoiced' | 'Shipped' | 'Delivered' | 'Canceled' | 'Completed'
  Entregue = 'Entregue',
  Processando = 'Processando',
  Cancelado = 'Cancelado',
  Faturando = 'Aprovado',
  Despachado = 'Despachado',
  Despachando = 'Despachando',
  Atrasado = 'Atrasado',
  Todos = '?',
}

export enum Filter {
  Hoje = 0,
  Semana = 1,
  Mes = 3,
  Período = 4,
  Todos = 5,
}
