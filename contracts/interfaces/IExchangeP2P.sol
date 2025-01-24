// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IOrder.sol";
import "./IAppeal.sol";
import "./IExchangeView.sol";
import "./IKYC.sol";
import "./IAML.sol";

abstract contract IExchangeP2P is IOrder, IAppeal, IExchangeView, IKYC, IAML {}
