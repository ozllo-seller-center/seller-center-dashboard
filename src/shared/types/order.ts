export type OrderAddress = {
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  additionalInfo: string;
  number: string;
};

export type OrderReference = {
  idTenant: number;
  store: string;
  id: number;
  virtual: string;
  source: string;
  system: {
    source: string;
  };
};

export type OrderShipping = {
  estimatedDeliveryDate: string;
  responsible: string;
  provider: string;
  service: string;
  price: number;
  receiverName: string;
  address: OrderAddress;
};

export type OrderPayment = {
  method: string;
  paymentDate: string;
  purchaseDate: string;
  approvedDate?: string;
  totalAmount: number;
  totalAmountPlusShipping: number;
  totalDiscount: number;
  installments: number;
  address: OrderAddress;
};

export type OrderStatusType =
  | 'Pending'
  | 'Approved'
  | 'Invoiced'
  | 'Shipped'
  | 'Delivered'
  | 'Canceled'
  | 'Completed';

export type OrderStatus = {
  status: OrderStatusType;
  updatedDate: string;
  active: boolean;
  message: string;
};

export type OrderCustomer = {
  name: string;
  documentNumber: string;
  telephone: string;
  mobileNumber: string;
  email: string;
};

export type OrderProduct = {
  idProduct: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  type: string;
};

export type OrderNote = {
  idUser: string;
  createDate: string;
  message: string;
};

export type OrderAdditionalInfo = {
  transferDate: string;
  transferAmount: number;
};

export type Order = {
  reference: OrderReference;
  shipping: OrderShipping;
  payment: OrderPayment;
  status: OrderStatus;
  customer: OrderCustomer;
  products: OrderProduct[];
  orderNotes: OrderNote[];
  orderAdditionalInfos: OrderAdditionalInfo[];
};

export type OrderParent = {
  _id: any;
  shop_id: string;
  order: Order;
};

export type OrderNFe = {
  key: string;
  issueDate: string;
  number: string;
  cfop: string;
  series: string;
  order: Order;
};

export type OrderInvoice = {
  code: string;
  shippingProvider: string;
  shippingService: string;
  shippingDate: string;
  link?: string;
};
