import { keccak256, toUtf8Bytes } from "ethers";
import {
  CreateOrder,
  OrderMethod,
  OrderMethodPayload,
  OrderType,
  PreCreateOrder,
  PreparedOrderMethod,
} from "./types";

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

export function makeOrder(preOrder: PreCreateOrder): CreateOrder {
  return {
    ...preOrder,
    traderChain: BigInt(preOrder.traderChain),
    merchantChain: BigInt(preOrder.merchantChain),
    currency: keccak256(toUtf8Bytes(preOrder.currency)),
    paymentMethod: keccak256(toUtf8Bytes(preOrder.paymentMethod)),
    quantity: BigInt(preOrder.quantity * 1e18),
    expiry: BigInt(preOrder.expiry),
    duration: BigInt(preOrder.duration),
  };
}

export function orderToJson(order: CreateOrder) {
  return JSON.stringify({
    ...order,
    traderChain: Number(order.traderChain),
    merchantChain: Number(order.merchantChain),
    quantity: order.quantity.toString(),
    expiry: Number(order.expiry),
    duration: Number(order.duration),
  });
}

export function makeOrderMethod(
  methodPayload: OrderMethodPayload,
): PreparedOrderMethod {
  return {
    orderHash: methodPayload.orderHash,
    method: methodPayload.method,
    expiry: BigInt(methodPayload.expiry),
  };
}
