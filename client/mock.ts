import { CreateOrder, OrderType } from "./types";

export function sameChainOrder(
  trader: string,
  merchant: string,
  token: string,
  currency: string,
  paymentMethod: string,
  quantity: number,
  orderType: OrderType
): CreateOrder {
  const expiry = Math.floor(Date.now() / 1000) + 60 * 15;

  return {
    trader,
    merchant,
    traderChain: BigInt(1),
    merchantChain: BigInt(1),
    token,
    currency,
    paymentMethod,
    orderType,
    quantity: BigInt(quantity * 1e18),
    expiry: BigInt(expiry),
    duration: BigInt(1800),
  };
}
