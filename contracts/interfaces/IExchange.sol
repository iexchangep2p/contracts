// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IExchangeManager.sol";
import "./IExchangeView.sol";
import "./IOrder.sol";
import "./IOrderSig.sol";
import "./IAppeal.sol";

import "./IMerchant.sol";
import "./IKYC.sol";
import "./IAML.sol";

abstract contract IExchange is
    IOrder,
    IOrderSig,
    IAppeal,
    IMerchant,
    IKYC,
    IAML,
    IExchangeView,
    IExchangeManager
{}
