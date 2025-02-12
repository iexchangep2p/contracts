import {
  Wallet,
  keccak256,
  recoverAddress,
  toUtf8Bytes,
  verifyTypedData,
} from "ethers";
import * as ethers from "ethers";
import {
  createOrderMethodTypedDataHash,
  createOrderTypedDataHash,
  iexDomain,
  iexDomainHash,
  orderSigChain,
  signOrder,
  signOrderMethod,
} from "./lib";
import { makeOrderMethod, sameChainOrder } from "./mock";
import { OrderMethod, OrderMethodPayload, OrderType } from "./types";
import "dotenv/config";

(async () => {
  const traderWallet = new Wallet(process.env.DUMMY_TRADER!);
  const merchantWallet = new Wallet(process.env.DUMMY_MERCHANT!);
  const trader: string = traderWallet.address;
  const merchant: string = merchantWallet.address;
  const token: string = process.env.DUMMY_TOKEN!;
  const currency: string = keccak256(toUtf8Bytes("GHS"));
  const paymentMethod: string = keccak256(toUtf8Bytes("MTN"));
  const quantity: number = 1000;
  const orderType: OrderType = OrderType.buy;

  const order = sameChainOrder(
    trader,
    merchant,
    token,
    currency,
    paymentMethod,
    quantity,
    orderType
  );

  const sigchain = orderSigChain(order);
  const domain = iexDomain(sigchain, process.env.DUMMY_P2P!);

  const domainHash = iexDomainHash(domain);
  console.log(
    "domainHash",
    domainHash,
    ethers.TypedDataEncoder.hashDomain(domain)
  );

  const orderHash = createOrderTypedDataHash(order, domain);
  console.log("orderHash", orderHash);

  const traderSig = await signOrder(traderWallet, order, domain);
  const merchantSig = await signOrder(merchantWallet, order, domain);
  console.log("Create Order Sigs", traderSig, merchantSig);

  const traderAddress = recoverAddress(orderHash, traderSig);
  console.log("traderAddress", trader, traderAddress);

  const merchantAddress = recoverAddress(orderHash, merchantSig);
  console.log("merchantAddress", merchant, merchantAddress);

  const payOrderMethod: OrderMethodPayload = makeOrderMethod(
    orderHash,
    OrderMethod.pay
  );
  const payOrderHash = createOrderMethodTypedDataHash(payOrderMethod, domain);
  console.log("payOrderHash", payOrderHash);
  const payOrderSig = await signOrderMethod(
    traderWallet,
    payOrderMethod,
    domain
  );
  console.log("payOrderSig", payOrderSig);
  const addressFromHash = recoverAddress(payOrderHash, payOrderSig);
  console.log(addressFromHash, trader);
})();
