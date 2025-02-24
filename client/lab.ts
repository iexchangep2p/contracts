import { Wallet, recoverAddress } from "ethers";
import {
  createOrderMethodTypedDataHash,
  createOrderTypedDataHash,
  iexDomain,
  iexDomainHash,
  orderSigChain,
  signOrder,
  signOrderMethod,
} from "./lib";
import { makeOrder, makeOrderMethod } from "./mock";
import {
  OrderMethod,
  OrderMethodPayload,
  OrderType,
  PreCreateOrder,
  PreparedOrderMethod,
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
  const orderType: OrderType = OrderType.sell;
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
  const order = makeOrder(preOrder);

  const sigchain = orderSigChain(order);
  const domain = iexDomain(sigchain, process.env.DUMMY_P2P!);

  const domainHash = iexDomainHash(domain);

  const orderHash = createOrderTypedDataHash(order, domain);

  const traderSig = await signOrder(traderWallet, order, domain);
  const merchantSig = await signOrder(merchantWallet, order, domain);
  const traderAddress = recoverAddress(orderHash, traderSig);

  const merchantAddress = recoverAddress(orderHash, merchantSig);

  const methodPayload: OrderMethodPayload = {
    orderHash,
    method: OrderMethod.pay,
    expiry,
  };
  const payOrderMethod: PreparedOrderMethod = makeOrderMethod(methodPayload);
  const payOrderHash = createOrderMethodTypedDataHash(payOrderMethod, domain);
  const payOrderSig = await signOrderMethod(
    traderWallet,
    payOrderMethod,
    domain
  );
  const addressFromHash = recoverAddress(payOrderHash, payOrderSig);

  const all = [
    preOrder,
    { domainHash, orderHash },
    { traderSig, merchantSig },
    methodPayload,
    { payOrderHash, payOrderSig },
    {
      addressFromHash: addressFromHash == trader,
      merchantAddress: merchant == merchantAddress,
      traderAddress: trader == traderAddress,
    },
  ];
  console.log(JSON.stringify(all));
})();
