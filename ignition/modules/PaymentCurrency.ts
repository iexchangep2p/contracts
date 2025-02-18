// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import IExchangeP2PModule from "./IExchangeP2P";
import { ethers } from "hardhat";

const PaymentCurrencyModule = buildModule("PaymentCurrencyModule", (m) => {
  const { managerProxy } = m.useModule(IExchangeP2PModule);
  const oneMil = BigInt(1e24);
  const currency = [
    {
      symbol: "GHS",
    },
    {
      symbol: "USD",
    },
    {
      symbol: "EUR",
    },
    {
      symbol: "NGN",
    },
    {
      symbol: "KES",
    },
  ];

  for (const c of currency) {
    m.call(
      managerProxy,
      "addCurrency",
      [ethers.hexlify(ethers.toUtf8Bytes(c.symbol)), oneMil, oneMil],
      {
        id: `addCurrency_${ethers.hexlify(ethers.toUtf8Bytes(c.symbol))}`,
      }
    );
  }

  const paymentMethods = [
    {
      name: "M-Pesa",
    },
    {
      name: "Airtel Tigo Mobile Money",
    },
    {
      name: "Fidelity Bank",
    },
    {
      name: "MTN Mobile Money",
    },
    {
      name: "Mobile Money",
    },
    {
      name: "Telecel Mobile Money",
    },
    {
      name: "Revolut",
    },
    {
      name: "Bank Transfer",
    },
    {
      name: "Zelle",
    },
    {
      name: "PerfectMoney",
    },
  ];

  for (const p of paymentMethods) {
    m.call(
      managerProxy,
      "addPaymentMethod",
      [ethers.hexlify(ethers.toUtf8Bytes(p.name)), oneMil, oneMil],
      {
        id: `addPaymentMethod_${ethers.hexlify(ethers.toUtf8Bytes(p.name))}`,
      }
    );
  }

  return { managerProxy };
});

export default PaymentCurrencyModule;
