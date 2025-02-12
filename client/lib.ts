import {
  keccak256,
  Signer,
  toUtf8Bytes,
  TypedDataDomain,
  TypedDataEncoder,
  AbiCoder,
  concat,
} from "ethers";
import { CreateOrder, OrderMethodPayload, OrderType } from "./types";

export function iexDomain(
  chainId: number,
  verifyingContract: string
): TypedDataDomain {
  return {
    name: "IExchange P2P Protocol",
    version: "v2",
    chainId,
    verifyingContract,
  };
}

export function iexDomainHash(domain: TypedDataDomain): string {
  return TypedDataEncoder.hashDomain(domain);
}

// https://docs.ethers.org/v6/api/hashing/#TypedDataEncoder
export function encodedCreateOrder(): TypedDataEncoder {
  return new TypedDataEncoder({
    CreateOrder: [
      {
        name: "trader",
        type: "address",
      },
      {
        name: "merchant",
        type: "address",
      },
      {
        name: "traderChain",
        type: "uint256",
      },
      {
        name: "merchantChain",
        type: "uint256",
      },
      {
        name: "token",
        type: "address",
      },
      {
        name: "currency",
        type: "bytes32",
      },
      {
        name: "paymentMethod",
        type: "bytes32",
      },
      {
        name: "orderType",
        type: "uint8",
      },
      {
        name: "quantity",
        type: "uint256",
      },
      {
        name: "expiry",
        type: "uint256",
      },
      {
        name: "duration",
        type: "uint256",
      },
    ],
  });
}

// https://docs.ethers.org/v6/api/providers/#Signer-signTypedData
export async function signOrder(
  signer: Signer,
  order: CreateOrder,
  domain: TypedDataDomain
): Promise<string> {
  return signer.signTypedData(domain, encodedCreateOrder().types, order);
}

export function createOrderTypedDataHash(
  order: CreateOrder,
  domain: TypedDataDomain
): string {
  return TypedDataEncoder.hash(domain, encodedCreateOrder().types, order);
}

export function orderSigChain(order: CreateOrder): number {
  if (order.orderType == OrderType.buy) {
    return Number(order.traderChain);
  } else {
    return Number(order.merchantChain);
  }
}

// https://docs.ethers.org/v6/api/hashing/#TypedDataEncoder
export function encodedOrderMethodPayload(): TypedDataEncoder {
  return new TypedDataEncoder({
    OrderMethodPayload: [
      {
        name: "orderHash",
        type: "bytes32",
      },
      {
        name: "method",
        type: "uint8",
      },
      {
        name: "expiry",
        type: "uint256",
      },
    ],
  });
}

export function createOrderMethodTypedDataHash(
  orderMethod: OrderMethodPayload,
  domain: TypedDataDomain
): string {
  return TypedDataEncoder.hash(
    domain,
    encodedOrderMethodPayload().types,
    orderMethod
  );
}

export async function signOrderMethod(
  signer: Signer,
  orderMethod: OrderMethodPayload,
  domain: TypedDataDomain
): Promise<string> {
  return signer.signTypedData(
    domain,
    encodedOrderMethodPayload().types,
    orderMethod
  );
}
