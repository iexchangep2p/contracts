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
import {
  makeOrder,
  makeOrderMethod,
  orderToJson,
  sameChainOrder,
} from "./mock";
import {
  OrderMethod,
  OrderMethodPayload,
  OrderType,
  PreCreateOrder,
} from "./types";
import "dotenv/config";

(async () => {
  const traderWallet = new Wallet(process.env.DUMMY_TRADER!);
  const merchantWallet = new Wallet(process.env.DUMMY_MERCHANT!);
  const trader: string = traderWallet.address;
  const merchant: string = merchantWallet.address;
  const token: string = process.env.DUMMY_TOKEN!;
  const currency: string = "GHS";
  const paymentMethod: string = "Fidelity Bank";
  const quantity: number = 1000;
  const orderType: OrderType = OrderType.buy;
  const chain: number = parseInt(process.env.DUMMY_CHAIN!);
  const expiry = Math.floor(Date.now() / 1000) + 60 * 15;
  const duration = 1800;
  const preOrder: PreCreateOrder = {
    trader,
    merchant,
    token,
    currency,
    paymentMethod,
    quantity,
    orderType,
    traderChain: chain,
    merchantChain: chain,
    expiry,
    duration,
  };
  console.log("preOrder", JSON.stringify(preOrder));
  const order = makeOrder(preOrder);

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
  console.log("Trader Signature", traderSig);
  console.log("Merchant Signature", merchantSig);
  const traderAddress = recoverAddress(orderHash, traderSig);
  console.log("traderAddress", trader, traderAddress);

  const merchantAddress = recoverAddress(orderHash, merchantSig);
  console.log("merchantAddress", merchant, merchantAddress);

  const payOrderMethod: OrderMethodPayload = makeOrderMethod(
    orderHash,
    OrderMethod.pay
  );
  console.log("payOrderMethod", JSON.stringify(payOrderMethod));
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
