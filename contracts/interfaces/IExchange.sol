// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IExchangeManager.sol";
import "./IExchangeView.sol";
import "./IOrder.sol";
import "./IOrderSig.sol";
import "./IAppeal.sol";


abstract contract IExchange is
    IOrder,
    IOrderSig,
    IAppeal,
    IExchangeView,
    IExchangeManager
{}
