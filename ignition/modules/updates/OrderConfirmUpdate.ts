// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { functionSelectors, FacetCutAction } from "../../lib";
import { ethers } from "hardhat";

const OrderConfirmUpdateModule = buildModule(
  "OrderConfirmUpdateModule",
  (m) => {
    const iexchangeP2P = "0x1216d8b0483493F40727ef6a95038D77062c0C35";
    const cutProxy = m.contractAt("DiamondCutFacet", iexchangeP2P);

    const oS = functionSelectors("Order");
    const o = m.contract("Order");
    const order = ["0x50d18b70"];
    const addConfirmOrder = [o, FacetCutAction.Add, order];
    const oC = [
      o,
      FacetCutAction.Replace,
      Object.values(oS).filter((s) => !order.includes(s)),
    ];

    const osS = functionSelectors("OrderSig");
    const os = m.contract("OrderSig");
    const orderSig = ["0x9699fde6"];
    const addConfirmOrderSig = [os, FacetCutAction.Add, orderSig];
    const osC = [
      os,
      FacetCutAction.Replace,
      Object.values(osS).filter((s) => !orderSig.includes(s)),
    ];

    m.call(
      cutProxy,
      "diamondCut",
      [
        [addConfirmOrder, addConfirmOrderSig, oC, osC],
        ethers.ZeroAddress,
        ethers.ZeroHash,
      ],
      { id: "IExchangeP2PDiamondCut" }
    );

    return {};
  }
);

export default OrderConfirmUpdateModule;
