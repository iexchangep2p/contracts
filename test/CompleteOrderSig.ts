import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers, ignition } from "hardhat";
import { expect } from "chai";
import { deployIExchange } from "./IExchangeDeployFixture";
import {
  encodedCreateOrder,
  iexDomain,
  iexDomainHash,
  orderSigChain,
  OrderType,
  sameChainOrder,
  signOrder,
} from "../client";

describe("Complete OrderSig", function () {
  it("Create, Pay, Release", async function () {
    const {
      kofiMerchant,
      amaTrader,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      orderSigProxy,
      iExchangeP2P,
    } = await loadFixture(deployIExchange);

    const order = sameChainOrder(
      amaTrader.address,
      kofiMerchant.address,
      await usdt.getAddress(),
      ethers.keccak256(currency),
      ethers.keccak256(paymentMethod),
      oneGrandNumber,
      OrderType.buy,
      chainId
    );

    const coder = new ethers.AbiCoder();

    const sigchain = orderSigChain(order);
    const sigchainAddress = await orderSigProxy.getAddress();
    // const domain = iexDomain(sigchain, sigchainAddress);
    // console.log(domain);
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

    const domainHash = iexDomainHash(sigchain, sigchainAddress);

    const sigchainDomainHash = await iExchangeP2P.domainSeparator();
    console.log(domainHash, sigchainDomainHash);

    // expect(domainHash).to.equal(sigchainDomainHash);
    const traderSig = await signOrder(
      order,
      amaTrader,
      sigchain,
      sigchainAddress
    );
    const merchantSig = await signOrder(
      order,
      kofiMerchant,
      sigchain,
      sigchainAddress
    );

    const traderAddress = ethers.verifyTypedData(
      domain,
      encodedCreateOrder().types,
      order,
      traderSig
    );
    expect(amaTrader.address).to.equal(traderAddress);

    const merchantAddress = ethers.verifyTypedData(
      domain,
      encodedCreateOrder().types,
      order,
      merchantSig
    );

    expect(kofiMerchant.address).to.equal(merchantAddress);

    await usdt.connect(amaTrader).approve(sigchainAddress, oneGrand);

    await orderSigProxy.createOrder(order, traderSig, merchantSig);
  });
});
