import {
  Wallet,
  keccak256,
  recoverAddress,
  toUtf8Bytes,
  verifyTypedData,
} from "ethers";
import * as ethers from "ethers";
import {
  createOrderHash,
  createOrderMethodHash,
  encodedCreateOrder,
  encodedCreateOrderMethodPayload,
  iexDomain,
  orderSigChain,
  signOrder,
  signOrderMethod,
} from "./lib";
import { makeOrderMethod, sameChainOrder } from "./mock";
import { OrderMethod, OrderMethodPayload, OrderType } from "./types";
import "dotenv/config";

(async () => {
  // const traderWallet = new Wallet(process.env.DUMMY_TRADER!);
  // const merchantWallet = new Wallet(process.env.DUMMY_MERCHANT!);

  // const trader: string = traderWallet.address;
  // const merchant: string = merchantWallet.address;
  // const token: string = process.env.DUMMY_TOKEN!;
  // const currency: string = keccak256(toUtf8Bytes("GHS"));
  // const paymentMethod: string = keccak256(toUtf8Bytes("MTN"));
  // const quantity: number = 1000;
  // const orderType: OrderType = OrderType.buy;
  // const order = sameChainOrder(
  //   trader,
  //   merchant,
  //   token,
  //   currency,
  //   paymentMethod,
  //   quantity,
  //   orderType
  // );

  // const sigchain = orderSigChain(order);
  // const orderHash = createOrderHash(order, process.env.DUMMY_P2P!, sigchain);
  // console.log(orderHash);

  // const traderSig = await signOrder(
  //   order,
  //   traderWallet,
  //   sigchain,
  //   process.env.DUMMY_P2P!
  // );
  // const merchantSig = await signOrder(
  //   order,
  //   merchantWallet,
  //   sigchain,
  //   process.env.DUMMY_P2P!
  // );

  // console.log(traderSig, merchantSig);
  // const traderAddress = verifyTypedData(
  //   iexDomain(sigchain, process.env.DUMMY_P2P!),
  //   encodedCreateOrder().types,
  //   order,
  //   traderSig
  // );
  // console.log(trader, traderAddress);

  // const merchantAddress = verifyTypedData(
  //   iexDomain(sigchain, process.env.DUMMY_P2P!),
  //   encodedCreateOrder().types,
  //   order,
  //   merchantSig
  // );

  // console.log(merchantAddress, merchantAddress);

  // const payOrderMethod: OrderMethodPayload = makeOrderMethod(
  //   orderHash,
  //   OrderMethod.pay
  // );

  // const payOrderHash = createOrderMethodHash(
  //   payOrderMethod,
  //   process.env.DUMMY_P2P!,
  //   sigchain
  // );
  // console.log(payOrderHash);

  // const payOrderSig = await signOrderMethod(
  //   payOrderMethod,
  //   traderWallet,
  //   sigchain,
  //   process.env.DUMMY_P2P!
  // );
  // console.log(payOrderSig);

  // const addressFromHash = recoverAddress(payOrderHash, payOrderSig);
  // const addressFromSig = verifyTypedData(
  //   iexDomain(sigchain, process.env.DUMMY_P2P!),
  //   encodedCreateOrderMethodPayload().types,
  //   payOrderMethod,
  //   payOrderSig
  // );
  // console.log(addressFromHash, addressFromSig, trader);

  const domain = {
    chainId: 31337,
    verifyingContract: "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
    name: "0x03c29967dc1ec387c86cb32e2d942a047a54b4d2a64b4fea68f9345b7f8089da",
    version:
      "0xf9446b8e937d86f0bc87cac73923491692b123ca5f8761908494703758206adf",
  };
  const TYPE_HASH = ethers.keccak256(
    ethers.toUtf8Bytes(
      "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    )
  );
  const coder = new ethers.AbiCoder();
  const hashdDomain = ethers.keccak256(
    coder.encode(
      ["bytes32", "bytes32", "bytes32", "uint256", "address"],
      [
        TYPE_HASH,
        domain.name,
        domain.version,
        domain.chainId,
        domain.verifyingContract,
      ]
    )
  );
  console.log("hashdDomain", hashdDomain);

  const hashDomainWithEthers = ethers.TypedDataEncoder.hashDomain(domain);

  console.log("hashDomainWithEthers", hashDomainWithEthers);
})();
