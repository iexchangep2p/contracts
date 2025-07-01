// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../globals/Types.sol";
import "./IOrder.sol";
import "./IOrderSig.sol";

abstract contract IOrderBotSig is IOrderSig {
    function confirmOrder(
        OrderMethodPayload calldata _method,
        bytes calldata _sig
    ) external virtual;
}
