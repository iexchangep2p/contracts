export enum OrderState {
  pending,
  accepted,
  paid,
  appealed,
  released,
  cancelled,
}

export enum OrderType {
  buy,
  sell,
}

export type CreateOrder = {
  trader: string;
  merchant: string;
  traderChain: number;
  merchantChain: number;
  token: string;
  currency: string;
  paymentMethod: string;
  orderType: OrderType;
  quantity: number;
  expiry: number;
  duration: number;
};
