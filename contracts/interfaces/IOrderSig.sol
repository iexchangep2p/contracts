// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../globals/Types.sol";
import "./IOrder.sol";

abstract contract IOrderSig {
    enum OrderMethod {
        accept,
        pay,
        release,
        cancel,
        appeal,
        cancelAppeal,
        settleAppeal
    }

    struct OrderMethodPayload {
        bytes32 orderHash;
        OrderMethod method;
        uint256 expiry;
    }

    error InvalidOrderMethodCall();

    function createOrder(
        IOrder.CreateOrder calldata _order,
        bytes calldata _traderSig,
        bytes calldata _merchantSig
    ) external virtual;

    function acceptOrder(
        OrderMethodPayload calldata _method,
        bytes calldata _sig
    ) external virtual;

    function payOrder(
        OrderMethodPayload calldata _method,
        bytes calldata _sig
    ) external virtual;

    function releaseOrder(
        OrderMethodPayload calldata _method,
        bytes calldata _sig
    ) external virtual;

    function cancelOrder(
        OrderMethodPayload calldata _method,
        bytes calldata _sig
    ) external virtual;

    function appealOrder(
        OrderMethodPayload calldata _method,
        bytes calldata _sig
    ) external virtual;

    function cancelAppeal(
        OrderMethodPayload calldata _method,
        bytes calldata _sig
    ) external virtual;
}
