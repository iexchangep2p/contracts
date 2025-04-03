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

export type PreCreateOrder = {
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

export enum OrderMethod {
  accept,
  pay,
  release,
  cancel,
  appeal,
  cancelAppeal,
  settleAppeal
}

export type OrderMethodPayload = {
  orderHash: string;
  method: OrderMethod;
  expiry: number;
};

export enum AppealDecision {
  unvoted,
  release,
  cancel,
}

export type PreparedOrderMethod = {
  orderHash: string;
  method: OrderMethod;
  expiry: BigInt;
};
