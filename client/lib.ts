import {
  keccak256,
  Signer,
  toUtf8Bytes,
  TypedDataDomain,
  TypedDataEncoder,
} from "ethers";
import { CreateOrder, OrderType } from "./types";

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

export function createOrderHash(
  order: CreateOrder,
  verifyingContract: string,
  chainId: number
): string {
  return TypedDataEncoder.hash(
    iexDomain(chainId, verifyingContract),
    encodedCreateOrder().types,
    order
  );
}

export function iexDomain(
  chainId: number,
  verifyingContract: string
): TypedDataDomain {
  return {
    chainId,
    verifyingContract,
    name: keccak256(toUtf8Bytes("IExchange P2P Protocol")),
    version: keccak256(toUtf8Bytes("v2")),
  };
}

export async function signOrder(
  order: CreateOrder,
  signer: Signer,
  chainId: number,
  verifyingContract: string
): Promise<string> {
  return signer.signTypedData(
    iexDomain(chainId, verifyingContract),
    encodedCreateOrder().types,
    order
  );
}

export function orderSigChain(order: CreateOrder): number {
  if (order.orderType == OrderType.buy) {
    return Number(order.traderChain);
  } else {
    return Number(order.merchantChain);
  }
}
