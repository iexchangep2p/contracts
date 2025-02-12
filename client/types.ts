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
  traderChain: BigInt;
  merchantChain: BigInt;
  token: string;
  currency: string;
  paymentMethod: string;
  orderType: OrderType;
  quantity: BigInt;
  expiry: BigInt;
  duration: BigInt;
};

export enum OrderMethod {
  accept,
  pay,
  release,
  cancel,
  appeal,
}

export type OrderMethodPayload = {
  orderHash: string;
  method: OrderMethod;
  expiry: BigInt;
};
