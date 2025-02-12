import { CreateOrder, OrderMethod, OrderMethodPayload, OrderType } from "./types";

export function sameChainOrder(
  trader: string,
  merchant: string,
  token: string,
  currency: string,
  paymentMethod: string,
  quantity: number,
  orderType: OrderType,
  traderChain = 1,
  merchantChain = 1
): CreateOrder {
  const expiry = Math.floor(Date.now() / 1000) + 60 * 15;

  return {
    trader,
    merchant,
    traderChain: BigInt(traderChain),
    merchantChain: BigInt(merchantChain),
    token,
    currency,
    paymentMethod,
    orderType,
    quantity: BigInt(quantity * 1e18),
    expiry: BigInt(expiry),
    duration: BigInt(1800),
  };
}

export function makeOrderMethod(
  orderHash: string,
  method: OrderMethod
): OrderMethodPayload {
  const expiry = Math.floor(Date.now() / 1000) + 60 * 15;
  return  {
    orderHash,
    method,
    expiry: BigInt(expiry)
  }
}